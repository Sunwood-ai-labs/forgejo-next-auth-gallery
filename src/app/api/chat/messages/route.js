import { query } from '../../../../lib/database/connection.js';

// デフォルトチャンネル（一般）
const DEFAULT_CHANNEL = "general";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const channelId = url.searchParams.get("channel") || DEFAULT_CHANNEL;
    
    // 最新50件のメッセージを取得
    const result = await query(
      `SELECT message_id, user_id, user_login, user_full_name, user_avatar_url, text, channel, created_at
       FROM chat_messages 
       WHERE channel = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [channelId]
    );
    
    // 結果を古い順に並び替え
    const messages = result.rows
      .reverse()
      .map(row => ({
        id: row.message_id,
        user: {
          id: row.user_id,
          login: row.user_login,
          full_name: row.user_full_name,
          avatar_url: row.user_avatar_url
        },
        text: row.text,
        channel: row.channel,
        createdAt: row.created_at.toISOString()
      }));
    
    return Response.json({
      messages,
      channel: channelId
    });
  } catch (error) {
    console.error('チャットメッセージ取得エラー:', error);
    return Response.json({ error: "メッセージの取得に失敗しました" }, { status: 500 });
  }
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
    const messageId = Date.now().toString() + Math.random().toString(36).slice(2);
    const messageText = text.trim().slice(0, 500);
    
    // メッセージをデータベースに保存
    await query(
      `INSERT INTO chat_messages (message_id, user_id, user_login, user_full_name, user_avatar_url, text, channel)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        messageId,
        userData.id,
        userData.login,
        userData.full_name,
        userData.avatar_url,
        messageText,
        channelId
      ]
    );
    
    // 最新50件のメッセージを取得して返す
    const result = await query(
      `SELECT message_id, user_id, user_login, user_full_name, user_avatar_url, text, channel, created_at
       FROM chat_messages 
       WHERE channel = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [channelId]
    );
    
    // 結果を古い順に並び替え
    const messages = result.rows
      .reverse()
      .map(row => ({
        id: row.message_id,
        user: {
          id: row.user_id,
          login: row.user_login,
          full_name: row.user_full_name,
          avatar_url: row.user_avatar_url
        },
        text: row.text,
        channel: row.channel,
        createdAt: row.created_at.toISOString()
      }));
    
    return Response.json({
      messages,
      channel: channelId
    });
  } catch (error) {
    console.error('チャットメッセージ保存エラー:', error);
    return Response.json({ error: "メッセージの保存に失敗しました" }, { status: 500 });
  }
}
