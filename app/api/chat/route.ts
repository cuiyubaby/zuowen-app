import { getGradeProfile, gradeProfileMap } from "@/lib/gradeProfile";

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
    upgradeMessage: "免费次数已用完，开通会员可继续解锁好句润色与深度建议。",
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, grade, userInput, clientUsageCount } = body;
    const gradeKey = typeof grade === "string" ? grade.trim() : "";
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
6. 只有初中及以上，才可以逐步追问“为什么印象深刻”。
7. 只有高中阶段，才可以引导立意、结构和观点。
8. 每次只问一个问题，不要把多个问题合在一句里。
9. 问题必须具体、可回答，不能抽象或泛化。
10. 优先围绕学生刚刚说的内容继续追问，不要跳到新的方向。
11. 如果学生回答很少（一句话或几个词），要进一步拆小问题。
12. 如果学生已经说得比较完整，可以轻微引导补充细节，但仍只问一个点。
13. 不要重复上一轮已经问过的问题。
14. 小学三、四年级优先直接使用「推荐提问模板」中的原句，只有在学生已经说得较完整时才允许轻微改写。
15. 对小学阶段，如果学生回答很简单，你可以把他的回答重复一遍并稍作整理，然后再问下一个问题。
16. 对小学阶段，必须按顺序提问：先问时间/地点 → 再问开始 → 再问经过 → 最后才允许问简单感受。不能跳步骤。

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
${promptRule ? `\n${promptRule}` : ""}
`.trim();

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey?.trim()) {
      console.error("ZHIPU_API_KEY is missing or empty");
      return Response.json(
        buildFallbackPayload(
          gradeKey,
          userInput,
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
              content: `作文题目：${title}\n\n学生刚刚说：${userInput}\n\n请按系统提示中的能力档案与规则，输出一个严格 JSON：既要继续追问一句，也要给出当前可用提纲、好句和修改建议。`,
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
          userInput,
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
          userInput,
          "智谱返回了空内容，可能是接口临时异常或模型响应格式变化。请稍后重试；若反复出现，请查看服务端日志。",
          clientUsageCount
        )
      );
    }

    const quotaMeta = getQuotaMeta(clientUsageCount);
    const parsedPayload = tryParseModelJson(content);
    if (!parsedPayload) {
      return Response.json(
        buildFallbackPayload(gradeKey, userInput, content, clientUsageCount)
      );
    }

    return Response.json({
      reply:
        parsedPayload.reply ||
        "我知道了，你可以再多说一点当时的画面和感受吗？",
      outline:
        parsedPayload.outline || getOutlineText(gradeKey, userInput),
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
