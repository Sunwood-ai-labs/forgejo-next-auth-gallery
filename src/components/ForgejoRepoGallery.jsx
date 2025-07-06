"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TodoApiClient from "../lib/apiClient";
import LoadingSpinner from "./LoadingSpinner";
import yaml from "js-yaml";
import { formatDistanceToNow } from "date-fns";
import ja from "date-fns/locale/ja";

export default function ForgejoRepoGallery() {
  const auth = useAuth();
  const [apiClient] = useState(() => new TodoApiClient(auth));
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [repoMeta, setRepoMeta] = useState({});

  useEffect(() => {
    let mounted = true;
    async function fetchReposAndMeta() {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient.getForgejoRepos();
        if (!mounted) return;

        // forgejo.yamlを全リポジトリ分取得
        const metaObj = {};
        await Promise.all(
          data.map(async (repo) => {
            try {
              const branch = repo.default_branch || "main";
              const yamlUrl = `${repo.html_url}/raw/${branch}/forgejo.yaml`;
              const res = await fetch(yamlUrl, { method: "GET" });
              if (res.ok) {
                const text = await res.text();
                const meta = yaml.load(text);
                if (meta && typeof meta === "object") {
                  metaObj[repo.id] = {
                    title: meta.title || null,
                    emoji: meta.emoji || null,
                    colorFrom: meta.colorFrom || null,
                    colorTo: meta.colorTo || null,
                  };
                }
              }
            } catch (e) {
              // 取得失敗・YAMLパース失敗は無視
            }
          })
        );
        if (mounted) {
          setRepos(data);
          setRepoMeta(metaObj);
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
    // eslint-disable-next-line
  }, [apiClient]);

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
        <i className="fas fa-book"></i> Forgejoリポジトリ一覧
      </h2>
      <div className="repo-gallery-grid">
        {repos.map((repo) => {
          const meta = repoMeta[repo.id] || {};
          const cardStyle =
            meta.colorFrom && meta.colorTo
              ? {
                  background: `linear-gradient(135deg, ${meta.colorFrom} 0%, ${meta.colorTo} 100%)`,
                  color: "#222",
                }
              : {};
          // 相対日付
          let createdAgo = "";
          if (repo.created_at) {
            createdAgo = formatDistanceToNow(new Date(repo.created_at), {
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
              {/* 上部：絵文字のみ */}
              <div className="repo-card-header" style={{ justifyContent: "center" }}>
                <span style={{ fontSize: "2rem", margin: "0 0 0.2em 0" }}>
                  {meta.emoji || "📦"}
                </span>
              </div>
              {/* 下部：詳細 */}
              <div className="repo-card-footer" style={{ flexDirection: "column", alignItems: "stretch", marginTop: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <button className="repo-like-btn" type="button" tabIndex={-1} style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.7)",
                    border: "none",
                    borderRadius: "999px",
                    padding: "4px 12px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#FF3939",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF3939" style={{ marginRight: 4 }}>
                      <path d="M10.52 3.72c-1 6.38-5.62 7.49-5.62 12.45 0 3.4 4.62 6.02 8.1 6.02 2.6 0 7-2.77 7-7.5 0-4.36-4.77-9.04-7.95-11.47-.53-.4-1.4-.27-1.53.5Z" />
                      <path d="M13.2 13.95c.5-.5 1.2-.79 1.92-.79s1.4.29 1.91.83c2.53 2.53-1.2 8.03-4.4 7.9-3.23-.11-6.79-5.24-4.13-7.9l.04-.04a2.67 2.67 0 0 1 3.5-.25c.11.08.22.18.33.3l.4.39.43-.44Z" fill="#FFA600" />
                    </svg>
                    {repo.stars_count ?? 0}
                  </button>
                  <span className="repo-created-ago" style={{ color: "#888", fontSize: "0.95em" }}>
                    {createdAgo}
                  </span>
                </div>
                <div className="repo-name" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "2px" }}>
                  {meta.title || repo.full_name}
                </div>
                <div className="repo-desc" style={{ marginBottom: "6px" }}>
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
                  <span className="repo-owner" style={{ fontWeight: 500, color: "#555" }}>
                    {repo.owner?.login}
                  </span>
                  <span className="repo-lang" style={{ marginLeft: "auto", color: "#666" }}>
                    <i className="fas fa-code"></i> {repo.language || "N/A"}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
