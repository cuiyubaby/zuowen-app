type PolishPayload = {
  polished: string;
  notes: string[];
};

function tryParsePolishJson(raw: string): PolishPayload | null {
  const text = raw.trim();
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() || text;
  try {
    const parsed = JSON.parse(candidate) as Record<string, unknown>;
    const polished =
      typeof parsed.polished === "string" ? parsed.polished.trim() : "";
    const notesRaw = parsed.notes;
    const notes: string[] = [];
    if (Array.isArray(notesRaw)) {
      for (const item of notesRaw) {
        if (typeof item === "string" && item.trim()) notes.push(item.trim());
      }
    }
    if (!polished || notes.length === 0) return null;
    return { polished, notes };
  } catch {
    return null;
  }
}

function buildPolishSystemPrompt(gradeKey: string): string {
  const tierLine = gradeKey.includes("小学")
    ? "小学：改完后要更口语、句子更短、读起来更清楚，像孩子自己会说的话。"
    : gradeKey.includes("初")
      ? "初中：改完后要更顺、更贴题，过渡自然，仍然像这个年级学生写的，不要写成大人论文。"
      : "高中：改完后段落与层次更清楚，开头结尾可略收紧，整体更完整，但口吻仍要像学生习作，不要官腔套话。";

  return `
你是一位陪孩子改作文的语文老师，和孩子说话要亲切、具体，不要像 AI 说明书。

任务：根据作文题目与年级，对学生「原稿」做整体顺稿——只在原文基础上改，相当于老师帮孩子理清、理顺一遍。

硬性规则（必须遵守）：
1. 保留原稿的核心意思、主要人物事件或观点，不另编新故事、不凭空加情节。
2. 不要改得完全不像孩子：少用华丽辞藻和成人论文腔；不要堆砌「综上所述」「由此可见」。
3. ${tierLine}
4. 修改说明 notes 里3–6 条即可，每条像老师在跟孩子说，口语一点。多用「我帮你……」这种开头，例如：我帮你把事情顺序排得更清楚了、我把一句话写得更具体了一点、我让结尾更自然了、我把重复的地方收了一下。
5. 不要用「本模型」「优化维度」「结构化处理」等 AI 腔；不要写专业术语清单。

输出要求（必须严格遵守）：
只输出一个 JSON 对象，不要 markdown 代码块，不要其它解释文字。
格式：
{
  "polished": "优化后的作文全文",
  "notes": ["我帮你……", "我帮你……"]
}
字段都不能为空；notes 至少 3 条。
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gradeKey =
      typeof body.grade === "string" ? body.grade.trim() : "";
    const titleText = typeof body.title === "string" ? body.title.trim() : "";
    const draft =
      typeof body.draft === "string" ? body.draft.trim() : "";

    if (!draft) {
      return Response.json(
        { error: "请先在作文稿里写好或贴上正文，再请老师顺一顺。" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey?.trim()) {
      return Response.json(
        {
          error:
            "当前服务还没配置智谱 API 密钥（环境变量 ZHIPU_API_KEY）。请在服务器 .env.local 里填写后重启项目。",
        },
        { status: 503 }
      );
    }

    const systemPrompt = buildPolishSystemPrompt(
      gradeKey || "小学三年级"
    );

    const response = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `学生年级：${gradeKey || "未填写"}
作文题目或材料：${titleText || "（未单独提供题目，请结合正文理解）"}

【原稿】${draft}

请按系统提示输出严格 JSON，polished 为顺稿后的全文，notes 为给孩子看的修改说明。`,
            },
          ],
          temperature: 0.45,
        }),
      }
    );

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
      message?: string;
    };

    if (!response.ok) {
      const detail =
        data?.error?.message || data?.message || `HTTP ${response.status}`;
      return Response.json(
        { error: `暂时接不上智谱接口：${detail}` },
        { status: 502 }
      );
    }

    const raw = data?.choices?.[0]?.message?.content;
    const content = typeof raw === "string" ? raw.trim() : "";
    if (!content) {
      return Response.json(
        { error: "智谱返回了空内容，请稍后重试。" },
        { status: 502 }
      );
    }

    const parsed = tryParsePolishJson(content);
    if (!parsed) {
      return Response.json(
        { error: "模型返回格式异常，请稍后重试。" },
        { status: 502 }
      );
    }

    return Response.json(parsed);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "服务器处理出错，请稍后重试。" }, { status: 500 });
  }
}
