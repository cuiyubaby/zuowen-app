"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatRecentEditTime,
  readRecentEdits,
  recentEditKindCopy,
  type RecentEditRecord,
} from "@/lib/recentEdits";

const heroSellingPoints = [
  { icon: "pencil", text: "不会写，也能慢慢说出来" },
  { icon: "book", text: "已经写了，也能帮你顺一顺" },
  { icon: "chat", text: "不用催，孩子自己更愿意写" },
] as const;

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
  const [recentRecords, setRecentRecords] = useState<RecentEditRecord[]>([]);
  const [showLogoFallback, setShowLogoFallback] = useState(false);
  const [showPosterFallback, setShowPosterFallback] = useState(false);

  useEffect(() => {
    const sync = () => setRecentRecords(readRecentEdits());
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const navigatePath = (path: string) => {
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

  const continueRecord = (record: RecentEditRecord) => {
    const grade = record.grade || "小学三年级";
    if (record.kind === "write") {
      const q = new URLSearchParams({ title: record.title, grade });
      navigatePath(`/coach?${q.toString()}`);
      return;
    }
    const q = new URLSearchParams({ grade });
    if (record.title.trim()) q.set("title", record.title);
    navigatePath(`/rewrite?${q.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e7] px-4 py-8 text-[#3f2b1f]">
      <div className="mx-auto max-w-6xl">
        {/* 1. Hero */}
        <section className="relative mb-8 aspect-square overflow-hidden rounded-3xl border border-[#e3d8c8] bg-[#fffaf2] shadow-sm md:aspect-auto md:min-h-[520px]">
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
                  <div className="text-base" aria-hidden="true">
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
                AI 陪孩子慢慢表达，而不是直接给答案。
                <br />
                不会写的时候陪着写，写完以后也能一起改得更好。
              </p>
            </div>
          </div>
        </section>

        {/* 2. 双入口 */}
        <section className="relative z-10 mb-8">
          <div className="mb-5 text-center md:text-left">
            <h2 className="text-xl font-semibold text-[#4d2d1d] md:text-2xl">
              你想从哪一步开始？
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#6d5443]">
              选一个入口就好，具体怎么写、怎么改，都在下一页慢慢完成。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="flex flex-col rounded-3xl border border-[#c8e4c0] bg-[#eef8e9] p-7 shadow-sm md:min-h-[272px]">
              <div className="mb-4 flex items-start gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#b8dcb0] bg-[#dff3d9] text-[#4e7f4a]"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path
                      d="M4 20L8.5 18.9L18 9.4L14.6 6L5.1 15.5L4 20Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M13.8 6.8L17.2 10.2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-[#4f9c4f]">
                    还没开始写
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#2d4a28] md:text-xl">
                    开始写作文
                  </h3>
                </div>
              </div>
              <p className="mb-6 flex-1 text-[15px] leading-7 text-[#4a5a44]">
                不会写、没思路，也可以一步一步慢慢说出来
              </p>
              <button
                type="button"
                onClick={() => navigatePath("/coach")}
                className="mt-auto min-h-[48px] w-full rounded-2xl bg-[#5cae5c] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#529e52] active:bg-[#478a47]"
              >
                去开始写
              </button>
            </article>

            <article className="flex flex-col rounded-3xl border border-[#e8d4b8] bg-[#fdf6e8] p-7 shadow-sm md:min-h-[272px]">
              <div className="mb-4 flex items-start gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e0c9a8] bg-[#faedd4] text-[#8a6a3e]"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path
                      d="M7 4.5H17V19.5H7V4.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M9 8H15M9 11.5H14M9 15H12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <circle cx="16" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-[#a67c52]">
                    已经写好了
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#5c4a32] md:text-xl">
                    去优化作文
                  </h3>
                </div>
              </div>
              <p className="mb-6 flex-1 text-[15px] leading-7 text-[#6b5340]">
                把已经写好的作文贴进来，我帮你顺一顺、改一改
              </p>
              <button
                type="button"
                onClick={() => navigatePath("/rewrite")}
                className="mt-auto min-h-[48px] w-full rounded-2xl bg-[#b8956b] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#a6845f] active:bg-[#957454]"
              >
                去优化
              </button>
            </article>
          </div>
        </section>

        {/* 3. 学习记录 */}
        <section className="rounded-3xl border border-[#e3d8c8] bg-[#fffaf2] p-6 shadow-sm md:p-8">
          <h3 className="mb-5 text-lg font-semibold text-[#4d2d1d] md:text-xl">
            咱们最近写过的
          </h3>
          {recentRecords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e0d5c4] bg-[#fbf7ef] px-6 py-10 text-center">
              <p className="text-[15px] leading-7 text-[#5b4739]">
                你写过的作文会慢慢出现在这里。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#8a7865]">
                从第一篇开始，咱们把写过的都留在这里。
              </p>
              <button
                type="button"
                onClick={() => navigatePath("/coach")}
                className="mt-7 inline-flex rounded-xl border border-[#b8dcb0] bg-white px-6 py-2.5 text-sm font-medium text-[#3d6b38] shadow-sm transition hover:bg-[#f4faf2]"
              >
                去开始写
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentRecords.map((record) => {
                const timeStr = formatRecentEditTime(record.at);
                const { label: kindLabel } = recentEditKindCopy(record.kind);
                return (
                  <div
                    key={record.id}
                    className="flex flex-col rounded-2xl border border-[#eadfcc] bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          record.kind === "write"
                            ? "bg-[#e8f5e4] text-[#2f6a2c]"
                            : "bg-[#faedd4] text-[#7a5228]"
                        }`}
                      >
                        {kindLabel}
                      </span>
                      <time
                        dateTime={record.at}
                        className="text-xs tabular-nums text-[#a18a74]"
                      >
                        {timeStr}
                      </time>
                    </div>
                    <p className="mt-3 line-clamp-3 text-[15px] font-medium leading-snug text-[#3f2b1f]">
                      {record.title}
                    </p>
                    {record.grade ? (
                      <p className="mt-2 text-xs text-[#b5a090]">{record.grade}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => continueRecord(record)}
                      className={
                        record.kind === "write"
                          ? "mt-4 w-full rounded-xl border border-[#cfe8c9] bg-[#f4faf2] py-2.5 text-sm font-medium text-[#3d6b38] transition hover:bg-[#e8f3e4]"
                          : "mt-4 w-full rounded-xl border border-[#e8d4b8] bg-[#fffaf5] py-2.5 text-sm font-medium text-[#7a5228] transition hover:bg-[#faedd4]/60"
                      }
                    >
                      {record.kind === "write" ? "继续写" : "看看修改"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
