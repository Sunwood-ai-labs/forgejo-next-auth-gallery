"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ChatPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // メッセージ取得
  useEffect(() => {
    let timer;
    const fetchMessages = async () => {
      const res = await fetch("/api/chat/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    };
    fetchMessages();
    timer = setInterval(fetchMessages, 2000); // 2秒ごとにポーリング
    return () => clearInterval(timer);
  }, []);

  // スクロール最下部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // メッセージ送信
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });
    setInput("");
    setSending(false);
    // 送信後即リロード
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  };

  if (isLoading) return <LoadingSpinner message="チャットを準備中..." />;
  if (!isAuthenticated) return <LoadingSpinner message="ログインが必要です" />;

  return (
    <div className="chat-root">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-logo">💬</span>
          <span className="chat-title">ギャラリーチャット</span>
        </div>
        <div className="chat-user-info">
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.login)}`}
            alt="avatar"
            className="chat-avatar"
          />
          <span>{user.full_name || user.login}</span>
        </div>
      </aside>
      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`chat-message${msg.user?.id === user.id ? " chat-message-own" : ""}`}
            >
              <img
                src={msg.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.login || "U")}`}
                alt="avatar"
                className="chat-message-avatar"
              />
              <div className="chat-message-content">
                <div className="chat-message-meta">
                  <span className="chat-message-user">{msg.user?.full_name || msg.user?.login || "?"}</span>
                  <span className="chat-message-time">{new Date(msg.createdAt).toLocaleTimeString("ja-JP")}</span>
                </div>
                <div className="chat-message-text">{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder="メッセージを入力..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            maxLength={500}
          />
          <button className="chat-send-btn" type="submit" disabled={sending || !input.trim()}>
            送信
          </button>
        </form>
      </main>
    </div>
  );
}
