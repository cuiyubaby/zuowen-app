/**
 * 首页「最近在写什么」：存在本机 localStorage，供孩子和家长快速回看。
 */

export type RecentEditKind = "write" | "polish";

export type RecentEditRecord = {
  id: string;
  /** 列表主标题：题目或顺稿时的简短说明 */
  title: string;
  kind: RecentEditKind;
  /** ISO 8601 */
  at: string;
  /** 当时选的年级，可选展示 */
  grade?: string;
};

const STORAGE_KEY = "zuowen_recent_edits";
const LEGACY_TITLES_KEY = "zuowen_recent_titles";
const MAX_ITEMS = 10;

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isRecord(x: unknown): x is RecentEditRecord {
  if (!x || typeof x !== "object") return false;
  const o = x as RecentEditRecord;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    (o.kind === "write" || o.kind === "polish") &&
    typeof o.at === "string"
  );
}

function migrateLegacyTitles(titles: string[]): RecentEditRecord[] {
  const cleaned = titles.filter(Boolean).slice(0, MAX_ITEMS);
  const now = Date.now();
  return cleaned.map((title, i) => ({
    id: `legacy-${now}-${i}-${title.slice(0, 12)}`,
    title,
    kind: "write" as const,
    at: new Date(now - i * 60_000).toISOString(),
  }));
}

/** 从本地读取；会自动把旧版「仅题目数组」迁到新结构 */
export function readRecentEdits(): RecentEditRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter(isRecord).slice(0, MAX_ITEMS);
      }
      return [];
    }
    const leg = window.localStorage.getItem(LEGACY_TITLES_KEY);
    if (leg) {
      const parsed = JSON.parse(leg) as unknown;
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        const migrated = migrateLegacyTitles(parsed);
        writeRecentEdits(migrated);
        window.localStorage.removeItem(LEGACY_TITLES_KEY);
        return migrated;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function writeRecentEdits(list: RecentEditRecord[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(list.slice(0, MAX_ITEMS))
    );
  } catch {
    // 无痕 / 限额
  }
}

export type PushRecentEditInput = {
  title: string;
  kind: RecentEditKind;
  grade?: string;
};

/** prepend 一条记录 */
export function pushRecentEdit(input: PushRecentEditInput): void {
  if (typeof window === "undefined") return;
  const title =
    input.title.trim() ||
    (input.kind === "polish" ? "这次顺稿" : "未填题目");
  const record: RecentEditRecord = {
    id: randomId(),
    title,
    kind: input.kind,
    at: new Date().toISOString(),
    grade: input.grade?.trim() || undefined,
  };
  const prev = readRecentEdits().filter((r) => r.id !== record.id);
  writeRecentEdits([record, ...prev]);
}

/** 类型：给家长看的短标签 + 给孩子看的一点点说明 */
export function recentEditKindCopy(kind: RecentEditKind): {
  label: string;
  hint: string;
} {
  if (kind === "write") {
    return { label: "新写", hint: "陪写 · 从题目慢慢写" };
  }
  return { label: "已优化", hint: "顺稿 · 给写好的作文改顺" };
}

/** 展示用时间：今天 / 昨天 / 月日 + 时分 */
export function formatRecentEditTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const isYesterday =
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate();

  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (sameDay) return `今天 ${hm}`;
  if (isYesterday) return `昨天 ${hm}`;

  return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`;
}
