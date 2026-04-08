"use client";

import { useState } from "react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

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
export default function Home() {
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

  const handleStart = () => {
    if (!title.trim()) {
      alert("请先输入作文题目");
      return;
    }

    setMessages([
      {
        role: "assistant",
        content: `你好呀，我们今天一起写《${title}》这篇作文。`,
      },
      {
        role: "assistant",
        content: `你现在是${grade}的同学，我会用适合你的方式一步步陪你写。`,
      },
      {
        role: "assistant",
        content: "先告诉我：这篇作文里，你最想写谁，或者最想写哪件事？",
      },
    ]);

    setResult({
      outline: "这里之后会显示提纲。",
      goodSentence: "这里之后会显示好句建议。",
      suggestion: "这里之后会显示修改建议。",
    });
    setUserInput("");
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

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
        }),
      });

      const data = await res.json();
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply || "我知道了，你可以再多说一点当时的画面和感受吗？",
        },
      ]);

      setResult({
        outline: getOutlineText(grade, currentInput),
        goodSentence:
          grade.includes("小学")
            ? "好句建议：那天阳光暖暖的，我心里像开出了一朵小花。"
            : grade.includes("初")
              ? "好句建议：那个瞬间像一束光，突然照进了我原本懵懂的心里。"
              : "好句建议：那一刻并不喧哗，却像一枚细小的钉子，悄悄把成长钉进了我的记忆深处。",
        suggestion:
          grade.includes("小学")
            ? "修改建议：多写一写你看到的、听到的和当时的心情。"
            : grade.includes("初")
              ? "修改建议：可以再补一个更具体的画面，让文章更生动。"
              : "修改建议：可以进一步强化关键细节，并让结尾更自然地回扣主题。",
      });
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
    <main className="min-h-screen bg-gray-50 p-4 pb-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-center text-3xl font-bold">
          📖 作文陪练小助手
        </h1>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <label className="mb-2 block font-medium">作文题目</label>
          <input
            type="text"
            placeholder="例如：那一刻，我长大了"
            className="mb-4 w-full rounded-lg border p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="mb-2 block font-medium">选择年级</label>
          <select
            className="mb-4 w-full rounded-lg border p-3"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option>小学三年级</option>
            <option>小学四年级</option>
            <option>小学五年级</option>
            <option>小学六年级</option>
            <option>初一</option>
            <option>初二</option>
            <option>初三</option>
            <option>高一</option>
            <option>高二</option>
            <option>高三</option>
          </select>

          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-lg bg-blue-500 p-3 text-white"
          >
            开始陪写 ✨
          </button>
        </div>

        <div className="space-y-6">
          {/* 消息列表 */}
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-3 font-semibold">💬 写作引导</h2>

            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  输入题目并选择年级后，点击“开始陪写”，这里会出现引导内容。
                </p>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-3 text-sm ${
                        msg.role === "assistant"
                          ? "bg-blue-50 text-gray-800"
                          : "bg-green-50 text-gray-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                </>
              )}

              {loading && (
                <div className="rounded-lg bg-blue-100 p-3 text-gray-600 text-sm">
                  老师正在想一想...
                </div>
              )}
            </div>
          </div>

          {/* 输入区 */}
          <div className="rounded-xl bg-white p-4 shadow">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="说说你的想法..."
              className="mb-2 w-full rounded-lg border p-3 text-sm min-h-[80px] resize-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className={`w-full rounded-lg p-3 text-white text-sm ${
                loading ? "bg-gray-400" : "bg-green-500"
              }`}
            >
              {loading ? "老师思考中..." : "发送"}
            </button>
          </div>

          {/* 结果区 */}
          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-3 font-semibold">🧠 写作结果</h2>

            {result.outline ? (
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <strong>📝 提纲</strong>
                  <p className="whitespace-pre-line break-words">
                    {result.outline.trim()}
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <strong>✨ 好句</strong>
                  <p>{result.goodSentence}</p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <strong>🔧 建议</strong>
                  <p>{result.suggestion}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                这里会自动生成提纲和建议
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}