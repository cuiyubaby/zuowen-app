"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCoachUiCopy } from "@/lib/coachUiCopy";

const STORAGE_DRAFT = "zuowen_polish_draft";

type PolishResponse = {
  polished?: string;
  notes?: string[];
  error?: string;
};

function PolishPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = (searchParams.get("title") || "").trim();
  const grade = searchParams.get("grade") || "小学三年级";
  const copy = getCoachUiCopy(grade);

  const [original, setOriginal] = useState("");
  const [polished, setPolished] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHint, setCopiedHint] = useState(false);

  useEffect(() => {
    let draft = "";
    try {
      draft = (sessionStorage.getItem(STORAGE_DRAFT) || "").trim();
    } catch {
      // ignore
    }

    if (!draft) {
      setLoading(false);
      setError(
        "没有找到作文原稿。请回到陪练页，把作文放在「我的作文稿」里，再点「要不要老师帮你顺一顺」。"
      );
      return;
    }

    setOriginal(draft);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade, title, draft }),
        });
        const data = (await res.json()) as PolishResponse;
        if (cancelled) return;
        if (!res.ok || data.error) {
          setError(
            typeof data.error === "string"
              ? data.error
              : "顺稿有点不顺利，稍后再试好吗。"
          );
          setLoading(false);
          return;
        }
        if (data.polished) setPolished(data.polished);
        if (Array.isArray(data.notes)) setNotes(data.notes);
      } catch {
        if (!cancelled) setError("网络有点问题，请稍后再试。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [grade, title]);

  const goCoach = () => {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    params.set("grade", grade);
    try {
      if (typeof window !== "undefined" && /MicroMessenger/i.test(window.navigator.userAgent || "")) {
        window.location.assign(`/coach?${params.toString()}`);
        return;
      }
    } catch {
      // ignore
    }
    router.push(`/coach?${params.toString()}`);
  };

  const handleContinue = () => {
    if (!polished?.trim()) return;
    try {
      sessionStorage.setItem("zuowen_return_draft", polished.trim());
      sessionStorage.setItem("zuowen_coach_restore", "1");
    } catch {
      // ignore
    }
    goCoach();
  };

  const handleUseThis = async () => {
    if (!polished?.trim()) return;
    try {
      await navigator.clipboard.writeText(polished.trim());
      setCopiedHint(true);
      window.setTimeout(() => setCopiedHint(false), 4000);
    } catch {
      setCopiedHint(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={goCoach}
            className="mb-3 text-sm text-slate-500 transition hover:text-blue-600"
          >
            ← 回到陪练
          </button>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            老师帮你顺一顺
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {copy.topicLabel}：{title || "（与陪练页一致）"} · {grade}
          </p>
          <p className="mt-1 text-xs text-slate-500">
下面是按你的原稿整理的版本，方便你对照；说明都是口语，像老师在旁边讲。
          </p>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              你刚刚写的是
            </h2>
            {original ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap break-words">
                {original}
              </div>
            ) : (
              <p className="text-sm text-slate-500">暂无原稿</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              可以改成这样
            </h2>
            {loading && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                老师正在读你的作文，顺好了就放在这里……
              </div>
            )}
            {!loading && error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {error}
              </div>
            )}
            {!loading && !error && polished && (
              <div className="rounded-xl bg-emerald-50/60 p-4 text-sm leading-7 text-slate-800 whitespace-pre-wrap break-words">
                {polished}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              我帮你改了什么
            </h2>
            {!loading && notes.length > 0 ? (
              <ul className="list-inside list-disc space-y-2 text-sm leading-7 text-slate-700 marker:text-emerald-600">
                {notes.map((line, i) => (
                  <li key={i} className="pl-1">
                    {line}
                  </li>
                ))}
              </ul>
            ) : loading ? (
              <p className="text-sm text-slate-400">稍等，老师理一理再告诉你……</p>
            ) : (
              <p className="text-sm text-slate-500">
                这次没有生成说明，可以回到陪练页再试一次。
              </p>
            )}
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!polished?.trim() || loading}
              className="order-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 sm:w-auto"
            >
              继续改一改
            </button>
            <button
              type="button"
              onClick={handleUseThis}
              disabled={!polished?.trim() || loading}
              className="order-1 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 sm:order-2 sm:w-auto"
            >
              就用这一版
            </button>
          </div>
          {copiedHint ? (
            <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-emerald-700">
              已经帮你复制好啦，可以贴到作文本或文档里。
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function PolishPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-4">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            加载中……
          </div>
        </main>
      }
    >
      <PolishPageInner />
    </Suspense>
  );
}
