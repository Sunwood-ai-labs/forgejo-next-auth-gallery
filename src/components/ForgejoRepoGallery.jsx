"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TodoApiClient from "../lib/apiClient";
import LoadingSpinner from "./LoadingSpinner";
import yaml from "js-yaml";
import { formatDistanceToNow } from "date-fns";
import ja from "date-fns/locale/ja";

// サイトのカラーパレットに合わせたグラデーションセット
const paletteGradients = [
  ["var(--primary)", "var(--accent)"],
  ["var(--accent)", "var(--secondary)"],
  ["var(--neon-gold)", "var(--primary)"],
  ["var(--secondary)", "var(--neon-gold)"],
  ["var(--primary)", "var(--secondary)"],
  ["var(--accent)", "var(--neon-gold)"],
  ["var(--primary)", "var(--bg-light)"],
  ["var(--secondary)", "var(--bg-dark)"],
];

// テーマカラー配列
const paletteColors = [
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
  "var(--neon-gold)",
];

function getPaletteGradient(repoId) {
  const idx = typeof repoId === "number" ? repoId % paletteGradients.length : 0;
  return paletteGradients[idx];
}
function getPaletteColor(repoId) {
  const idx = typeof repoId === "number" ? repoId % paletteColors.length : 0;
  return paletteColors[idx];
}

export default function ForgejoRepoGallery() {
  const auth = useAuth();
  const [apiClient] = useState(() => new TodoApiClient(auth));
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [repoMeta, setRepoMeta] = useState({});
  const [isPublic, setIsPublic] = useState(false);

  // 公開ForgejoサーバーURL（未ログイン時はここを参照）
  const defaultForgejoUrl = "http://192.168.0.131:3000/";

  useEffect(() => {
    let mounted = true;
    async function fetchReposAndMeta() {
      setLoading(true);
      setError("");
      try {
        let data = [];
        let publicMode = false;
        if (auth.user) {
          // 認証済み：自分の権限で見れるリポジトリ
          data = await apiClient.getForgejoRepos();
          publicMode = false;
        } else {
          // 未認証：Forgejo公開リポジトリ一覧
          data = await TodoApiClient.getPublicForgejoRepos(defaultForgejoUrl);
          publicMode = true;
        }
        if (!mounted) return;

        const metaObj = {};
        await Promise.all(
          data.map(async (repo) => {
            try {
              const branch = repo.default_branch || "main";
              const rawUrl = `${repo.html_url}/raw/${branch}/forgejo.yaml`;
              const proxyUrl = `/api/proxy-raw-yaml?url=${encodeURIComponent(rawUrl)}`;
              const res = await fetch(proxyUrl, { method: "GET" });
              if (res.ok) {
                const text = await res.text();
                const meta = yaml.load(text);
                if (meta && typeof meta === "object") {
                  metaObj[repo.id] = {
                    title: meta.title || null,
                    emoji: meta.emoji || null,
                  };
                }
              }
            } catch (e) {}
          })
        );
        if (mounted) {
          setRepos(data);
          setRepoMeta(metaObj);
          setIsPublic(publicMode);
        }
      } catch (err) {
        setError(
          err?.message ||
            "Forgejoリポジトリ一覧の取得に失敗しました。"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReposAndMeta();
    return () => {
      mounted = false;
    };
  }, [apiClient, auth.user]);

  if (loading) {
    return <LoadingSpinner message="リポジトリ一覧を取得中..." />;
  }

  if (error) {
    return (
      <div className="repo-gallery-error">
        <i className="fas fa-exclamation-triangle"></i> {error}
      </div>
    );
  }

  if (!repos || repos.length === 0) {
    return (
      <div className="repo-gallery-empty">
        <i className="fas fa-folder-open"></i> リポジトリが見つかりません
      </div>
    );
  }

  return (
    <section className="repo-gallery-section">
      <h2 className="repo-gallery-title">
        <i className="fas fa-book"></i>
        {isPublic ? " Forgejo公開リポジトリ一覧（ログイン不要）" : " あなたのForgejoリポジトリ一覧"}
      </h2>
      <div className="repo-gallery-grid">
        {repos.map((repo) => {
          const meta = repoMeta[repo.id] || {};
          const [from, to] = getPaletteGradient(repo.id);
          const mainColor = getPaletteColor(repo.id);
          // 白ベース＋グラデを薄く重ねる
          const cardStyle = {
            background: "#fff",
            position: "relative",
            overflow: "hidden",
            border: "1.5px solid rgba(0,0,0,0.04)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          };
          const gradStyle = {
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
            opacity: 0.16,
          };
          let updatedAgo = "";
          if (repo.updated_at) {
            updatedAgo = formatDistanceToNow(new Date(repo.updated_at), {
              addSuffix: true,
              locale: ja,
            });
          }
          return (
            <a
              className="repo-card"
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={cardStyle}
            >
              <div style={gradStyle}></div>
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* 上部：絵文字のみ */}
                <div className="repo-card-header" style={{ justifyContent: "center" }}>
                  <span style={{ fontSize: "2rem", margin: "0 0 0.2em 0", color: mainColor }}>
                    {meta.emoji || "📦"}
                  </span>
                </div>
                {/* 下部：詳細 */}
                <div className="repo-card-footer" style={{ flexDirection: "column", alignItems: "stretch", marginTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <button className="repo-like-btn" type="button" tabIndex={-1} style={{
                      display: "flex",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.92)",
                      border: "none",
                      borderRadius: "999px",
                      padding: "4px 12px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: mainColor,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      cursor: "pointer",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={mainColor} style={{ marginRight: 4 }}>
                        <path d="M10.52 3.72c-1 6.38-5.62 7.49-5.62 12.45 0 3.4 4.62 6.02 8.1 6.02 2.6 0 7-2.77 7-7.5 0-4.36-4.77-9.04-7.95-11.47-.53-.4-1.4-.27-1.53.5Z" />
                        <path d="M13.2 13.95c.5-.5 1.2-.79 1.92-.79s1.4.29 1.91.83c2.53 2.53-1.2 8.03-4.4 7.9-3.23-.11-6.79-5.24-4.13-7.9l.04-.04a2.67 2.67 0 0 1 3.5-.25c.11.08.22.18.33.3l.4.39.43-.44Z" fill="#FFA600" />
                      </svg>
                      {repo.stars_count ?? 0}
                    </button>
                    <span className="repo-updated-ago" style={{ color: mainColor, fontSize: "0.95em", fontWeight: 500 }}>
                      更新: {updatedAgo}
                    </span>
                  </div>
                  <div className="repo-name" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "2px", color: mainColor }}>
                    {meta.title || repo.full_name}
                  </div>
                  <div className="repo-desc" style={{ marginBottom: "6px", color: "#444" }}>
                    {repo.description
                      ? repo.description
                      : <span className="repo-desc-empty">説明なし</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                      className="repo-owner-avatar"
                      src={
                        repo.owner?.avatar_url ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(repo.owner?.login || "Forgejo")
                      }
                      alt={repo.owner?.login || "owner"}
                      style={{ width: 24, height: 24, borderRadius: "50%" }}
                    />
                    <span className="repo-owner" style={{ fontWeight: 500, color: mainColor }}>
                      {repo.owner?.login}
                    </span>
                    <span className="repo-lang" style={{ marginLeft: "auto", color: mainColor }}>
                      <i className="fas fa-code"></i> {repo.language || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
