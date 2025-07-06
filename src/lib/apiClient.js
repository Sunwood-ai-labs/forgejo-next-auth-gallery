/**
 * Forgejo APIクライアント（リポジトリ取得専用）
 */

import forgejoAuthInstance from './forgejoAuth';

class ForgejoApiClient {
  constructor(authContext) {
    this.authContext = authContext;
  }

  // 認証ユーザーのForgejoリポジトリ一覧取得
  async getForgejoRepos() {
    if (!forgejoAuthInstance || !forgejoAuthInstance.isAuthenticated()) {
      throw new Error('Forgejo認証が必要です');
    }
    return await forgejoAuthInstance.apiRequest('/user/repos', { method: 'GET' });
  }

  // 公開Forgejoリポジトリ一覧取得（未認証でもOK）
  static async getPublicForgejoRepos(forgejoUrl) {
    if (!forgejoUrl) {
      throw new Error('ForgejoのURLが指定されていません');
    }
    const baseUrl = forgejoUrl.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/api/v1/repos/search?private=false&limit=100`;
    try {
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        const errText = await res.text();
        let msg = `公開リポジトリ一覧の取得に失敗しました (${res.status})`;
        try {
          const errJson = JSON.parse(errText);
          msg = errJson.message || msg;
        } catch {
          if (errText) msg = `${msg}: ${errText}`;
        }
        throw new Error(msg);
      }
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error(`Forgejoサーバーに接続できません: ${apiUrl}`);
      }
      throw error;
    }
  }
}

export default ForgejoApiClient;
