"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGradeProfile } from "@/lib/gradeProfile";

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
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<ResultPanel>("outline");
  const [usageCount, setUsageCount] = useState(0);
  const [remainingQuota, setRemainingQuota] = useState(6);
  const [freeLimit, setFreeLimit] = useState(6);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState(
    "免费次数已用完，开通会员可继续解锁好句润色与深度建议。"
  );
  const [started, setStarted] = useState(false);

  const quickReplies = grade.includes("小学")
    ? ["先写时间和地点", "先写我看到了什么", "我先写一句对话"]
    : grade.includes("初")
      ? ["先交代背景", "先写关键细节", "我补充当时感受"]
      : ["先明确主题", "先写转折场景", "我补充思考角度"];

  const progressStep = !started ? 0 : result.outline ? 3 : 2;
  const progressPercent = Math.round((progressStep / 4) * 100);

  const startCoaching = (nextTitle: string, nextGrade: string) => {
    const finalTitle = nextTitle.trim();
    if (!finalTitle) return;

    const profile = getGradeProfile(nextGrade);
    setMessages([
      {
        role: "assistant",
        content: `你好呀，我们今天一起写《${finalTitle}》这篇作文。`,
      },
      {
        role: "assistant",
        content: `你现在处在「${profile.stage}」这一阶段，我们会围绕「${profile.goal}」一步步陪你写。`,
      },
      {
        role: "assistant",
        content: "先告诉我：这篇作文里，你最想写谁，或者最想写哪件事？",
      },
    ]);
    setResult({
      outline: "",
      goodSentence: "",
      suggestion: "",
    });
    setStarted(true);
    setUserInput("");
    setActivePanel("outline");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextTitle = (params.get("title") || "").trim();
    const nextGrade = params.get("grade") || "小学三年级";
    const normalizedGrade = gradeOptions.includes(nextGrade)
      ? nextGrade
      : "小学三年级";

    setGrade(normalizedGrade);
    setTitle(nextTitle);

    if (nextTitle) {
      startCoaching(nextTitle, normalizedGrade);
    }
  }, []);

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
                ? "修改建议：多写一写你看到的、听到的和当时的心情。"
                : grade.includes("初")
                  ? "修改建议：可以再补一个更具体的画面，让文章更生动。"
                  : "修改建议：可以进一步强化关键细节，并让结尾更自然地回扣主题。"),
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
          content: "出了点小问题，我们再试一次吧。",
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
            ← 返回首页
          </button>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            作文陪写中
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            当前题目：{title || "未设置"} · 年级：{grade}
          </p>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">本轮进度</span>
            <span className="text-slate-500">
              {progressPercent}% · 免费剩余 {remainingQuota}/{freeLimit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
            <span>1. 定题</span>
            <span>2. 补素材</span>
            <span>3. 出提纲</span>
            <span>4. 润色优化</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                💬 写作引导
              </h2>

              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                    正在准备陪写流程，请稍等...
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
                    老师正在组织下一问...
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium text-slate-500">快捷提示</p>
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
                placeholder="说说你刚才想到的细节..."
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
                {loading ? "老师思考中..." : isPremiumLocked ? "已达免费上限" : "发送"}
              </button>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              🧠 写作工作台
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
                提纲
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
                好句
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
                建议
              </button>
            </div>

            {!result.outline ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                先聊 1-2 轮内容，工作台会自动生成提纲、好句和修改建议。
              </p>
            ) : null}

            {isPremiumLocked && (
              <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                {upgradeMessage}
              </p>
            )}

            {activePanel === "outline" && result.outline ? (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <p className="mb-2 text-xs font-semibold text-slate-500">📝 提纲</p>
                <p className="whitespace-pre-line break-words">
                  {result.outline.trim()}
                </p>
              </div>
            ) : null}

            {activePanel === "sentence" && result.goodSentence ? (
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-slate-700">
                <p className="mb-2 text-xs font-semibold text-slate-500">✨ 好句</p>
                <p>{result.goodSentence}</p>
              </div>
            ) : null}

            {activePanel === "sentence" && isPremiumLocked ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <p className="font-semibold">✨ 好句已锁定</p>
                <p className="mt-1 text-xs">{upgradeMessage}</p>
              </div>
            ) : null}

            {activePanel === "suggestion" && result.suggestion ? (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-slate-700">
                <p className="mb-2 text-xs font-semibold text-slate-500">🔧 建议</p>
                <p>{result.suggestion}</p>
              </div>
            ) : null}

            {activePanel === "suggestion" && isPremiumLocked ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <p className="font-semibold">🔧 深度建议已锁定</p>
                <p className="mt-1 text-xs">{upgradeMessage}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
