"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TodoApiClient from "../lib/apiClient";
import LoadingSpinner from "./LoadingSpinner";

export default function ForgejoRepoGallery() {
  const auth = useAuth();
  const [apiClient] = useState(() => new TodoApiClient(auth));
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchRepos() {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient.getForgejoRepos();
        if (mounted) setRepos(data);
      } catch (err) {
        setError(
          err?.message ||
            "Forgejoリポジトリ一覧の取得に失敗しました。"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRepos();
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
        {repos.map((repo) => (
          <a
            className="repo-card"
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="repo-card-header">
              <img
                className="repo-owner-avatar"
                src={
                  repo.owner?.avatar_url ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(repo.owner?.login || "Forgejo")
                }
                alt={repo.owner?.login || "owner"}
              />
              <span className="repo-owner">{repo.owner?.login}</span>
            </div>
            <div className="repo-card-body">
              <div className="repo-name">{repo.full_name}</div>
              <div className="repo-desc">
                {repo.description
                  ? repo.description
                  : <span className="repo-desc-empty">説明なし</span>}
              </div>
            </div>
            <div className="repo-card-footer">
              <span className="repo-lang">
                <i className="fas fa-code"></i>{" "}
                {repo.language || "N/A"}
              </span>
              <span className="repo-stars">
                <i className="fas fa-star"></i> {repo.stars_count ?? 0}
              </span>
              <span className="repo-updated">
                <i className="fas fa-clock"></i>{" "}
                {repo.updated_at
                  ? new Date(repo.updated_at).toLocaleDateString("ja-JP")
                  : ""}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
