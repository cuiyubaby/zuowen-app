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

const heroSellingPoints = [
  { icon: "pencil", text: "不会写，也能慢慢说出来" },
  { icon: "chat", text: "不用催，孩子自己愿意写" },
  { icon: "book", text: "写着写着，就成一篇完整作文" },
] as const;

const recentRecordKey = "zuowen_recent_titles";

function SellingPointIcon({ type }: { type: (typeof heroSellingPoints)[number]["icon"] }) {
  if (type === "pencil") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5cae5c]" fill="none" aria-hidden="true">
        <path d="M4 20L8.5 18.9L18 9.4L14.6 6L5.1 15.5L4 20Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M13.8 6.8L17.2 10.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "chat") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5cae5c]" fill="none" aria-hidden="true">
        <path d="M5 6.5H19V15H10L6 18V15H5V6.5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10.5H16" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5cae5c]" fill="none" aria-hidden="true">
      <path d="M6 4.5H18V19.5H6V4.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8H15" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 11H15" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("小学三年级");
  const [recentRecords, setRecentRecords] = useState<string[]>([]);
  const [showLogoFallback, setShowLogoFallback] = useState(false);
  const [showPosterFallback, setShowPosterFallback] = useState(false);

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
    <main className="min-h-screen bg-[#f7f2e7] px-4 py-8 text-[#3f2b1f]">
      <div className="mx-auto max-w-6xl">
        <section className="relative mb-6 aspect-square overflow-hidden rounded-3xl border border-[#e3d8c8] bg-[#fffaf2] shadow-sm md:aspect-auto md:min-h-[520px]">
          {!showPosterFallback ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <img
                src="/brand/poster.png"
                alt=""
                aria-hidden="true"
                onError={() => setShowPosterFallback(true)}
                className="absolute inset-0 h-full w-full object-cover object-[70%_60%] opacity-95 md:object-[74%_58%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf2]/94 via-[#fffaf2]/70 to-[#fffaf2]/18 md:from-[#fffaf2]/92 md:via-[#fffaf2]/72 md:to-[#fffaf2]/26" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#fffaf2]/22 via-transparent to-[#fffaf2]/28" />
            </div>
          ) : null}

          <div className="relative z-10 px-6 py-7 md:px-10 md:py-10">
            <div className="max-w-[520px]">
              <div className="mb-4 flex items-center gap-2 text-[#4e7f4a]">
                {!showLogoFallback ? (
                  <img
                    src="/brand/logo.png"
                    alt="FutureKid AI logo"
                    onError={() => setShowLogoFallback(true)}
                    className="h-7 w-auto opacity-90"
                  />
                ) : (
                  <div className="text-base">
                    🌱
                  </div>
                )}
                <p className="text-[12px] tracking-[0.02em]">FutureKid AI 作文陪练</p>
              </div>
              <h1 className="text-[30px] font-semibold leading-[1.18] text-[#4d2d1d] md:text-[40px]">
                孩子不会写作文
                <br />
                不是不会，是没人一步步带
              </h1>
              <div className="mt-7 space-y-3">
                {heroSellingPoints.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2.5 text-[15px] text-[#3d342f]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#d7ecd1] bg-[#eef8e9]">
                      <SellingPointIcon type={item.icon} />
                    </span>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-7 max-w-md text-[15px] leading-7 text-[#6d5443]">
                AI 陪孩子慢慢表达，而不是直接给答案。先把想法说出来，再一步步整理成完整作文。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-[#e3d8c8] bg-[#fffaf2] p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-semibold text-[#4d2d1d]">开始体验</h2>
          <p className="mt-1 text-sm text-[#7b6351]">先选年级，再输入题目，1 分钟进入陪写。</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5b4739]">孩子年级</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-[#dfd2c0] bg-white p-3 text-sm outline-none transition focus:border-[#6db96d]"
              >
                {gradeOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5b4739]">作文题目</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：我最难忘的一件事"
                className="w-full rounded-xl border border-[#dfd2c0] bg-white p-3 text-sm outline-none transition focus:border-[#6db96d]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="mt-5 w-full rounded-xl bg-[#6db96d] p-3 text-sm font-semibold text-white transition hover:bg-[#5cae5c]"
          >
            开始辅导
          </button>
        </section>

        <section className="mb-6 rounded-2xl border border-[#e3d8c8] bg-[#fffaf2] p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#4d2d1d]">热门模板推荐</h3>
            <span className="text-xs text-[#a18a74]">点击可直接填入题目</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {templateCards.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => useTemplate(item.title)}
                className="rounded-xl border border-[#e6d9c8] bg-[#fff] p-4 text-left transition hover:border-[#8dcf8d] hover:bg-[#f2faef]"
              >
                <p className="text-xs text-[#4f9c4f]">{item.type}</p>
                <p className="mt-1 font-medium text-[#3f2b1f]">{item.title}</p>
                <p className="mt-2 text-xs text-[#7b6351]">{item.prompt}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e3d8c8] bg-[#fffaf2] p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#4d2d1d]">最近编辑</h3>
            <span className="text-xs text-[#a18a74]">保存在当前设备</span>
          </div>
          {recentRecords.length === 0 ? (
            <p className="rounded-xl bg-[#f8f1e5] p-4 text-sm text-[#7b6351]">
              还没有记录。开始一次陪写后，这里会显示最近写过的题目。
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentRecords.map((record) => (
                <button
                  key={record}
                  type="button"
                  onClick={() => setTitle(record)}
                  className="rounded-xl border border-[#e6d9c8] bg-white p-3 text-left text-sm text-[#5b4739] transition hover:border-[#8dcf8d] hover:text-[#3e8f3e]"
                >
                  {record}
                </button>
              ))}
            </div>
          )}
        </section>
        <p className="mt-4 text-center text-xs text-[#9b846f]">
          Logo 路径：`public/brand/logo.png` · 插图路径：`public/brand/poster.png`
        </p>
      </div>
    </main>
  );
}
