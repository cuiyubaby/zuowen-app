"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCoachUiCopy } from "@/lib/coachUiCopy";
import {
  classifyWritingPrompt,
  getGradeProfile,
  isJuniorHighOrHighSchool,
  writingPromptKindLabel,
} from "@/lib/gradeProfile";
import { pushRecentEdit } from "@/lib/recentEdits";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ResultPanel = "outline" | "sentence" | "suggestion";
type CoachingResponse = {
  reply?: string;
  outline?: string;
  goodSentence?: string;
  suggestion?: string;
  remainingQuota?: number;
  freeLimit?: number;
  isPremiumLocked?: boolean;
  upgradeMessage?: string;
};

const gradeOptions = [
  "小学三年级",
  "小学四年级",
  "小学五年级",
  "小学六年级",
  "初一",
  "初二",
  "初三",
  "高一",
  "高二",
  "高三",
];

const STORAGE_SNAPSHOT = "zuowen_coach_snapshot";
const STORAGE_RESTORE = "zuowen_coach_restore";
const STORAGE_POLISH_DRAFT = "zuowen_polish_draft";
const STORAGE_RETURN_DRAFT = "zuowen_return_draft";

type CoachSnapshot = {
  messages: ChatMessage[];
  result: {
    outline: string;
    goodSentence: string;
    suggestion: string;
  };
  started: boolean;
  usageCount: number;
  remainingQuota: number;
  freeLimit: number;
  isPremiumLocked: boolean;
  upgradeMessage: string;
  draftText: string;
};

function getDraftMinLen(grade: string) {
  return grade.includes("小学") ? 60 : 80;
}

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

export default function CoachPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("小学三年级");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [result, setResult] = useState({
    outline: "",
    goodSentence: "",
    suggestion: "",
  });
  const [userInput, setUserInput] = useState("");
  const [draftText, setDraftText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<ResultPanel>("outline");
  const [usageCount, setUsageCount] = useState(0);
  const [remainingQuota, setRemainingQuota] = useState(6);
  const [freeLimit, setFreeLimit] = useState(6);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState(
    "免费次数已用完，开通会员后，还能解锁更多亮眼句子和改文小提醒。"
  );
  const [started, setStarted] = useState(false);

  const promptKind = isJuniorHighOrHighSchool(grade)
    ? classifyWritingPrompt(title).kind
    : "proposition_or_topic";

  const copy = useMemo(() => getCoachUiCopy(grade), [grade]);

  const quickReplies = grade.includes("小学")
    ? ["先写时间和地点", "先写我看到了什么", "我先写一句对话"]
    : grade.includes("初")
      ? promptKind === "material"
        ? [
            "我先用一句话概括材料",
            "材料里印象最深的是",
            "我选的写作角度是",
            "先交代背景",
            "先写关键细节",
          ]
        : [
            "题眼或关键词是",
            "半命题我补成",
            "我准备这样扣题写",
            "先交代背景",
            "先写关键细节",
          ]
      : promptKind === "material"
        ? [
            "材料题旨和限制词是",
            "我定的立意与切口是",
            "先写转折场景",
            "我补充思考角度",
          ]
        : [
            "题眼与写作边界是",
            "我定的标题或主题是",
            "先写转折场景",
            "我补充思考角度",
          ];

  const progressStep = !started ? 0 : result.outline ? 3 : 2;
  const progressPercent = Math.round((progressStep / 4) * 100);

  const startCoaching = (nextTitle: string, nextGrade: string) => {
    const finalTitle = nextTitle.trim();
    if (!finalTitle) return;

    const profile = getGradeProfile(nextGrade);
    const secondary = isJuniorHighOrHighSchool(nextGrade);
    const { kind, reason: promptClassifyReason } =
      classifyWritingPrompt(finalTitle);
    const kindLabel = writingPromptKindLabel(kind);
    if (process.env.NODE_ENV === "development") {
      console.info("[classifyWritingPrompt]", { kind, reason: promptClassifyReason });
    }

    const openingLine = (() => {
      if (!secondary) {
        return `你好呀，我们今天一起写《${finalTitle}》这篇作文。`;
      }
      if (kind === "material") {
        return `你好呀，系统按题干特征加权后，更像「${kindLabel}」。我们先一起读懂材料在说什么，再决定怎么写成作文。`;
      }
      return `你好呀，系统按题干特征加权后，更像「${kindLabel}」。我们先把题眼和写作范围找准，再落到具体的人、事或观点。`;
    })();

    const firstQuestion = (() => {
      if (!secondary) {
        return "先告诉我：这篇作文里，你最想写谁，或者最想写哪件事？";
      }
      if (kind === "material") {
        return "第一步：用你自己的话说说，材料主要在讲什么？如果有一两个关键词，也可以一起点出来。";
      }
      return "先说说：题目里哪个词最像「题眼」？你准备用什么具体的人、事或例子把它扣住？（半命题也可以先说你补上的那一半。）";
    })();

    setMessages([
      {
        role: "assistant",
        content: openingLine,
      },
      {
        role: "assistant",
        content: `你现在处在「${profile.stage}」这一阶段，我们会围绕「${profile.goal}」一步步陪你写。`,
      },
      {
        role: "assistant",
        content: firstQuestion,
      },
    ]);
    setResult({
      outline: "",
      goodSentence: "",
      suggestion: "",
    });
    setStarted(true);
    setUserInput("");
    setDraftText("");
    setActivePanel("outline");
  };

  const openPolish = () => {
    const trimmedDraft = draftText.trim();
    if (!started || trimmedDraft.length < getDraftMinLen(grade)) return;
    const snapshot: CoachSnapshot = {
      messages,
      result,
      started,
      usageCount,
      remainingQuota,
      freeLimit,
      isPremiumLocked,
      upgradeMessage,
      draftText: trimmedDraft,
    };
    try {
      sessionStorage.setItem(STORAGE_SNAPSHOT, JSON.stringify(snapshot));
      sessionStorage.setItem(STORAGE_POLISH_DRAFT, trimmedDraft);
    } catch {
      // 无痕模式等：仍尝试跳转，顺稿页可能拿不到稿
    }
    pushRecentEdit({
      title: title.trim() || "这次顺稿",
      kind: "polish",
      grade,
    });
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    params.set("grade", grade);
    const path = `/coach/polish?${params.toString()}`;
    try {
      if (/MicroMessenger/i.test(window.navigator.userAgent || "")) {
        window.location.assign(path);
        return;
      }
    } catch {
      // ignore
    }
    router.push(path);
  };

  const beginFromGate = () => {
    const t = title.trim();
    if (!t) {
      alert(
        isJuniorHighOrHighSchool(grade)
          ? "请先输入作文题目、材料或话题"
          : "请先输入作文题目"
      );
      return;
    }
    startCoaching(t, grade);
    pushRecentEdit({ title: t, kind: "write", grade });
    router.replace(
      `/coach?${new URLSearchParams({ title: t, grade }).toString()}`
    );
  };

  /* eslint-disable react-hooks/set-state-in-effect -- 仅挂载时从 URL 与顺稿返回恢复陪练状态 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextTitle = (params.get("title") || "").trim();
    const nextGrade = params.get("grade") || "小学三年级";
    const normalizedGrade = gradeOptions.includes(nextGrade)
      ? nextGrade
      : "小学三年级";

    let restore = false;
    try {
      restore = sessionStorage.getItem(STORAGE_RESTORE) === "1";
      if (restore) sessionStorage.removeItem(STORAGE_RESTORE);
    } catch {
      // ignore
    }

    setGrade(normalizedGrade);
    setTitle(nextTitle);

    if (restore) {
      try {
        const raw = sessionStorage.getItem(STORAGE_SNAPSHOT);
        if (raw) {
          const snap = JSON.parse(raw) as Partial<CoachSnapshot>;
          if (Array.isArray(snap.messages)) {
            setMessages(snap.messages as ChatMessage[]);
          }
          if (snap.result && typeof snap.result === "object") {
            setResult({
              outline:
                typeof snap.result.outline === "string"
                  ? snap.result.outline
                  : "",
              goodSentence:
                typeof snap.result.goodSentence === "string"
                  ? snap.result.goodSentence
                  : "",
              suggestion:
                typeof snap.result.suggestion === "string"
                  ? snap.result.suggestion
                  : "",
            });
          }
          if (typeof snap.started === "boolean") setStarted(snap.started);
          if (typeof snap.usageCount === "number") {
            setUsageCount(snap.usageCount);
          }
          if (typeof snap.remainingQuota === "number") {
            setRemainingQuota(snap.remainingQuota);
          }
          if (typeof snap.freeLimit === "number") setFreeLimit(snap.freeLimit);
          if (typeof snap.isPremiumLocked === "boolean") {
            setIsPremiumLocked(snap.isPremiumLocked);
          }
          if (typeof snap.upgradeMessage === "string") {
            setUpgradeMessage(snap.upgradeMessage);
          }
          let nextDraft =
            typeof snap.draftText === "string" ? snap.draftText : "";
          try {
            const rd = sessionStorage.getItem(STORAGE_RETURN_DRAFT);
            if (rd) {
              nextDraft = rd;
              sessionStorage.removeItem(STORAGE_RETURN_DRAFT);
            }
          } catch {
            // ignore
          }
          setDraftText(nextDraft);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    if (nextTitle) {
      startCoaching(nextTitle, normalizedGrade);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSend = async () => {
    if (!userInput.trim()) return;
    if (isPremiumLocked) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: upgradeMessage,
        },
      ]);
      return;
    }

    const currentInput = userInput;
    const recentMessages = [...messages, { role: "user" as const, content: currentInput }].slice(-8);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentInput,
      },
    ]);

    setUserInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          grade,
          userInput: currentInput,
          recentMessages,
          clientUsageCount: usageCount,
        }),
      });

      const data = (await res.json()) as CoachingResponse;
      setLoading(false);
      setUsageCount((prev) => prev + 1);
      const lockedFromServer = data.isPremiumLocked === true;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply || "我知道了，你可以再多说一点当时的画面和感受吗？",
        },
      ]);

      setResult({
        outline: data.outline || getOutlineText(grade, currentInput),
        goodSentence:
          lockedFromServer
            ? ""
            : data.goodSentence ||
              (grade.includes("小学")
                ? "那天阳光暖暖的，我心里像开出了一朵小花。"
                : grade.includes("初")
                  ? "那个瞬间像一束光，突然照进了我原本懵懂的心里。"
                  : "那一刻并不喧哗，却像一枚细小的钉子，悄悄把成长钉进了我的记忆深处。"),
        suggestion:
          lockedFromServer
            ? ""
            : data.suggestion ||
              (grade.includes("小学")
                ? "小提醒：多写一写你看到的、听到的和当时的心情。"
                : grade.includes("初")
                  ? "小提醒：可以再加一两处具体画面，会更生动。"
                  : "小提醒：把关键细节写充分，结尾回扣题意即可。"),
      });
      if (typeof data.freeLimit === "number") {
        setFreeLimit(data.freeLimit);
      }
      if (typeof data.remainingQuota === "number") {
        setRemainingQuota(data.remainingQuota);
      }
      if (typeof data.isPremiumLocked === "boolean") {
        setIsPremiumLocked(data.isPremiumLocked);
      }
      if (typeof data.upgradeMessage === "string" && data.upgradeMessage.trim()) {
        setUpgradeMessage(data.upgradeMessage);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: getCoachUiCopy(grade).errorRetry,
        },
      ]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-3 text-sm text-slate-500 transition hover:text-blue-600"
          >
            {copy.backHome}
          </button>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {copy.pageTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {copy.topicLabel}：{title || copy.noTitleYet} · {grade}
          </p>
          {isJuniorHighOrHighSchool(grade) && title ? (
            <p className="mt-1 text-xs text-slate-500">
              {copy.materialHintLead}
              {writingPromptKindLabel(promptKind)}」，
              {promptKind === "material"
                ? copy.materialHintWhenMaterial
                : copy.materialHintWhenTopic}
            </p>
          ) : null}
        </div>

        {!started ? (
          <div className="mb-5 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 shadow-sm">
            <p className="mb-4 text-sm leading-relaxed text-amber-950/90">
              若您从首页「开始陪写」过来，一般会带好题目。如果是直接打开这一页，请先帮孩子选好年级、填上题目，再点「开始陪写」。
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-amber-900/80">
                  年级
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-amber-200 bg-white p-2.5 text-sm outline-none focus:border-amber-400"
                >
                  {gradeOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-amber-900/80">
                  {isJuniorHighOrHighSchool(grade)
                    ? "题目、材料或话题"
                    : "作文题目"}
                </label>
                {isJuniorHighOrHighSchool(grade) ? (
                  <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="可粘贴试卷上的材料，或写半命题/话题"
                    rows={4}
                    className="min-h-[100px] w-full resize-y rounded-xl border border-amber-200 bg-white p-3 text-sm outline-none focus:border-amber-400"
                  />
                ) : (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：我最难忘的一件事"
                    className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm outline-none focus:border-amber-400"
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={beginFromGate}
              className="mt-4 w-full rounded-xl bg-[#5cae5c] p-3 text-sm font-semibold text-white transition hover:bg-[#529e52]"
            >
              开始陪写
            </button>
          </div>
        ) : null}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{copy.progressTitle}</span>
            <span className="text-slate-500">
              {progressPercent}% · {copy.progressFree(remainingQuota, freeLimit)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
            <span>1. {copy.steps[0]}</span>
            <span>2. {copy.steps[1]}</span>
            <span>3. {copy.steps[2]}</span>
            <span>4. {copy.steps[3]}</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                {copy.chatSectionTitle}
              </h2>

              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                    {copy.chatEmpty}
                  </p>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`max-w-[90%] rounded-xl p-3 text-sm leading-6 ${
                          msg.role === "assistant"
                            ? "mr-auto bg-blue-50 text-slate-700"
                            : "ml-auto bg-emerald-50 text-slate-700"
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))}
                  </>
                )}

                {loading && (
                  <div className="max-w-[90%] rounded-xl bg-blue-100 p-3 text-sm text-slate-600">
                    {copy.chatLoading}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-800">
                {copy.draftSectionTitle}
              </h2>
              <p className="mb-2 text-xs leading-relaxed text-slate-500">
                {copy.draftHint}
              </p>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder={copy.draftPlaceholder}
                className="mb-2 min-h-[140px] w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-400"
              />
              {draftText.trim().length < getDraftMinLen(grade) ? (
                <p className="mb-2 text-xs text-slate-400">
                  {copy.polishNeedMore(
                    Math.max(
                      0,
                      getDraftMinLen(grade) - draftText.trim().length
                    )
                  )}
                </p>
              ) : null}
              <button
                type="button"
                onClick={openPolish}
                disabled={
                  !started ||
                  draftText.trim().length < getDraftMinLen(grade) ||
                  loading
                }
                className={`w-full rounded-xl p-3 text-sm font-medium transition ${
                  !started ||
                  draftText.trim().length < getDraftMinLen(grade) ||
                  loading
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {copy.polishCta}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium text-slate-500">
                {copy.quickReplyLabel}
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {quickReplies.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setUserInput(tip)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    {tip}
                  </button>
                ))}
              </div>

              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={copy.inputPlaceholder}
                className="mb-2 min-h-[90px] w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-400"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !started || isPremiumLocked}
                className={`w-full rounded-xl p-3 text-sm font-medium text-white transition ${
                  loading || !started || isPremiumLocked
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {loading
                  ? copy.sendLoading
                  : isPremiumLocked
                    ? copy.sendLocked
                    : copy.sendDefault}
              </button>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              {copy.asideTitle}
            </h2>
            <div className="mb-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActivePanel("outline")}
                className={`rounded-lg px-2 py-2 text-xs ${
                  activePanel === "outline"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {copy.tabOutline}
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("sentence")}
                className={`rounded-lg px-2 py-2 text-xs ${
                  activePanel === "sentence"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {copy.tabSentence}
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("suggestion")}
                className={`rounded-lg px-2 py-2 text-xs ${
                  activePanel === "suggestion"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {copy.tabSuggestion}
              </button>
            </div>

            {!result.outline ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                {copy.asideEmpty}
              </p>
            ) : null}

            {isPremiumLocked && (
              <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                {upgradeMessage}
              </p>
            )}

            {activePanel === "outline" && result.outline ? (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  {copy.panelOutline}
                </p>
                <p className="whitespace-pre-line break-words">
                  {result.outline.trim()}
                </p>
              </div>
            ) : null}

            {activePanel === "sentence" && result.goodSentence ? (
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-slate-700">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  {copy.panelSentence}
                </p>
                <p>{result.goodSentence}</p>
              </div>
            ) : null}

            {activePanel === "sentence" && isPremiumLocked ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <p className="font-semibold">{copy.lockSentence}</p>
                <p className="mt-1 text-xs">{upgradeMessage}</p>
              </div>
            ) : null}

            {activePanel === "suggestion" && result.suggestion ? (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-slate-700">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  {copy.panelSuggestion}
                </p>
                <p>{result.suggestion}</p>
              </div>
            ) : null}

            {activePanel === "suggestion" && isPremiumLocked ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <p className="font-semibold">{copy.lockSuggestion}</p>
                <p className="mt-1 text-xs">{upgradeMessage}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
