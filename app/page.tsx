"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const templateCards = [
  { title: "美丽的校园", type: "写景", prompt: "选一处校园角落，写出颜色和声音。" },
  { title: "我的妈妈", type: "写人", prompt: "抓住一个动作和一句对话来写。" },
  { title: "那次我学会了坚持", type: "成长", prompt: "先写困难，再写转折和结果。" },
  { title: "一次难忘的旅行", type: "叙事", prompt: "写清时间、地点、人物和一个高潮场景。" },
];

const recentRecordKey = "zuowen_recent_titles";

export default function LandingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("小学三年级");
  const [recentRecords, setRecentRecords] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(recentRecordKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setRecentRecords(parsed.filter(Boolean).slice(0, 5));
      }
    } catch {
      // ignore invalid local storage content
    }
  }, []);

  const saveRecentTitle = (nextTitle: string) => {
    const nextList = [nextTitle, ...recentRecords.filter((item) => item !== nextTitle)].slice(0, 5);
    setRecentRecords(nextList);
    window.localStorage.setItem(recentRecordKey, JSON.stringify(nextList));
  };

  const handleStart = () => {
    const nextTitle = title.trim();
    if (!nextTitle) {
      alert("请先输入作文题目");
      return;
    }

    saveRecentTitle(nextTitle);
    const params = new URLSearchParams({
      title: nextTitle,
      grade,
    });
    router.push(`/coach?${params.toString()}`);
  };

  const useTemplate = (template: string) => {
    setTitle(template);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white md:p-12">
            <p className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs">
              AI 作文助手
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">孩子会开口，作文就好写</h1>
            <p className="mt-4 max-w-2xl text-sm text-blue-50 md:text-base">
              先输入题目和年级，AI 老师会一步一步提问，帮助孩子把素材讲具体，再生成提纲与优化建议。
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-semibold text-slate-900">开始体验</h2>
          <p className="mt-1 text-sm text-slate-600">1 分钟就能进入陪写页面。</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">孩子年级</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-400"
              >
                {gradeOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">作文题目</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：我最难忘的一件事"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="mt-5 w-full rounded-xl bg-blue-600 p-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            开始辅导
          </button>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">热门模板推荐</h3>
            <span className="text-xs text-slate-400">点击可直接填入题目</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {templateCards.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => useTemplate(item.title)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="text-xs text-blue-600">{item.type}</p>
                <p className="mt-1 font-medium text-slate-900">{item.title}</p>
                <p className="mt-2 text-xs text-slate-500">{item.prompt}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">最近编辑</h3>
            <span className="text-xs text-slate-400">保存在当前设备</span>
          </div>
          {recentRecords.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              还没有记录。开始一次陪写后，这里会显示最近写过的题目。
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentRecords.map((record) => (
                <button
                  key={record}
                  type="button"
                  onClick={() => setTitle(record)}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {record}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
