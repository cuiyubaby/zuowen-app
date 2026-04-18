/** 陪练页 UI 文案按学段分档：小学偏陪伴，初中自然不幼，高中简洁成熟 */

export type SchoolTier = "elementary" | "junior" | "senior";

export type CoachUiCopy = {
  pageTitle: string;
  backHome: string;
  topicLabel: string;
  noTitleYet: string;
  /** 初中及以上，题型提示开头（接「材料作文」等标签） */
  materialHintLead: string;
  /** 初中及以上，材料作文提示后半句 */
  materialHintWhenMaterial: string;
  /** 初中及以上，命题/话题提示后半句 */
  materialHintWhenTopic: string;
  progressTitle: string;
  /** 右侧次数说明，含剩余与总额 */
  progressFree: (remaining: number, total: number) => string;
  steps: [string, string, string, string];
  chatSectionTitle: string;
  chatEmpty: string;
  chatLoading: string;
  quickReplyLabel: string;
  inputPlaceholder: string;
  sendLoading: string;
  sendLocked: string;
  sendDefault: string;
  asideTitle: string;
  tabOutline: string;
  tabSentence: string;
  tabSuggestion: string;
  asideEmpty: string;
  panelOutline: string;
  panelSentence: string;
  panelSuggestion: string;
  lockSentence: string;
  lockSuggestion: string;
  errorRetry: string;
  /** 作文稿区域标题 */
  draftSectionTitle: string;
  draftPlaceholder: string;
  draftHint: string;
  /** 进入独立顺稿页 */
  polishCta: string;
  /** 字数不足时的提示，参数为还差的字数（估算展示用） */
  polishNeedMore: (moreChars: number) => string;
};

export function getSchoolTier(grade: string): SchoolTier {
  if (grade.includes("高")) return "senior";
  if (grade.includes("初")) return "junior";
  return "elementary";
}

export function getCoachUiCopy(grade: string): CoachUiCopy {
  const tier = getSchoolTier(grade);
  if (tier === "senior") {
    return {
      pageTitle: "作文陪练",
      backHome: "← 首页",
      topicLabel: "题目或材料",
      noTitleYet: "未设置",
      materialHintLead: "提示：本题更接近「",
      materialHintWhenMaterial: "先提炼材料要点与任务指令，再定立意与结构。",
      materialHintWhenTopic: "先锁定题眼与写作边界，再选素材与论述层次。",
      progressTitle: "进度",
      progressFree: (n, t) => `免费 ${n}/${t} 次`,
      steps: ["立意与选材", "展开内容", "谋篇布局", "修改润色"],
      chatSectionTitle: "对话",
      chatEmpty: "加载中…",
      chatLoading: "思考下一问…",
      quickReplyLabel: "快捷填入",
      inputPlaceholder: "直接输入你的回答，不必写成完整作文。",
      sendLoading: "请稍候…",
      sendLocked: "免费次数已用尽",
      sendDefault: "发送",
      asideTitle: "生成内容",
      tabOutline: "提纲",
      tabSentence: "佳句",
      tabSuggestion: "建议",
      asideEmpty: "完成数轮问答后，此处会生成提纲、佳句与修改建议。",
      panelOutline: "提纲",
      panelSentence: "可供参考的句子",
      panelSuggestion: "修改建议",
      lockSentence: "本栏需开通会员后使用",
      lockSuggestion: "本栏需开通会员后使用",
      errorRetry: "出现异常，请重试。",
      draftSectionTitle: "作文初稿",
      draftPlaceholder:
        "把当前成稿贴在这里，或整理对话后完整输入。字数足够后可请老师顺稿。",
      draftHint:
        "顺稿只在原文基础上优化结构与表达，不改你的核心观点与事实，也不另写一篇。",
      polishCta: "要不要老师帮你顺一顺",
      polishNeedMore: (n) =>
        `初稿再充实约 ${n} 字后，可使用顺稿（全文不宜过短）。`,
    };
  }
  if (tier === "junior") {
    return {
      pageTitle: "写作文 · 陪你一步步来",
      backHome: "← 返回首页",
      topicLabel: "题目或材料",
      noTitleYet: "还没填",
      materialHintLead: "小提示：这道题更像「",
      materialHintWhenMaterial: "先把材料读清楚、抓住要点，再想怎么下笔。",
      materialHintWhenTopic: "先把题目读准、抓住题眼，再想写什么内容。",
      progressTitle: "当前进度",
      progressFree: (n, t) => `还能免费提问 ${n} 次（共 ${t} 次）`,
      steps: ["想清楚写什么", "把经过说完整", "理一理结构", "改顺、改生动"],
      chatSectionTitle: "问答引导",
      chatEmpty: "正在准备，请稍候……",
      chatLoading: "正在想下一个问题……",
      quickReplyLabel: "快捷开头（点一下填进框里）",
      inputPlaceholder: "写几句就行，不用一次写得很完整。",
      sendLoading: "稍等……",
      sendLocked: "今天的免费次数用完啦",
      sendDefault: "发送",
      asideTitle: "写作辅助",
      tabOutline: "结构",
      tabSentence: "金句参考",
      tabSuggestion: "修改建议",
      asideEmpty:
        "多聊几轮之后，这里会出现结构要点、参考句和修改建议。",
      panelOutline: "结构要点",
      panelSentence: "可以参考的说法",
      panelSuggestion: "修改建议",
      lockSentence: "参考句暂不可用（免费次数已用完）",
      lockSuggestion: "详细建议暂不可用（免费次数已用完）",
      errorRetry: "出了点小问题，我们再试一次吧。",
      draftSectionTitle: "我的作文稿",
      draftPlaceholder:
        "把现在这篇作文贴在这里，或自己把全文打出来……写好了就能请老师帮你顺一遍。",
      draftHint:
        "老师会帮你把句子捋顺、贴紧题目，故事和意思还是你的，不会另写一篇。",
      polishCta: "要不要老师帮你顺一顺",
      polishNeedMore: (n) => `再写大约 ${n} 字，就能请老师顺一顺啦。`,
    };
  }
  return {
    pageTitle: "一起写作文",
    backHome: "← 回到首页",
    topicLabel: "作文题目",
    noTitleYet: "还没选题目",
    materialHintLead: "小提示：这道题更像「",
    materialHintWhenMaterial: "咱们先把材料读明白，再想怎么写。",
    materialHintWhenTopic: "咱们先把题目读准，再想写什么故事。",
    progressTitle: "今天写到哪一步啦",
    progressFree: (n, t) => `还能免费聊 ${n} 次（一共 ${t} 次）`,
    steps: ["想写什么", "多说一点", "排一排顺序", "改得更好听"],
    chatSectionTitle: "和老师聊聊天",
    chatEmpty: "马上就好，等你一下下……",
    chatLoading: "老师在想下一句问你什么……",
    quickReplyLabel: "点一下，帮你开个头",
    inputPlaceholder: "想到什么就写什么，一个词、一句话都可以～",
    sendLoading: "想一想……",
    sendLocked: "今天的免费次数用完啦",
    sendDefault: "发出去",
    asideTitle: "你的小纸条",
    tabOutline: "先写什么",
    tabSentence: "亮眼一句",
    tabSuggestion: "小提醒",
    asideEmpty:
      "多和老师聊几句，右边会慢慢帮你长出「顺序、好句子、小提醒」。",
    panelOutline: "写作顺序",
    panelSentence: "可以借来用的一句",
    panelSuggestion: "改一改会更好",
    lockSentence: "亮眼一句先休息啦",
    lockSuggestion: "小提醒先休息啦",
    errorRetry: "出了点小问题，我们再试一次吧。",
    draftSectionTitle: "我的作文",
    draftPlaceholder:
      "把你写好的话贴在这里，字不够可以再补几句；不会打字可以请大人帮一下～",
    draftHint:
      "老师会帮你念起来更顺口、更清楚，还是你说的那些事，不会换成大人的话哦。",
    polishCta: "要不要老师帮你顺一顺",
    polishNeedMore: (n) =>
      `再写多一点点就好啦（大约还差 ${n} 个字），就能请老师帮你顺一顺。`,
  };
}
