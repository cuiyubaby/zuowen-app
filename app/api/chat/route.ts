export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { title, grade, userInput } = body;
  
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
        },
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [
            {
              role: "system",
              content:
                "你是一位耐心、温和、擅长辅导中小学生写作文的中文老师。你的任务不是直接代写整篇作文，而是一步步引导学生思考、回忆细节、组织表达。回答要自然、鼓励式、适合对应年级。",
            },
            {
              role: "user",
              content: `作文题目：${title}\n年级：${grade}\n学生刚刚说：${userInput}\n请你像作文老师一样，继续追问一句，帮助学生把内容想得更具体。只回复一小段，不要太长。`,
            },
          ],
          temperature: 0.7,
        }),
      });
  
      const data = await response.json();
  
      const reply =
        data?.choices?.[0]?.message?.content || "我在想一想，你可以再多告诉我一点细节吗？";
  
      return Response.json({ reply });
    } catch (error) {
      console.error("API error:", error);
      return Response.json(
        { reply: "出了点小问题，我们再试一次吧。" },
        { status: 500 }
      );
    }
  }