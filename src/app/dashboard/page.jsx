"use client";

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
// useRouter は AuthProvider が担当するので不要になる場合が多い
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ForgejoRepoGallery from '../../components/ForgejoRepoGallery';

export default function DashboardPage() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  // AuthProviderがリダイレクトとローディングを処理するため、
  // このページに到達した時点で isLoading=false かつ isAuthenticated=true であることが期待される。
  // ただし、念のためローディング状態とuserの存在をチェックする。
  if (isLoading || !user) {
    // !isAuthenticated もチェック条件に含めても良いが、AuthProviderのリダイレクトを信頼するならuserの存在で十分
    return <LoadingSpinner message="ユーザー情報を読み込み中..." />;
  }

  // もしAuthProviderのリダイレクトが間に合わず、一瞬未認証でこのページが表示されるのを防ぐため
  // (通常はAuthProvider内のuseEffectで処理されるはず)
  if (!isAuthenticated && !isLoading) {
      // router.replace('/login'); // AuthProviderに任せるので、基本的にはここは不要
      return <LoadingSpinner message="リダイレクトしています..." />; // または null
  }


  return (
    <>
      <Head>
        <title>Forgejoリポジトリギャラリー</title>
      </Head>
      <div className="dashboard">
        <main className="main-content">
          <ForgejoRepoGallery />
        </main>
      </div>
    </>
  );
}

// テーマ切り替えボタン（ナビバー用）
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
