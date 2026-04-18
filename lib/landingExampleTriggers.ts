import { getSchoolTier } from "@/lib/coachUiCopy";

/** 首页「热门模板」实为代入感触发器：点选后填入输入框，随年级切换 */
export type ExampleTrigger = {
  /** 卡片主标题（宜短） */
  label: string;
  type: string;
  /** 卡片说明：帮孩子想象「我也可以写这个」 */
  prompt: string;
  /** 填入输入框的正文；缺省则用 label */
  fillText?: string;
};

function isElementaryLower(grade: string): boolean {
  return /小学三|小学四/.test(grade);
}

/** 初二起校内常出现时事、热点、短评类任务 */
function isJuniorGrade2Up(grade: string): boolean {
  return /初二|初三/.test(grade);
}

function isJuniorGrade1(grade: string): boolean {
  return grade.includes("初一");
}

export function getExampleTriggers(grade: string): ExampleTrigger[] {
  const tier = getSchoolTier(grade);
  if (tier === "senior") {
    return [
      {
        label: "「美美与共」类材料作文",
        type: "材料 · 论述",
        prompt: "贴近高三常见材料长度与设问，可先写概括再贴校卷全文。",
        fillText:
          "有人说，文化贵在「各美其美，美美与共」。请结合材料与现实，谈谈你的认识与思考。",
      },
      {
        label: "就热点事件写一则短评",
        type: "时事 · 短评",
        prompt: "先交代「由头」一句话，再写态度；可再换成你校月考原题。",
        fillText:
          "近日，××事件引发网友热议。请结合你了解的情况，写一篇短评，表明你的观点并简要分析理由（不少于800字）。",
      },
      {
        label: "「赶路」与「望星」",
        type: "材料 · 思辨",
        prompt: "先把两个比喻对应到学习或生活里，再选一边为主或找平衡。",
        fillText:
          "有人说，青年要埋头赶路；也有人说，要偶尔抬头望星。对此，你怎么看？",
      },
      {
        label: "结合本年度一则公共议题",
        type: "现象 · 论述",
        prompt: "如科技伦理、教育、环保、公共规则等，先定小切口再展开。",
        fillText:
          "请结合本年度你关注的一则公共议题（或一则新闻报道），自选角度，自拟题目，写一篇议论文，谈谈你的认识与思考。",
      },
      {
        label: "以「边界与温度」为话题",
        type: "话题 · 自拟题",
        prompt: "家庭、同伴、网络讨论里，选一个你真有话说的切口。",
        fillText: "以「边界与温度」为话题，自拟题目，写一篇不少于800字的文章。",
      },
      {
        label: "班会发言：毕业前夕",
        type: "任务驱动",
        prompt: "想好听众是全班：最想叮嘱或感谢的一件事，语气要得体。",
        fillText:
          "班级举行「毕业前夕」主题班会，请你作为学生代表，写一篇发言稿，谈谈你的思考与祝愿。",
      },
    ];
  }
  if (tier === "junior" && isJuniorGrade1(grade)) {
    return [
      {
        label: "大家都在说的一件小事",
        type: "轻引子 · 记叙",
        prompt: "不写时评，只弄清「讲了什么」和「最想说的那句」。",
        fillText:
          "最近，班里或校园里有一件大家都在议论的小事。请写一小段话：先说说这件事主要讲了什么，再说你最想用一句话表达什么。",
      },
      {
        label: "《______，让我看见光》",
        type: "半命题",
        prompt: "先把题目补全，再想一件真事扣住「光」的比喻。",
        fillText: "《______，让我看见光》",
      },
      {
        label: "以「温暖的距离」为话题",
        type: "话题作文",
        prompt: "想想谁和你之间有过「想靠近又不好意思」的时刻。",
        fillText: "以「温暖的距离」为话题，自拟题目，写一篇文章。",
      },
      {
        label: "楼梯拐角的那三秒",
        type: "情境续写",
        prompt: "补全：谁在场、为什么停住、后来怎样了。",
        fillText:
          "楼梯拐角处，他停了三秒，望着前面的背影，还是没有跟上去……请据此展开，写一篇记叙文。",
      },
      {
        label: "《原来，我也很______》",
        type: "半命题",
        prompt: "发现自己另一面的一次经历，先把横线补成一个词或短语。",
        fillText: "《原来，我也很______》",
      },
    ];
  }
  if (tier === "junior" && isJuniorGrade2Up(grade)) {
    return [
      {
        label: "就一则网络热议写看法",
        type: "时事 · 短评",
        prompt: "先分清事实与评论，再选一个态度；可换成老师给的具体材料。",
        fillText:
          "近日，××现象在网络上引发热议。请结合材料或你了解的情况，写一篇作文，谈谈你的看法。（要求：观点明确，有理有据）",
      },
      {
        label: "从「一条新闻」说开去",
        type: "材料 · 夹叙夹议",
        prompt: "用一件真事或新闻作引子，再写你的思考，避免空喊口号。",
        fillText:
          "请根据近期一则你关注的新闻事件（或老师提供的材料），自拟题目，写一篇文章，可记叙、可议论，需体现你的思考。",
      },
      {
        label: "「规则与善意」引出的讨论",
        type: "现象 · 思辨",
        prompt: "适合校运会、交通、校规等真实场景，先想一个具体例子。",
        fillText:
          "有人说，规则更重要；也有人说，善意比规则更可贵。请结合生活实际，谈谈你的认识。",
      },
      {
        label: "《______，让我看见光》",
        type: "半命题",
        prompt: "也可把「光」理解成希望、公正、勇气，再补题。",
        fillText: "《______，让我看见光》",
      },
      {
        label: "楼梯拐角的那三秒",
        type: "情境续写",
        prompt: "叙事类月考常考，补全经过与心情。",
        fillText:
          "楼梯拐角处，他停了三秒，望着前面的背影，还是没有跟上去……请据此展开，写一篇记叙文。",
      },
      {
        label: "以「声音」为话题",
        type: "话题作文",
        prompt: "可写舆论场里的声音，也可写身边一句提醒，自拟题目。",
        fillText:
          "当今社会，信息纷杂，各种「声音」交织。请以「声音」为话题，自拟题目，写一篇文章。",
      },
    ];
  }
  if (isElementaryLower(grade)) {
    return [
      {
        label: "美丽的校园",
        type: "写景",
        prompt: "选校园里你最爱躲的一小块地方，写写颜色和声音。",
      },
      {
        label: "我的妈妈",
        type: "写人",
        prompt: "抓住她做家务或叮咛你的一个动作、一句话。",
      },
      {
        label: "那次我错了",
        type: "记事",
        prompt: "先写你怎么错，再写你怎么补救。",
      },
      {
        label: "课间十分钟",
        type: "记事",
        prompt: "写一个吵闹或好笑的画面，像放电影一样。",
      },
    ];
  }
  return [
    {
      label: "一次争论",
      type: "记事",
      prompt: "家里或班里吵起来那回：谁先急、后来说清了什么。",
    },
    {
      label: "榜样就在身边",
      type: "写人",
      prompt: "不写大名人，写班里或小区里的一个普通人。",
    },
    {
      label: "那一刻我懂了",
      type: "成长",
      prompt: "哪件事让你突然明白了大人一句话。",
    },
    {
      label: "难忘的一场比赛",
      type: "记事",
      prompt: "别写全景，写一个最关键的片刻和你的心情。",
    },
  ];
}

export function getExampleSectionCopy(grade: string): {
  title: string;
  subtitle: string;
  chipHint: string;
} {
  const tier = getSchoolTier(grade);
  if (tier === "senior") {
    return {
      title: "题型示例",
      subtitle:
        "含材料论述、时事短评、现象分析、任务驱动等，贴近高三常见问法；填入后再粘贴校卷全文即可。",
      chipHint: "点选填入",
    };
  }
  if (tier === "junior" && isJuniorGrade2Up(grade)) {
    return {
      title: "题目示例",
      subtitle:
        "初二、初三常见：记叙、话题之外，也有时事热点、短评、现象思辨；点一下填入，再换成老师发的原题也可以。",
      chipHint: "点选填入",
    };
  }
  if (tier === "junior") {
    return {
      title: "题目示例",
      subtitle: "贴近初一常练的半命题、话题和情境作文，先找个有感觉的题目试试。",
      chipHint: "点选填入",
    };
  }
  if (isElementaryLower(grade)) {
    return {
      title: "先找个感觉",
      subtitle: "给三四年级小朋友准备的例子，像挑一本想画的故事书。",
      chipHint: "点一下试试",
    };
  }
  return {
    title: "先找个感觉",
    subtitle: "给五六年级准备的例子，题目略复杂一点，更像校内单元作文。",
    chipHint: "点一下试试",
  };
}
