"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

// テーマ切替ボタン
function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        setTheme("dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        setTheme("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next);
    }
  };

  return (
    <button
      className="theme-toggle-btn"
      type="button"
      aria-label="テーマ切り替え"
      onClick={toggleTheme}
      style={{ marginRight: 0 }}
    >
      {theme === "dark" ? "☀️ ライト" : "🌙 夜涼"}
    </button>
  );
}

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ログインページでは「ログイン」ボタンを非表示
  const isLoginPage = pathname === "/login";

  return (
    <nav
      className="dashboard-header"
      style={{
        width: "100%",
        background: "white",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1.5px solid var(--bg-dark)",
      }}
    >
      <div className="header-content" style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* 左：タイトル */}
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.3rem",
            color: "var(--primary)",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
          onClick={() => router.push("/")}
        >
          <i className="fas fa-book" style={{ color: "var(--accent)" }}></i>
          Forgejoリポジトリギャラリー
        </div>
        {/* 右：テーマ切替＋ユーザー情報/ボタン */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <ThemeToggle />
          </div>
          {/* チャットリンク */}
          <button
            className="simple-login-btn"
            style={{ fontSize: "1rem", padding: "8px 18px", marginRight: 12 }}
            onClick={() => router.push("/chat")}
          >
            <i className="fas fa-comments"></i> チャット
          </button>
          {isAuthenticated && user && (
            <div className="user-info" style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <img
                id="userAvatar"
                className="user-avatar"
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.login)}&background=667eea&color=fff`}
                alt="Avatar"
                style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid var(--accent)" }}
              />
              <span id="userName">{user.full_name || user.login}</span>
              <button
                id="logoutBtn"
                className="logout-btn"
                style={{ fontSize: "1rem", padding: "8px 18px", marginLeft: 0 }}
                onClick={logout}
              >
                <i className="fas fa-sign-out-alt"></i>
                ログアウト
              </button>
            </div>
          )}
          {!isAuthenticated && !isLoginPage && (
            <button
              className="simple-login-btn"
              style={{ fontSize: "1rem", padding: "8px 18px" }}
              onClick={() => router.push("/login")}
            >
              <i className="fas fa-sign-in-alt"></i> ログイン
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
