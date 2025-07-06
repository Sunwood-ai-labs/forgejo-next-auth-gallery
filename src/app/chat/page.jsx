"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import ForgejoApiClient from "../../lib/apiClient";

export default function ChatPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [currentChannel, setCurrentChannel] = useState("general");
  const [loadingRepos, setLoadingRepos] = useState(false);
  const messagesEndRef = useRef(null);

  // リポジトリ一覧取得
  useEffect(() => {
    if (isAuthenticated && user) {
      setLoadingRepos(true);
      const apiClient = new ForgejoApiClient();
      apiClient.getForgejoRepos()
        .then(repos => {
          setRepositories(repos || []);
        })
        .catch(err => {
          console.error('リポジトリ取得エラー:', err);
        })
        .finally(() => {
          setLoadingRepos(false);
        });
    }
  }, [isAuthenticated, user]);

  // メッセージ取得
  useEffect(() => {
    let timer;
    const fetchMessages = async () => {
      const res = await fetch(`/api/chat/messages?channel=${encodeURIComponent(currentChannel)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    };
    fetchMessages();
    timer = setInterval(fetchMessages, 2000); // 2秒ごとにポーリング
    return () => clearInterval(timer);
  }, [currentChannel]);

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
      body: JSON.stringify({ text: input, channel: currentChannel }),
    });
    setInput("");
    setSending(false);
    // 送信後即リロード
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  };

  // チャンネル変更
  const handleChannelChange = (channelId) => {
    setCurrentChannel(channelId);
  };

  // チャンネル表示名取得
  const getChannelDisplayName = (channelId) => {
    if (channelId === "general") return "一般";
    const repo = repositories.find(r => r.id.toString() === channelId);
    return repo ? repo.full_name : channelId;
  };

  // チャンネル絵文字取得
  const getChannelIcon = (channelId) => {
    if (channelId === "general") return "💬";
    const repo = repositories.find(r => r.id.toString() === channelId);
    return repo?.metadata?.emoji || "📁";
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
        
        <div className="chat-channels">
          <div className="chat-channel-section">
            <h4 className="chat-channel-header">チャンネル</h4>
            <div 
              className={`chat-channel-item ${currentChannel === "general" ? "active" : ""}`}
              onClick={() => handleChannelChange("general")}
            >
              <span className="chat-channel-icon">💬</span>
              <span className="chat-channel-name">一般</span>
            </div>
          </div>
          
          <div className="chat-channel-section">
            <h4 className="chat-channel-header">リポジトリ</h4>
            {loadingRepos ? (
              <div className="chat-loading">読み込み中...</div>
            ) : (
              repositories.map(repo => (
                <div 
                  key={repo.id}
                  className={`chat-channel-item ${currentChannel === repo.id.toString() ? "active" : ""}`}
                  onClick={() => handleChannelChange(repo.id.toString())}
                >
                  <span className="chat-channel-icon">{getChannelIcon(repo.id.toString())}</span>
                  <span className="chat-channel-name">{repo.full_name}</span>
                </div>
              ))
            )}
          </div>
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
        <div className="chat-header">
          <span className="chat-current-channel">
            {getChannelIcon(currentChannel)} {getChannelDisplayName(currentChannel)}
          </span>
        </div>
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
