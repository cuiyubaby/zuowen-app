export type GradeProfile = {
  stage: string;
  goal: string;
  canDo: string[];
  avoid: string[];
  askStyle: string;
  /** 可按学生已说内容选用或改写的问法示例，模型每次只应输出一个具体问题 */
  questionTemplates: string[];
};

export const gradeProfileMap: Record<string, GradeProfile> = {
  小学三年级: {
    stage: "小学中段起步写作",
    goal: "把一件事按顺序说清楚",
    canDo: ["描述时间地点人物", "说出事情经过", "表达简单心情"],
    avoid: ["抽象意义", "复杂感悟", "追问为什么印象深刻"],
    askStyle: "一次只问一个具体问题，优先问时间、地点、人物、动作",
    questionTemplates: [
      "这件事发生在什么时候？",
      "你当时在哪里？",
      "当时还有谁在场？",
      "第一步发生了什么？",
      "你当时做了什么？",
      "你当时开心、紧张，还是难过？",
    ],
  },
  小学四年级: {
    stage: "小学中阶习作",
    goal: "事情清楚并有简单细节",
    canDo: ["补充画面", "加入对话", "表达直接感受"],
    avoid: ["空泛感悟", "复杂议论"],
    askStyle: "多问画面和语言，少问抽象原因",
    questionTemplates: [
      "你最先注意到的一个画面是什么？",
      "当时你听到了什么声音？",
      "有人说了什么话让你记得特别清楚？",
      "你做了一个什么动作？",
      "接下来又发生了什么？",
      "那一刻你心里最直接的想法是什么？",
    ],
  },
  小学五年级: {
    stage: "小学进阶习作",
    goal: "突出重点，开始有主题意识",
    canDo: ["展开关键瞬间", "表达更完整感受"],
    avoid: ["过度哲理化"],
    askStyle: "允许追问一个最难忘的瞬间",
    questionTemplates: [
      "如果只能写一个最难忘的瞬间，会是哪一秒？",
      "那个瞬间你眼睛最先看到的是什么？",
      "那个瞬间你的手脚在做什么？",
      "在这之前发生了什么，让你印象变深了？",
      "这件事里，你最想让别人知道的一点是什么？",
    ],
  },
  小学六年级: {
    stage: "小学高阶习作",
    goal: "结构完整，有初步主题",
    canDo: ["分段表达", "围绕中心写"],
    avoid: ["直接按中考作文要求指导"],
    askStyle: "可追问‘你明白了什么’，但要具体",
    questionTemplates: [
      "你打算先写什么，再写什么，最后写什么？",
      "哪一段你想写得最细？为什么？",
      "有没有一句话可以点出你想表达的意思？",
      "事情里最打动你的一个细节是什么？",
      "结尾你想落在心情上，还是落在行动上？",
    ],
  },
  初一: {
    stage: "初中习作起步",
    goal: "叙事要素齐全，开始有简单描写",
    canDo: ["交代背景与经过", "写一两个具体画面", "写出真实感受"],
    avoid: [
      "堆砌华丽词藻",
      "空洞议论",
      "替学生下定论",
      "时评式追问（观点—理由—层层论证）",
    ],
    askStyle: "多问场景、动作、对话，少问大而空的“为什么”",
    questionTemplates: [
      "这件事或材料里，主要讲了谁？",
      "接下来发生了什么？用一两句说说就行。",
      "你准备写哪一个画面（或哪一个小镜头）？",
      "你想先写开头，还是先写最难忘的那一幕？",
      "事情是在什么背景下开始的？",
      "中间有没有一个小转折？是什么？",
      "选一个镜头：你看到了什么、听到了什么？",
      "有没有一句对话你记得特别清楚？",
      "这件事结束时，你心里是什么感觉？",
      "这件事主要讲了什么？",
      "你最想说的一句话是什么？",
    ],
  },
  初二: {
    stage: "初中习作发展",
    goal: "细节更足，有情境感和小起伏",
    canDo: ["用环境烘托心情", "写清心理变化", "让情节有一点转折"],
    avoid: ["为深刻而硬升华", "套路化结尾", "成人腔说教"],
    askStyle: "可追问转折瞬间和心里怎么想，仍要具体",
    questionTemplates: [
      "题目或材料里，已知的事实或要点是什么？你用一两句说说。",
      "你想针对哪一点表态或展开？先选一个小切口，别贪大。",
      "你打算用一个真事或场景作「由头」，还是先从材料概括入手？",
      "材料里有没有前后不一样的地方？具体是哪两处？",
      "如果选一个瞬间当作文的开头，你会选材料里的哪一幕？",
      "如果让你用一个短语当作文的“题眼”，你会选哪几个字？",
      "心情变化前，周围环境是怎样的？",
      "转折发生的那一刻，你最先注意到什么？",
      "那一刻你心里闪过什么念头？",
      "前后对比：之前你怎么想，之后呢？",
      "如果删掉一个细节，故事还成立吗？你最想保留哪个？",
    ],
  },
  初三: {
    stage: "初中习作整合",
    goal: "结构完整，立意清楚，详略得当",
    canDo: ["点题与呼应", "主次分明", "结尾自然收束"],
    avoid: ["套作万能段", "口号式感悟", "把中考评分标准念给学生听"],
    askStyle: "可追问与题目呼应的关键一句或关键细节",
    questionTemplates: [
      "材料或热议里，大家争论的核心是什么？用你自己的话概括。",
      "你的态度更清晰了吗：更同意哪一方，还是想补充第三种看法？",
      "你准备以材料信息为主，还是再举一个身边的例子？",
      "用一两句话说：材料主要在讲什么事？",
      "从材料里可以想到几种写法？你更想写哪一种（比如写一件事、写一个场面）？",
      "你打算主要用一件事写完，还是也想加一小段感受和想法？",
      "哪一段要详写才能扣住题目？",
      "有没有一句点题的话，你想放在开头还是结尾？",
      "材料里哪个细节最能支撑你的中心？",
      "结尾你想自然收束，还是轻轻点一下意义？",
      "题目里的关键词，你准备在文中哪一处呼应它？",
    ],
  },
  高一: {
    stage: "高中表达起步",
    goal: "叙事有层次，选材与角度更自觉",
    canDo: ["选择有代表性的片段", "尝试含蓄或意象化表达", "写出个人视角"],
    avoid: ["幼稚化口吻", "直白说教", "泛泛而谈“人生道理”"],
    askStyle: "可追问为何选这件事、哪个细节最能代表你的感受",
    questionTemplates: [
      "若涉及时事或公共现象，你的「由头」准备怎么写才不虚、不口号？",
      "事实层面你掌握了哪些信息？与你的观点之间，准备怎么衔接？",
      "有没有一种相反或更稳妥的声音，你想在文中点到为止地回应？",
      "材料共同的“题旨”是什么？有没有容易被忽略的限制词或提示语？",
      "你准备把立意落在一个概念上，还是落在一个具体故事里？",
      "同样能写题意，你为什么选这件事而不是别的？",
      "哪一个细节最能代表你对这件事的感受？",
      "有没有一个意象或场景，可以贯穿全文？",
      "你叙述的视角是“当时的我”还是“现在的我”？",
      "如果只要一段高潮，你会剪哪一段？",
    ],
  },
  高二: {
    stage: "高中习作进阶",
    goal: "主题可深化，语言更精当",
    canDo: ["运用对比或衬托", "写出认知变化", "控制节奏与留白"],
    avoid: ["文艺腔堆砌", "脱离生活的“金句”", "结构散乱"],
    askStyle: "可追问矛盾点、认识前后有什么不同",
    questionTemplates: [
      "若涉及时政热点：现象—原因—影响，你这一轮最想先把哪一层说透？",
      "你的立场是鲜明对立，还是倾向「有条件的认同」？先定基调。",
      "结尾更想落在提醒与建议，还是留一个问题给读者？",
      "多则材料之间，是互补、对比还是递进？主线是什么？",
      "如果只允许你选一个“主立意”，你会删去哪条次要理解？",
      "文中的矛盾或张力在哪里？",
      "认识前后，你对这件事的理解有什么变化？",
      "哪里适合略写，哪里必须展开？",
      "有没有一处留白，让读者自己体会？",
      "主题句如果只用一句，你会怎么写？",
    ],
  },
  高三: {
    stage: "高中习作高阶",
    goal: "立意准确，结构严谨，有个性而不浮夸",
    canDo: ["扣题严密", "关键段充分展开", "结尾有力且自然"],
    avoid: ["万能素材硬套", "空洞口号", "把高考作文模板当台词说给学生"],
    askStyle: "可追问主旨与材料如何呼应，仍用谈话式、一次一点",
    questionTemplates: [
      "任务类型是时评、书信、发言稿还是常规议论文？格式上你打算如何自洽？",
      "材料里有没有“陷阱立意”（看似好写但易偏题）？你如何避免？",
      "你的立意与题目要求之间，打算怎么扣紧？",
      "关键段准备用什么细节撑起观点？",
      "开头如何入题，结尾如何回扣而不口号化？",
      "有没有一条清晰的逻辑链：现象—分析—认识？",
      "如果删去一段，全文的力度会掉在哪里？",
    ],
  },
};

const defaultProfile: GradeProfile = {
  stage: "通用习作陪练",
  goal: "把经历和感受写具体、写清楚",
  canDo: ["围绕题目说清一件事", "补充可见的细节与心情"],
  avoid: ["代写整篇", "空泛说教", "一次抛多个大问题"],
  askStyle: "一次只问一个具体问题，优先问时间、地点、人物、动作与画面",
  questionTemplates: [
    "这件事大概发生在什么时候？",
    "当时你在哪里，周围有什么？",
    "接下来谁先做了什么？",
    "你印象最深的一个画面是什么？",
  ],
};

export function getGradeProfile(grade: string): GradeProfile {
  return gradeProfileMap[grade] ?? defaultProfile;
}

/**
 * 测试对照用：题干更像「完整材料评论」（A）还是「轻评论/话题命题」（B）。
 * 与 `classifyWritingPrompt` 的 material/proposition 分流独立，可不一致。
 */
export type CommentaryPromptHeuristic = "a_material" | "b_light" | "neutral";

export function commentaryPromptHeuristic(text: string): CommentaryPromptHeuristic {
  const t = text.trim();
  if (!t) return "neutral";
  const lines = t.split(/\r?\n/).filter((line) => line.trim()).length;
  const strongMaterialCue =
    /阅读下面|根据下列材料|根据以下材料|材料一|材料二|多则材料|读了上面|下列(?:文字|材料)/.test(
      t
    );
  const invitesExternalFact = /新闻|一则|近期|最近|短评|时评|结合.{0,28}(?:材料|事件|新闻|情况|了解)/.test(
    t
  );
  if (
    strongMaterialCue ||
    lines >= 3 ||
    t.length >= 220 ||
    /[「][^」]{55,}[」]|[""][^""]{55,}[""]/.test(t)
  ) {
    return "a_material";
  }
  if (
    lines <= 2 &&
    t.length <= 140 &&
    !strongMaterialCue &&
    !invitesExternalFact
  ) {
    return "b_light";
  }
  return "neutral";
}

/** 初中及以上题干的题型分流：材料作文 vs 命题/话题作文（加权，非一刀切） */
export type WritingPromptKind = "material" | "proposition_or_topic";

export function writingPromptKindLabel(kind: WritingPromptKind): string {
  return kind === "material" ? "材料作文" : "命题或话题作文";
}

/** 题型判定结果；`reason` 供服务端/本地调试，勿直接展示给终端用户 */
export type WritingPromptClassification = {
  kind: WritingPromptKind;
  reason: string[];
};

/**
 * 用多信号加权比较「像材料作文」与「像命题/话题」，得分高者胜出；平局偏向命题/话题（更常见、更安全）。
 * `reason` 逐条记录命中与最终比分，便于调权重时对照。
 */
export function classifyWritingPrompt(text: string): WritingPromptClassification {
  const reason: string[] = [];
  const t = text.trim();
  if (!t) {
    reason.push("题干为空或仅空白，默认「命题或话题作文」");
    return { kind: "proposition_or_topic", reason };
  }

  let wMaterial = 0;
  let wProp = 0;

  const lineCount = t.split(/\r?\n/).filter((line) => line.trim()).length;

  // --- 偏「材料作文」的线索（可叠加）---
  if (
    /阅读下面(?:的文字|的材料)?|根据下列材料|根据以下材料|结合(?:以上|下列)材料|综合(?:上述|以上)材料|材料一|材料二|两则材料|多则材料/.test(
      t
    )
  ) {
    wMaterial += 5;
    reason.push(
      "【材料 +5】命中「阅读下面的材料 / 根据材料 / 材料一·二」等提示语"
    );
  }
  if (/读了上面|下列(?:文字|材料)|以上(?:文字|文段|材料)/.test(t)) {
    wMaterial += 4;
    reason.push("【材料 +4】命中「读了上面 / 下列文字 / 以上材料」等套话");
  }
  if (/材料/.test(t)) {
    wMaterial += 1;
    reason.push("【材料 +1】文内出现「材料」字样");
  }
  if (lineCount >= 2) {
    wMaterial += 1;
    reason.push(`【材料 +1】多段文本（${lineCount} 段）`);
  }
  if (lineCount >= 3) {
    wMaterial += 2;
    reason.push(`【材料 +2】段数较多（≥3 段，当前 ${lineCount} 段）`);
  }
  if (t.length >= 160) {
    wMaterial += 1;
    reason.push(`【材料 +1】长度超过阈值（≥160 字，当前 ${t.length} 字）`);
  }
  if (t.length >= 280) {
    wMaterial += 2;
    reason.push(`【材料 +2】长度超过阈值（≥280 字，当前 ${t.length} 字）`);
  }
  if (t.length >= 500) {
    wMaterial += 2;
    reason.push(`【材料 +2】长度超过阈值（≥500 字，当前 ${t.length} 字）`);
  }
  if (/[“"][^“"]{45,}[”"]|[「][^」]{45,}[」]/.test(t)) {
    wMaterial += 2;
    reason.push("【材料 +2】含较长引号片段（像摘抄语段）");
  }
  if (/有人说|有人认为|常言道|一位.*(?:说|写道)/.test(t) && t.length >= 90) {
    wMaterial += 1;
    reason.push("【材料 +1】含「有人说/有人认为」等引述且篇幅较长");
  }
  if (
    /短评|时评|热议|网友|舆论|新闻报道|新闻事件|通报|(?:引发|掀起).{0,8}(?:讨论|关注)|表明你的观点|结合.{0,28}(?:材料|事件|新闻|情况|了解)|对(?:此|这件事)|写一篇(?:短评|评论)/.test(
      t
    )
  ) {
    wMaterial += 3;
    reason.push("【材料 +3】命中强时事 / 自备材料 / 评论任务类表述");
  } else if (
    /你怎么看|谈谈你的看法/.test(t) &&
    (t.length >= 72 || /材料|事件|现象|上述|以下|读了|下列/.test(t))
  ) {
    wMaterial += 1;
    reason.push(
      "【材料 +1】含「你怎么看/谈谈看法」且题干偏长或含材料语境词（避免短名言+你怎么看误判为长材料）"
    );
  }

  // --- 偏「命题/话题作文」的线索 ---
  if (t.length <= 42 && lineCount <= 1) {
    wProp += 2;
    reason.push(
      `【命题 +2】单行短文本（≤42 字且单段，当前 ${t.length} 字）`
    );
  }
  if (t.length <= 22) {
    wProp += 2;
    reason.push(`【命题 +2】更短题干（≤22 字，当前 ${t.length} 字）`);
  }
  if (/^(请以|题目[:：]|请以《)/.test(t) && t.length < 130) {
    wProp += 2;
    reason.push("【命题 +2】命中「请以… / 题目： / 请以《」等命题起笔");
  }
  if (/以「[^」]+」为(题目|话题)|以《[^》]+》为(题|题目)/.test(t)) {
    wProp += 2;
    reason.push("【命题 +2】命中「以……为题 / 为话题」结构");
  }
  if (/半命题|横线|_{4,}|\uFF3F{3,}/.test(t)) {
    wProp += 2;
    reason.push("【命题 +2】半命题或横线占位（____ / 半命题 / 横线）");
  }
  if (/话题作文|命题作文/.test(t) && t.length < 160) {
    wProp += 1;
    reason.push("【命题 +1】出现「话题作文/命题作文」且篇幅不长");
  }
  if (!/阅读下面|根据以下材料|材料一|材料二/.test(t) && /话题/.test(t) && t.length < 95) {
    wProp += 2;
    reason.push("【命题 +2】含「话题」、无强材料引导语且篇幅较短");
  }

  /** 轻评论命题（B 类倾向）：短题干、无「阅读材料」或自备新闻等强信号 */
  if (
    lineCount <= 2 &&
    t.length <= 140 &&
    !/阅读下面|根据下列材料|根据以下材料|材料一|材料二|多则材料|读了上面|下列(?:文字|材料)|新闻报道|新闻事件|短评|时评|(?:引发|掀起).{0,8}(?:讨论|关注)|结合.{0,28}(?:材料|事件|新闻|情况|了解)|一则新闻|最近.{0,12}新闻|近期.{0,10}新闻/.test(
      t
    ) &&
    (/围绕[^。\n]{0,24}谈谈|谈谈你的理解|谈谈你的认识|你怎么看|有人说|有人认为/.test(
      t
    ))
  ) {
    wProp += 4;
    reason.push("【命题 +4】轻评论/话题式短文（B 类倾向），无强材料或自备事实引导");
  }

  // 仅出现「材料」二字但整体很短、且无多段，更像命题说明而非长材料
  if (/材料/.test(t) && t.length < 70 && lineCount <= 1) {
    wMaterial -= 1;
    wProp += 1;
    reason.push(
      "【调整】短文单行且含「材料」：材料侧 −1、命题侧 +1（削弱误伤长材料判定）"
    );
  }

  const kind: WritingPromptKind =
    wMaterial > wProp ? "material" : "proposition_or_topic";
  if (wMaterial > wProp) {
    reason.push(
      `【判定】${writingPromptKindLabel(kind)}（材料 ${wMaterial} > 命题 ${wProp}）`
    );
  } else if (wMaterial === wProp) {
    reason.push(
      `【判定】${writingPromptKindLabel(kind)}（${wMaterial} 持平，规则偏向命题/话题）`
    );
  } else {
    reason.push(
      `【判定】${writingPromptKindLabel(kind)}（材料 ${wMaterial} ≤ 命题 ${wProp}）`
    );
  }

  return { kind, reason };
}

/** 是否缺少「事」：须先追问发生了什么，再进入画面细化 */
export function answerNeedsWhatHappenedFirst(userInput: string): boolean {
  const t = userInput.replace(/\s/g, "").trim();
  if (!t) return false;
  if (t.length < 10) return true;
  if (t.length > 22) return false;
  return !hasMinimalEventOrActionHint(t);
}

/**
 * 第二层分流：当前这轮是否适合问「为什么」。
 * 只有先说清基本事件，且出现可追问原因/感受的锚点，才允许进入 why 类问题。
 */
export function shouldAskWhy(userInput: string): boolean {
  const t = userInput.replace(/\s/g, "").trim();
  if (!t) return false;
  if (answerNeedsWhatHappenedFirst(t)) return false;
  if (t.length < 20) return false;
  const progress = assessNarrativeProgress(t);
  if (!progress.eventComplete) return false;
  if (!progress.detailStarted) return false;

  return /印象|难忘|感受|感觉|心里|心情|觉得|感到|触动|明白|意识到|后悔|开心|难过|紧张|害怕|委屈|自豪|敬佩|生气|感动/.test(t);
}

/** 含可展开为记叙主干的动作、变化或过程提示（非仅人名/身份堆叠） */
function hasMinimalEventOrActionHint(s: string): boolean {
  return (
    /[了着过起来下去]|之后|然后|接着|突然|结果|终于|于是|因为|所以|但是|可是|后来|一开始|最后/.test(
      s
    ) ||
    /去|来|走|跑|说|讲|喊|骂|吵|笑|哭|做|干|弄|写|画|读|看|听|找|接|送|拿|放|借|还|买|卖|吃|喝|睡|醒|穿|脱|打|踢|玩|闹|帮|扶|拉|推|抱|背|抬|跳|摔|碰|撞|等|坐|站|离开|回到|赶到|遇见|看见|听见|学会|发现|决定|答应|拒绝|参加|离开|进入/.test(
      s
    ) ||
    /[怎什为啥哪多么几多少怎样如何]/u.test(s)
  );
}

export type NarrativeProgress = {
  eventComplete: boolean;
  detailStarted: boolean;
  actionKeywords: string[];
};

/** 粗粒度判定：事件是否说清、是否已经进入画面细化，并抽取已出现动作词用于防重复追问。 */
export function assessNarrativeProgress(userInput: string): NarrativeProgress {
  const t = userInput.replace(/\s/g, "").trim();
  const actionKeywords = extractActionKeywords(t);
  const hasEventScaffold =
    hasMinimalEventOrActionHint(t) &&
    (/[，。；？！]/.test(t) || /后来|然后|接着|结果|最后|于是/.test(t) || actionKeywords.length >= 2);
  const eventComplete = !!t && !answerNeedsWhatHappenedFirst(t) && hasEventScaffold;
  const detailStarted =
    /看见|看到|听见|听到|闻到|摸到|颜色|声音|表情|动作|对话|一句话|细节|画面|当时|那一刻|突然|立刻|赶紧|慢慢|一边/.test(
      t
    ) && t.length >= 18;

  return {
    eventComplete,
    detailStarted,
    actionKeywords,
  };
}

function extractActionKeywords(s: string): string[] {
  const regex =
    /跑来|跑去|走来|递来|递给|递过|接过|拿起|放下|看见|听到|等着|坐下|站起来|离开|回到|赶到|遇见|听见|学会|发现|决定|答应|拒绝|参加|进入|起来|下去|然后|后来|接着|结果|终于|于是|去|来|走|跑|说|讲|喊|哭|笑|做|写|读|看|听|找|拿|放|借|还|买|卖|吃|喝|穿|脱|打|玩|帮|扶|拉|推|抱|背|抬|跳|摔|碰|撞|等|坐|站/g;
  const matches = s.match(regex) ?? [];
  const unique: string[] = [];
  for (const m of matches) {
    if (!unique.includes(m)) unique.push(m);
    if (unique.length >= 8) break;
  }
  return unique;
}

/**
 * 本轮学生回答里出现的、且已落在 actionKeywords 集合中的动作（长词优先，避免「跑」盖住「跑来」重复出现）。
 */
export function findCurrentTurnActionsInKeywordSet(
  userSaid: string,
  actionKeywords: string[]
): string[] {
  const t = userSaid.replace(/\s/g, "").trim();
  if (!t || actionKeywords.length === 0) return [];
  const sorted = [...new Set(actionKeywords)].sort(
    (a, b) => b.length - a.length
  );
  const out: string[] = [];
  for (const kw of sorted) {
    if (!kw || !t.includes(kw)) continue;
    if (out.some((x) => x.includes(kw))) continue;
    out.push(kw);
  }
  return out.slice(0, 5);
}

export function isJuniorHighOrHighSchool(grade: string): boolean {
  return grade.includes("初") || grade.includes("高");
}
