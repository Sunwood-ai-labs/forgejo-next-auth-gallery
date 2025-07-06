let messages = [];

export async function GET() {
  // 最新50件のみ返す
  return Response.json({
    messages: messages.slice(-50)
  });
}

export async function POST(req) {
  try {
    const userData = JSON.parse(req.headers.get("x-user-data") || "{}");
    if (!userData.id) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }
    const { text } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "メッセージが空です" }, { status: 400 });
    }
    const msg = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      user: {
        id: userData.id,
        login: userData.login,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url
      },
      text: text.trim().slice(0, 500),
      createdAt: new Date().toISOString()
    };
    messages.push(msg);
    // 最新50件のみ保持
    if (messages.length > 50) messages = messages.slice(-50);
    return Response.json({
      messages: messages.slice(-50)
    });
  } catch (e) {
    return Response.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
