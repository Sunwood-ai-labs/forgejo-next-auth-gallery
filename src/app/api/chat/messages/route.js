// チャンネル別メッセージ管理
let channelMessages = {}; // { channelId: [...messages] }

// デフォルトチャンネル（一般）
const DEFAULT_CHANNEL = "general";
if (!channelMessages[DEFAULT_CHANNEL]) {
  channelMessages[DEFAULT_CHANNEL] = [];
}

export async function GET(req) {
  const url = new URL(req.url);
  const channelId = url.searchParams.get("channel") || DEFAULT_CHANNEL;
  
  // チャンネルが存在しない場合は作成
  if (!channelMessages[channelId]) {
    channelMessages[channelId] = [];
  }
  
  // 最新50件のみ返す
  return Response.json({
    messages: channelMessages[channelId].slice(-50),
    channel: channelId
  });
}

export async function POST(req) {
  try {
    const userData = JSON.parse(req.headers.get("x-user-data") || "{}");
    if (!userData.id) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }
    const { text, channel } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "メッセージが空です" }, { status: 400 });
    }
    
    const channelId = channel || DEFAULT_CHANNEL;
    
    // チャンネルが存在しない場合は作成
    if (!channelMessages[channelId]) {
      channelMessages[channelId] = [];
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
      channel: channelId,
      createdAt: new Date().toISOString()
    };
    
    channelMessages[channelId].push(msg);
    // 最新50件のみ保持
    if (channelMessages[channelId].length > 50) {
      channelMessages[channelId] = channelMessages[channelId].slice(-50);
    }
    
    return Response.json({
      messages: channelMessages[channelId].slice(-50),
      channel: channelId
    });
  } catch (e) {
    return Response.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
