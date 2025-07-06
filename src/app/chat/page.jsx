"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import ForgejoApiClient from "../../lib/apiClient";

// MDEditorはSSR非対応のためdynamic import
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDEditorMarkdown = dynamic(() => import("@uiw/react-md-editor").then(mod => ({ default: mod.default.Markdown })), { ssr: false });

export default function ChatPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [currentChannel, setCurrentChannel] = useState("general");
  const [loadingRepos, setLoadingRepos] = useState(false);
  const messagesEndRef = useRef(null);

  // 入力欄の高さ（ドラッグで可変）
  const [inputHeight, setInputHeight] = useState(100);
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // ドラッグ開始
  const handleDragStart = (e) => {
    dragging.current = true;
    startY.current = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    startHeight.current = inputHeight;
    document.body.style.cursor = "ns-resize";
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDrag, { passive: false });
    document.addEventListener("touchend", handleDragEnd);
  };

  // ドラッグ中
  const handleDrag = (e) => {
    if (!dragging.current) return;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    // 上部ハンドル用: 下にドラッグで大きく、上で小さく
    let newHeight = startHeight.current - (clientY - startY.current);
    newHeight = Math.max(60, Math.min(newHeight, 400));
    setInputHeight(newHeight);
    if (e.type === "touchmove") e.preventDefault();
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    dragging.current = false;
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDrag);
    document.removeEventListener("touchend", handleDragEnd);
  };

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
    
    // #見出しがあるかチェック
    const hasHeading = input.includes('#');
    
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-user-data": JSON.stringify(user)
      },
      body: JSON.stringify({ text: input, channel: currentChannel }),
    });
    
    // 送信後即リロード
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
      
      // #見出しがあり、リポジトリチャンネルの場合、自動でIssue作成
      if (hasHeading && currentChannel !== "general") {
        const repo = repositories.find(r => r.id.toString() === currentChannel);
        if (repo) {
          const headingMatch = input.match(/^#+\s*(.+)/m);
          const title = headingMatch ? headingMatch[1] : `チャット: ${user.full_name || user.login}`;
          const content = `**投稿者:** ${user.full_name || user.login}  
**投稿日時:** ${new Date().toLocaleString("ja-JP")}  
**チャンネル:** ${repo.full_name}  

---

${input}`;
          
          try {
            await sendChatToIssue(repo.id, title, content);
            alert(`Issue「${title}」を作成しました！`);
          } catch (error) {
            console.error('自動Issue作成エラー:', error);
          }
        }
      }
    }
    
    setInput("");
    setSending(false);
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

  // チャット内容をissueに送信
  const sendChatToIssue = async (repoId, title, content) => {
    try {
      const apiClient = new ForgejoApiClient();
      const result = await apiClient.createIssue(repoId, { title, body: content });
      return result;
    } catch (error) {
      console.error('Issue作成エラー:', error);
      throw error;
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
                <div className="chat-message-text">
                  <MDEditorMarkdown source={msg.text.replace(/\\n/g, '\n')} style={{ background: "none", whiteSpace: "pre-wrap" }} />
                  {currentChannel !== "general" && (
                    <button 
                      className="chat-issue-btn"
                      onClick={() => {
                        const repo = repositories.find(r => r.id.toString() === currentChannel);
                        if (repo) {
                          const title = `チャット: ${msg.user?.full_name || msg.user?.login}`;
                          const content = `**投稿者:** ${msg.user?.full_name || msg.user?.login}  
**投稿日時:** ${new Date(msg.createdAt).toLocaleString("ja-JP")}  
**チャンネル:** ${repo.full_name}  

---

${msg.text}`;
                          sendChatToIssue(repo.id, title, content)
                            .then(() => alert('Issueを作成しました！'))
                            .catch(() => alert('Issue作成に失敗しました'));
                        }
                      }}
                      title="このメッセージをIssueに送信"
                    >
                      🐛
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSend} style={{ alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {/* ドラッグハンドル（上部） */}
            <div
              ref={dragRef}
              style={{
                height: 10,
                cursor: "ns-resize",
                background: "linear-gradient(90deg, #eee 30%, #ccc 70%)",
                borderRadius: 4,
                marginBottom: 2,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                touchAction: "none"
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              title="上下にドラッグして入力欄の高さを調整"
            >
              <div style={{
                width: 32,
                height: 4,
                background: "#bbb",
                borderRadius: 2,
                opacity: 0.7
              }} />
            </div>
            <MDEditor
              value={input}
              onChange={setInput}
              height={inputHeight}
              preview="edit"
              textareaProps={{
                placeholder: "メッセージを入力...",
                maxLength: 500,
                disabled: sending,
                style: { fontSize: "1rem" }
              }}
            />
          </div>
          <button className="chat-send-btn" type="submit" disabled={sending || !input || !input.trim()} style={{ marginLeft: 8, height: 40 }}>
            <i className="fas fa-paper-plane"></i> 送信
          </button>
        </form>
      </main>
    </div>
  );
}
