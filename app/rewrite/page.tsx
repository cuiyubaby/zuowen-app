"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isJuniorHighOrHighSchool } from "@/lib/gradeProfile";
import { pushRecentEdit } from "@/lib/recentEdits";

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

const STORAGE_POLISH_DRAFT = "zuowen_polish_draft";

function minDraftLen(grade: string) {
  return grade.includes("小学") ? 60 : 80;
}

function RewritePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [grade, setGrade] = useState(() => {
    const g = searchParams.get("grade");
    return g && gradeOptions.includes(g) ? g : "小学三年级";
  });
  const [title, setTitle] = useState(() => searchParams.get("title") ?? "");
  const [draft, setDraft] = useState("");

  const goPolish = () => {
    const body = draft.trim();
    const min = minDraftLen(grade);
    if (body.length < min) {
      alert(
        grade.includes("小学")
          ? `作文再写长一点点就好，至少大约 ${min} 个字，老师才方便帮你顺稿。`
          : `正文建议至少大约 ${min} 字，再请老师顺一顺会更稳。`
      );
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_POLISH_DRAFT, body);
    } catch {
      alert("当前浏览器存不下文稿，请关闭无痕模式或检查存储权限后再试。");
      return;
    }
    pushRecentEdit({
      title: title.trim() || "这次顺稿",
      kind: "polish",
      grade,
    });
    const params = new URLSearchParams();
    if (title.trim()) params.set("title", title.trim());
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

  const goHome = () => {
    try {
      if (/MicroMessenger/i.test(window.navigator.userAgent || "")) {
        window.location.assign("/");
        return;
      }
    } catch {
      // ignore
    }
    router.push("/");
  };

  const needMore = Math.max(0, minDraftLen(grade) - draft.trim().length);

  return (
    <main className="min-h-screen bg-[#f7f2e7] px-4 py-8 text-[#3f2b1f]">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={goHome}
          className="mb-4 text-sm text-[#7b6351] transition hover:text-[#4f9c4f]"
        >
          ← 回首页
        </button>

        <div className="rounded-3xl border border-[#e3d8c8] bg-[#fffaf2] p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-semibold text-[#4d2d1d] md:text-3xl">
            优化作文
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#6d5443]">
            把孩子写好的作文贴在下面，选好年级；题目也尽量写上，老师改起来更贴题、更放心。
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5b4739]">
                孩子年级
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-[#dfd2c0] bg-white p-3 text-base outline-none transition focus:border-[#6db96d] md:text-sm"
              >
                {gradeOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5b4739]">
                作文题目{" "}
                <span className="font-normal text-[#a18a74]">
                  （可填短题，没有就先空着）
                </span>
              </label>
              {isJuniorHighOrHighSchool(grade) ? (
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="有材料的话，可以只写半命题补题，或写老师给的题目关键词。"
                  rows={3}
                  className="min-h-[72px] w-full resize-y rounded-xl border border-[#dfd2c0] bg-white p-3 text-base outline-none transition focus:border-[#6db96d] md:text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：难忘的一天"
                  className="w-full rounded-xl border border-[#dfd2c0] bg-white p-3 text-base outline-none transition focus:border-[#6db96d] md:text-sm"
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5b4739]">
                作文正文
              </label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="把整篇作文复制到这里就好，不用排版特别整齐。"
                rows={14}
                className="min-h-[280px] w-full resize-y rounded-xl border border-[#dfd2c0] bg-white p-3 text-base leading-7 outline-none transition focus:border-[#6db96d] md:text-sm"
              />
              {needMore > 0 ? (
                <p className="mt-2 text-xs text-[#a18a74]">
                  还差大约 {needMore} 字，就可以请老师顺一顺啦。
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={goPolish}
            className="mt-6 min-h-[48px] w-full rounded-2xl bg-[#b8956b] p-3 text-base font-semibold text-white transition hover:bg-[#a6845f] active:bg-[#957454]"
          >
            开始改作文
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-[#8a7865]">
            顺稿只在原文上帮你捋顺、改清楚，不会另写一篇；小学到高中都适用。
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RewritePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f2e7] px-4 py-16 text-center text-[#7b6351]">
          加载中…
        </main>
      }
    >
      <RewritePageInner />
    </Suspense>
  );
}
