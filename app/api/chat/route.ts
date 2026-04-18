import {
  assessNarrativeProgress,
  answerNeedsWhatHappenedFirst,
  classifyWritingPrompt,
  commentaryPromptHeuristic,
  findCurrentTurnActionsInKeywordSet,
  getGradeProfile,
  gradeProfileMap,
  shouldAskWhy,
  writingPromptKindLabel,
  type WritingPromptKind,
} from "@/lib/gradeProfile";

type MessageRole = "assistant" | "user";
type RecentMessage = { role: MessageRole; content: string };

type CoachingPayload = {
  reply: string;
  outline: string;
  goodSentence: string;
  suggestion: string;
  remainingQuota: number;
  freeLimit: number;
  isPremiumLocked: boolean;
  upgradeMessage: string;
};

const FREE_LIMIT = 6;

function getOutlineText(grade: string, input: string) {
  if (grade.includes("小学")) {
    return `
【写作提纲】
1. 开头：介绍一下你要写的这件事。
2. 经过：说清楚 ${input} 是怎么发生的。
3. 细节：写一个你最难忘的画面。
4. 结尾：说说你的心情或者收获。
    `;
  }

  if (grade.includes("初")) {
    return `
【写作提纲】
1. 开头：点明你要写的事件，并简单交代背景。
2. 经过：围绕 ${input} 写清楚事情的发展过程。
3. 细节：突出一个最打动你的画面、动作或语言。
4. 感受：写出这件事带给你的真实感受。
5. 结尾：总结这件事对你的意义。
    `;
  }

  return `
【写作提纲】
1. 开头：用简洁的方式引出这件事，并埋下主题。
2. 经过：围绕 ${input} 梳理事件过程，注意层次。
3. 重点场景：展开最关键的一个瞬间，写出细节与张力。
4. 思考：分析这件事为什么触动了你，它带来了什么认识。
5. 结尾：回扣题目，升华主题，体现成长或变化。
  `;
}

function getGoodSentence(grade: string) {
  if (grade.includes("小学")) {
    return "那天阳光暖暖的，我心里像开出了一朵小花。";
  }
  if (grade.includes("初")) {
    return "那个瞬间像一束光，突然照进了我原本懵懂的心里。";
  }
  return "那一刻并不喧哗，却像一枚细小的钉子，悄悄把成长钉进了我的记忆深处。";
}

function getSuggestion(grade: string) {
  if (grade.includes("小学")) {
    return "多写一写你看到的、听到的和当时的心情。";
  }
  if (grade.includes("初")) {
    return "可以再补一个更具体的画面，让文章更生动。";
  }
  return "可以进一步强化关键细节，并让结尾更自然地回扣主题。";
}

/** A/B 形态：不新增题型代号，供模型与人工测试对照。 */
function commentaryShapeGuidance(titleText: string): string {
  const t = titleText.trim();
  const h = commentaryPromptHeuristic(t);
  const inviteFact = /新闻|一则|近期|最近|短评|时评|结合.{0,28}(?:材料|事件|新闻|情况|了解)/.test(
    t
  );

  if (h === "a_material") {
    return `
题干形态（对照测试 **A 类**）：题干含**完整材料、多段信息或长引语** → 前几轮先**读清材料**（人事、情形、关键句或矛盾），再一起**定切口**；不要跳步逼「中心论点」，也不要一上来空泛价值判断。`.trim();
  }
  if (h === "b_light") {
    return `
题干形态（对照测试 **B 类**）：仅有**价值词、话题词、短引子** → **不必**逐段概括长材料、不必套「读材料」口吻；优先**题眼**、一句话态度或倾向，并用**一件小事或具体场景**落地；可先定切口再展开。`.trim();
  }
  if (inviteFact) {
    return `
题干形态（A/B 之间或**自备事实**）：若题目要求学生自带新闻/材料 → 先问清**写哪一件、主要讲了什么**，再往下谈看法；**不要**直接上大词价值判断。`.trim();
  }
  return `
题干形态（**A/B 分界**）：有「阅读材料」、多段节选或很长引文则偏 **A**；仅有短名言、话题词、「围绕××谈谈」则偏 **B**。`.trim();
}

/** 题干或学生表述疑似时事/短评时，给初二及以上额外策略（不替代题型分流）。 */
function currentAffairsGuidanceBlock(
  gradeKey: string,
  titleText: string,
  userSaid: string
): string {
  if (!/初二|初三|高/.test(gradeKey)) return "";
  if (commentaryPromptHeuristic(titleText) === "b_light") return "";

  const haystack = `${titleText}\n${userSaid}`;
  if (
    !/短评|时评|热议|网友|舆论|新闻报道|新闻事件|通报|(?:引发|掀起).{0,8}(?:讨论|关注)|你怎么看|谈谈你的看法|表明你的观点|结合.{0,28}(?:材料|事件|新闻|情况|了解)|对(?:此|这件事)|写一篇(?:短评|评论)|公共议题|时事|热点/.test(
      haystack
    )
  ) {
    return "";
  }
  return `
时事 / 热点 / 短评补充（本次疑似相关，强制参考）：
- 先帮学生分清**已知事实/材料信息**与**个人态度**，再引导**一个小切口**（具体对象、可核对的信息或一个可操作的点），避免一上来喊大而空的口号。
- 初二、初三可用**由头（一件事或一幕）+ 夹叙夹议**；不必写成标准议论文三段式。高中可走**由头—分析—态度—收束**，仍一次只推进一点；高一材料评论可自然走到**材料核心 → 展开点 → 态度**，每次只推进一步。
- 与规则 17–19 的关系：若学生仍说不清「发生了什么/材料在讲什么」，仍以补事实、补由头为主；待事实或材料要点清楚后，再进入观点与理由。`.trim();
}

/** 初中 / 高中在「材料作文」「命题或话题」上的引导力度不同：初中避免过早上价值与论证。 */
function buildSecondaryStrategyRule(
  gradeKey: string,
  promptKind: WritingPromptKind
): string {
  const isJunior = gradeKey.includes("初");
  const isHigh = gradeKey.includes("高");
  if (!isJunior && !isHigh) return "";

  if (promptKind === "material") {
    if (isJunior) {
      const juniorAffairsLine = /初二|初三/.test(gradeKey)
        ? "\n- 若材料或题目明显涉及时事、热议、短评、新闻评论：先把「材料要点/事实信息」与「你想展开的一点」分开；允许用真事或场景作由头、夹叙夹议，切口要小，避免空泛议论腔与口号。"
        : "";
      return `
初中（本次按「材料作文」思路，强制遵守）：
- 系统已加权判定为材料作文。前 1–3 轮「读材料」请落在**具体人、事、情形**：讲了谁、发生了什么事（或什么处境）、材料里最关键的一句或一幕在哪里；然后问**你准备从哪个小角度**把它写成**记叙文或感受文**（切口要小、写得出来）。${juniorAffairsLine}
- **不要**在初一、初二阶段用「价值倾向」「价值取向」「立场对不对」「人生哲理」「论证方向」等提问压学生；少用「核心观点」逼学生下判断。初三也先把人事、场景与切口说清，再自然点题，避免一上来议论文腔。
- 需要概括时，用「材料主要在讲一件什么事」这类说法，而不是要求学生提炼「中心论点」。
- 学生选好切口后，再按能力档案追问细节与感受；不要把高中才有的议论层次提前塞给初中。
- JSON「outline」：若在读材料阶段，可先列「人物与事由」「我的写作角度/切口」，再逐步列成文结构。
`.trim();
    }
    return `
高中（本次按「材料作文」思路，强制遵守）：
- 系统已加权判定为材料作文。在读懂材料（对象、关系、关键语句或矛盾）的基础上，可逐步收紧：**材料核心观点**、**价值取向**与**论证方向**，每次只推进一点，并与任务型要求（书信、发言稿等）对齐。
- 仍可先帮学生定小切口，但允许比初中更早进入立意与议论层次。
- JSON「outline」：可读材料要点、立意与论证提纲、成文结构。
`.trim();
  }

  if (isJunior) {
    return `
初中（本次按「命题或话题作文」思路，强制遵守）：
- 系统已加权判定为命题或话题作文。优先**题眼**、写作范围与可写边界；半命题先商量补题是否贴切；话题作文先定**记叙或感受类的小切口**，避免空泛铺陈。
- 不要把题干误当长材料逐句概括；**B 类轻评论题**（短话题、短名言）前 1–3 轮以**题眼、一件具体小事或场景**为主，不必假装在读长文。**不要**过早追问「价值倾向」「论证方向」。
- 若学生额外粘贴了大段引文，再切换为读材料式提问。
- JSON「outline」可先列「题眼与范围」「选定的人/事/感受切口」，再列成文结构。
- 高中才系统展开议论文论证；初中以叙事、感受类展开为主，避免空泛说教。
`.trim();
  }

  return `
高中（本次按「命题或话题作文」思路，强制遵守）：
- 系统已加权判定为命题或话题作文。优先题眼、写作边界与任务指令；可更快与学生对齐**立意**、**价值取向**及**论证方向**（仍一次只推进一点）。
- 不要把题干误当长材料逐句概括；若学生另贴大段引文，再按读材料处理。
- JSON「outline」可先列「题眼与范围」「立意与论证方向」「成文结构」。
`.trim();
}

function getQuotaMeta(clientUsageCount: unknown) {
  const usedBeforeCurrent =
    typeof clientUsageCount === "number" && Number.isFinite(clientUsageCount)
      ? Math.max(0, Math.floor(clientUsageCount))
      : 0;
  const usedAfterCurrent = usedBeforeCurrent + 1;
  const remainingQuota = Math.max(FREE_LIMIT - usedAfterCurrent, 0);
  const isPremiumLocked = usedAfterCurrent > FREE_LIMIT;

  return {
    remainingQuota,
    isPremiumLocked,
    freeLimit: FREE_LIMIT,
    upgradeMessage:
      "免费次数已用完，开通会员后还能解锁更多亮眼句子和改文小提醒。",
  };
}

function buildFallbackPayload(
  grade: string,
  userInput: string,
  reply: string,
  clientUsageCount: unknown
): CoachingPayload {
  const quotaMeta = getQuotaMeta(clientUsageCount);
  return {
    reply,
    outline: getOutlineText(grade, userInput),
    goodSentence: quotaMeta.isPremiumLocked ? "" : getGoodSentence(grade),
    suggestion: quotaMeta.isPremiumLocked ? "" : getSuggestion(grade),
    ...quotaMeta,
  };
}

function tryParseModelJson(raw: string): Partial<CoachingPayload> | null {
  const text = raw.trim();
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() || text;

  try {
    const parsed = JSON.parse(candidate) as Record<string, unknown>;
    return {
      reply:
        typeof parsed.reply === "string"
          ? parsed.reply.trim()
          : typeof parsed.nextQuestion === "string"
            ? parsed.nextQuestion.trim()
            : "",
      outline: typeof parsed.outline === "string" ? parsed.outline.trim() : "",
      goodSentence:
        typeof parsed.goodSentence === "string"
          ? parsed.goodSentence.trim()
          : "",
      suggestion:
        typeof parsed.suggestion === "string" ? parsed.suggestion.trim() : "",
    };
  } catch {
    return null;
  }
}

function normalizeRecentMessages(input: unknown): RecentMessage[] {
  if (!Array.isArray(input)) return [];
  const items: RecentMessage[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role === "assistant" || role === "user") && typeof content === "string") {
      const text = content.trim();
      if (!text) continue;
      items.push({ role, content: text });
    }
  }
  return items.slice(-8);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, grade, userInput, clientUsageCount, recentMessages } = body;
    const gradeKey = typeof grade === "string" ? grade.trim() : "";
    const userSaid =
      typeof userInput === "string"
        ? userInput
        : userInput == null
          ? ""
          : String(userInput);
    const titleText = typeof title === "string" ? title : "";
    const normalizedRecentMessages = normalizeRecentMessages(recentMessages);
    const recentUserText = normalizedRecentMessages
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content)
      .join(" ");
    const progress = assessNarrativeProgress(`${recentUserText} ${userSaid}`.trim());
    const promptClassification = classifyWritingPrompt(titleText);
    const promptKind = promptClassification.kind;
    const promptKindLabel = writingPromptKindLabel(promptKind);
    if (process.env.NODE_ENV === "development") {
      console.info("[classifyWritingPrompt]", {
        kind: promptClassification.kind,
        reason: promptClassification.reason,
      });
    }

    const needsWhatHappenedFirst = answerNeedsWhatHappenedFirst(userSaid);
    const shouldAskWhyNow = shouldAskWhy(`${recentUserText} ${userSaid}`.trim());
    const whatHappenedBlock = needsWhatHappenedFirst
      ? `\n【须先补事】学生本轮回答过简（少于10个字，或几乎只交代人物/身份而看不出发生了什么事）。你输出的「reply」必须在三种问法中择一：1）后来发生了什么？2）接着怎么样了？3）当时的具体过程是什么？此阶段禁止任何“为什么”类提问，也不得问画面细化或最难忘一幕长什么样。\n`
      : "";
    const whyGateBlock = shouldAskWhyNow
      ? `\n【可问为什么】学生已说清基本事件，且出现了可追问感受/原因的锚点。你可以在合适时问一次「为什么印象深刻」或「为什么会有这种感受」，但仍要具体、一次只问一个。\n`
      : `\n【暂不问为什么】当前这轮还不适合 why 类追问。请继续补全事件经过、动作变化或关键情节，不要问“为什么”。\n`;
    const stageBlock = !progress.eventComplete
      ? `\n【阶段：补事件主干】学生还没把事情说完整。下一问必须用于补“后来发生了什么/接着怎样/具体过程”，不要停留在时间地点，也不要先问画面细节。\n`
      : !progress.detailStarted
        ? `\n【阶段：进入画面】学生已说出事件主干。下一问应引导其选一个具体画面或镜头展开（人物动作/一句对话/关键瞬间）。\n`
        : `\n【阶段：细化画面】学生已开始细节描写。下一问继续深挖该画面的动作、语言、感官或前后变化，不要回退到重复确认同一动作是否发生。\n`;
    const antiRepeatActionBlock =
      progress.actionKeywords.length > 0
        ? `\n【避免重复追问动作】学生已提到动作词：${progress.actionKeywords.join("、")}。不要重复问这些动作“有没有发生/是不是这样”，应推进到下一步、结果或更细节。\n`
        : "";
    const statedActionsThisTurn = findCurrentTurnActionsInKeywordSet(
      userSaid,
      progress.actionKeywords
    );
    const repeatActionHardBlock =
      !progress.detailStarted && statedActionsThisTurn.length > 0
        ? `\n【禁止重复动作：${statedActionsThisTurn.join("、")}】学生本轮回答里已明确出现上述动作，且这些动作已在已知动作词集合中。本轮**禁止**继续追问该动作本身是否发生、或围绕同一动作反复确认。必须改问：**这个动作之后发生了什么**、**结果如何**、**下一步或后续变化**。\n【优先追问：后来发生了什么 / 接下来怎样了 / 最后结果如何】\n`
        : "";
    const conversationBlock =
      normalizedRecentMessages.length > 0
        ? `\n最近对话（按时间顺序，供你避免重复）：\n${normalizedRecentMessages.map((msg, idx) => `${idx + 1}. ${msg.role === "assistant" ? "老师" : "学生"}：${msg.content}`).join("\n")}\n`
        : "";
    const profile = gradeProfileMap[gradeKey] ?? getGradeProfile(gradeKey);
    const gradeLine = gradeKey
      ? `正在辅导${gradeKey}学生写作文。`
      : `正在辅导中小学生写作文。`;

    let promptRule = "";
    if (gradeKey.includes("小学")) {
      promptRule = `
小学阶段（具体回忆型提问，强制遵守）：
你只能问具体问题。
不要问意义，不要问启发，不要问为什么印象深刻。
你要帮助孩子先把事情顺着说出来。
一次只问一个问题。
`.trim();
    }

    const isJuniorOrSenior =
      gradeKey.includes("初") || gradeKey.includes("高");
    const secondaryStrategyRule = isJuniorOrSenior
      ? buildSecondaryStrategyRule(gradeKey, promptKind)
      : "";
    const affairsGuidanceRule = currentAffairsGuidanceBlock(
      gradeKey,
      titleText,
      userSaid
    );
    const shapeGuidanceRule =
      isJuniorOrSenior && titleText.trim()
        ? commentaryShapeGuidance(titleText)
        : "";

    const questionTemplatesBlock =
      profile.questionTemplates.length > 0
        ? `\n- 推荐提问模板（结合学生已说内容选用或改写，每次只问一个）：\n${profile.questionTemplates.map((q) => `  · ${q}`).join("\n")}`
        : "";

    const systemPrompt = `
你是一名中国语文老师，${gradeLine}

当前学生能力档案：
- 学习阶段：${profile.stage}
- 本次目标：${profile.goal}
- 这个年级通常能做到：${profile.canDo.join("、")}
- 这个年级不要要求：${profile.avoid.join("、")}
- 提问方式：${profile.askStyle}${questionTemplatesBlock}

规则：
1. 不要直接代写整篇作文。
2. 每次只推进一步。
3. 每次最多问1个问题，最多2句。
4. 小学生：只围绕「发生了什么、看到了什么、说了什么、做了什么」做具体回忆；系统提示末尾若附有「具体回忆型提问」强制条款（仅小学），须严格遵守。
5. 初中生及以上才可以适度追问「感受」。
6. 只有初中及以上，才可以逐步追问“为什么印象深刻”；但在学生尚未完整说清「发生了什么」之前，**禁止**任何“为什么”类提问。
7. 只有高中阶段，才可以系统使用「价值取向」「论证方向」等表述并展开议论文立意与论证结构。初中在「材料作文」下先落实**谁、何事、何种记叙/感受切口**；在「命题或话题作文」下先抓题眼与可写范围，**不要**过早把初一初二拉到价值判断与议论高度（遵守上文分年级「本次题型思路」）。
8. 每次只问一个问题，不要把多个问题合在一句里。
9. 问题必须具体、可回答，不能抽象或泛化。
10. 优先围绕学生刚刚说的内容继续追问，不要跳到新的方向。
11. 如果学生回答很少（一句话或几个词），要进一步拆小问题。
12. 如果学生已经说得比较完整，可以轻微引导补充细节，但仍只问一个点。
13. 不要重复上一轮已经问过的问题。
14. 小学三、四年级优先直接使用「推荐提问模板」中的原句，只有在学生已经说得较完整时才允许轻微改写。
15. 对小学阶段，如果学生回答很简单，你可以把他的回答重复一遍并稍作整理，然后再问下一个问题。
16. 对小学阶段，必须按顺序提问：先问时间/地点 → 再问开始 → 再问经过 → 最后才允许问简单感受。不能跳步骤。
17. **过简回答强制顺序**：若用户消息中出现【须先补事】标注，或学生回答有效字数少于10个字、或仅堆叠人物/身份而看不出发生了任何动作或变化，你下一轮**必须**优先问这三类之一：①「后来发生了什么」②「接着怎么样了」③「当时的具体过程是什么」；每次只问一个。此阶段**禁止**任何“为什么”类提问，且**禁止**直接切入画面细化（颜色、声音、镜头、最难忘的一幕具体长什么样）、感官堆叠或议论；待学生至少用一句说出**可当作记叙主干的一件小事或一个动作/变化**后，再进入画面与细节。若与规则16冲突，以本条及【须先补事】标注为准。
18. **第二层分流（why 开关）**：若用户消息中出现【暂不问为什么】标注，则本轮严禁“为什么”类提问；仅当出现【可问为什么】标注（代表“事件主干已完整 + 已开始画面细化”）时，才允许按规则6进行一次 why 类追问。未出现【可问为什么】时，默认先补事实经过或细化画面。
19. **避免动作追问打转**：不要重复围绕同一个动作反复确认；应优先推进**时间顺序**（后来、接着、最后）或**过程链条**（下一步怎样、结果如何、后来又怎样）。

输出要求（必须严格遵守）：
1. 只输出 JSON，不要输出任何额外解释文字或 markdown 代码块。
2. JSON 格式如下：
{
  "reply": "下一步只问一个具体问题，最多2句",
  "outline": "根据学生刚刚提供的信息整理出的提纲，3-5条",
  "goodSentence": "1句可直接借鉴的好句",
  "suggestion": "1条最关键的修改建议"
}
3. 字段都必须是字符串且不能为空。
${secondaryStrategyRule ? `\n${secondaryStrategyRule}` : ""}
${shapeGuidanceRule ? `\n${shapeGuidanceRule}` : ""}
${affairsGuidanceRule ? `\n${affairsGuidanceRule}` : ""}
${promptRule ? `\n${promptRule}` : ""}
`.trim();

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey?.trim()) {
      console.error("ZHIPU_API_KEY is missing or empty");
      return Response.json(
        buildFallbackPayload(
          gradeKey,
          userSaid,
          "当前服务还没配置智谱 API 密钥（环境变量 ZHIPU_API_KEY）。请在服务器 .env.local 里填写有效 key 后重启项目。",
          clientUsageCount
        )
      );
    }

    const response = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `本次作文题目或材料：${title}\n系统题型判定（题干加权）：${promptKindLabel}\n${whatHappenedBlock}${whyGateBlock}${stageBlock}${antiRepeatActionBlock}${repeatActionHardBlock}${conversationBlock}\n学生刚刚说：${userSaid}\n\n请按系统提示中的能力档案、题型思路与规则，输出一个严格 JSON：既要继续追问一句，也要给出当前可用提纲、好句和修改建议。`,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string; code?: string };
      message?: string;
    };

    if (!response.ok) {
      const detail =
        data?.error?.message ||
        data?.message ||
        `HTTP ${response.status}`;
      console.error("Zhipu API HTTP error:", response.status, data);
      return Response.json(
        buildFallbackPayload(
          gradeKey,
          userSaid,
          `暂时接不上智谱接口：${detail}。请检查 ZHIPU_API_KEY 是否有效、账户是否有余额或模型是否可用。`,
          clientUsageCount
        )
      );
    }

    const raw = data?.choices?.[0]?.message?.content;
    const content =
      typeof raw === "string" ? raw.trim() : "";

    if (!content) {
      console.error("Zhipu API missing message content:", data);
      return Response.json(
        buildFallbackPayload(
          gradeKey,
          userSaid,
          "智谱返回了空内容，可能是接口临时异常或模型响应格式变化。请稍后重试；若反复出现，请查看服务端日志。",
          clientUsageCount
        )
      );
    }

    const quotaMeta = getQuotaMeta(clientUsageCount);
    const parsedPayload = tryParseModelJson(content);
    if (!parsedPayload) {
      return Response.json(
        buildFallbackPayload(gradeKey, userSaid, content, clientUsageCount)
      );
    }

    return Response.json({
      reply:
        parsedPayload.reply ||
        "我知道了，你可以再多说一点当时的画面和感受吗？",
      outline:
        parsedPayload.outline || getOutlineText(gradeKey, userSaid),
      goodSentence:
        quotaMeta.isPremiumLocked
          ? ""
          : parsedPayload.goodSentence || getGoodSentence(gradeKey),
      suggestion:
        quotaMeta.isPremiumLocked
          ? ""
          : parsedPayload.suggestion || getSuggestion(gradeKey),
      ...quotaMeta,
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      buildFallbackPayload(
        "",
        "",
        "出了点小问题，我们再试一次吧。",
        0
      ),
      { status: 500 }
    );
  }
}
