"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner'; // AuthProviderがローディングをハンドルするが念のため

export default function LoginPage() {
  const { login, isLoading: authLoading, isAuthenticated } = useAuth(); // isLoadingはAuthProviderの全体的なロード状態
  const [showApiTokenLogin, setShowApiTokenLogin] = useState(false);
  const [error, setError] = useState('');

  // フォーム入力用の state
  const [forgejoUrl, setForgejoUrl] = useState('http://192.168.0.131:3000/');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [forgejoUrlApi, setForgejoUrlApi] = useState('http://192.168.0.131:3000/');

  const [loginInProgress, setLoginInProgress] = useState(false); // 個別のログイン処理中のローディング

  const handleSimpleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginInProgress(true);
    try {
      // login関数は成功時に自動で/dashboardへリダイレクトするため、ここでは待つだけ
      await login('basic', { username, password, forgejoUrl });
    } catch (err) {
      setError(err.message || 'ログインに失敗しました。');
      console.error('Simple login error:', err);
      setLoginInProgress(false); // エラー時は手動で解除
    }
    // 成功時はAuthProviderがリダイレクトするので、ここではLoginInProgressを解除しない
    // もしリダイレクトがAuthProvider側で失敗した場合を考慮するなら解除が必要
  };

  const handleTokenLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginInProgress(true);
    try {
      await login('token', { apiToken, forgejoUrlApi });
    } catch (err) {
      setError(err.message || 'APIトークンでのログインに失敗しました。');
      console.error('Token login error:', err);
      setLoginInProgress(false);
    }
  };

  // AuthProviderが初期ロードとリダイレクトをハンドルするので、このページのisLoadingは不要になることが多い
  // ただし、ログインボタン押下時のローディングは loginInProgress で管理
  if (authLoading && !isAuthenticated) {
    // AuthProviderがまだロード中かつ未認証の場合（ログインページ表示前など）
    return <LoadingSpinner message="準備中..." />;
  }


  return (
    <>
      <Head>
        <title>ログイン - Forgejo TODOアプリ</title>
      </Head>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <i className="fab fa-git-alt"></i>
            <h1>Forgejo TODO アプリ</h1>
            <p>
              {showApiTokenLogin
                ? 'Forgejo APIトークンでログインしてください'
                : 'Forgejoアカウントでログインしてください'}
            </p>
          </div>

          {error && (
            <div id="loginError" className="error-message" style={{ display: 'block' }}>
              {error}
            </div>
          )}

          {!showApiTokenLogin && (
            <div className="simple-login-section">
              <h3>
                <i className="fas fa-user"></i> Forgejoアカウントでログイン
              </h3>
              <form onSubmit={handleSimpleLogin}>
                <div className="form-group">
                  <label htmlFor="forgejoUrl">Forgejo URL</label>
                  <input
                    type="url"
                    id="forgejoUrl"
                    value={forgejoUrl}
                    onChange={(e) => setForgejoUrl(e.target.value)}
                    required
                    disabled={loginInProgress || authLoading}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="username">ユーザー名</label>
                    <input
                      type="text"
                      id="username"
                      placeholder="ユーザー名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={loginInProgress || authLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">パスワード</label>
                    <input
                      type="password"
                      id="password"
                      placeholder="パスワード"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loginInProgress || authLoading}
                    />
                  </div>
                </div>
                <button type="submit" id="simpleLoginBtn" className="simple-login-btn" disabled={loginInProgress || authLoading}>
                  {(loginInProgress || authLoading) ? (
                    <><i className="fas fa-spinner fa-spin"></i> ログイン中...</>
                  ) : (
                    <><i className="fas fa-sign-in-alt"></i> ログイン</>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="divider">
            <span>または</span>
          </div>

          {showApiTokenLogin && (
            <div className="api-login-section">
              <h3>
                <i className="fas fa-key"></i> APIトークンでログイン
              </h3>
              <form id="tokenLoginForm" onSubmit={handleTokenLogin}>
                <div className="form-group">
                  <label htmlFor="forgejoUrlApi">Forgejo URL</label>
                  <input
                    type="url"
                    id="forgejoUrlApi"
                    value={forgejoUrlApi}
                    onChange={(e) => setForgejoUrlApi(e.target.value)}
                    required
                    disabled={loginInProgress || authLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tokenInput">APIトークン</label>
                  <input
                    type="password" // Keep as password type for masking
                    id="tokenInput"
                    placeholder="APIトークンを入力してください"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    required
                    disabled={loginInProgress || authLoading}
                  />
                  <small>
                    <i className="fas fa-info-circle"></i>
                    Forgejoの設定 → アプリケーション → アクセストークンで生成
                  </small>
                </div>
                <button type="submit" id="loginBtn" className="login-btn" disabled={loginInProgress || authLoading}>
                   {(loginInProgress || authLoading) ? (
                    <><i className="fas fa-spinner fa-spin"></i> ログイン中...</>
                  ) : (
                    <><i className="fas fa-key"></i> APIトークンでログイン</>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="login-toggle">
            <button
              type="button"
              id="showTokenLoginBtn"
              className="toggle-btn"
              style={{ display: showApiTokenLogin ? 'none' : 'inline-flex' }}
              onClick={() => { setShowApiTokenLogin(true); setError(''); }}
              disabled={loginInProgress || authLoading}
            >
              <i className="fas fa-key"></i>
              APIトークンでログイン
            </button>
            <button
              type="button"
              id="showSimpleLoginBtn"
              className="toggle-btn"
              style={{ display: showApiTokenLogin ? 'inline-flex' : 'none' }}
              onClick={() => { setShowApiTokenLogin(false); setError(''); }}
              disabled={loginInProgress || authLoading}
            >
              <i className="fas fa-user"></i>
              ユーザー名でログイン
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
