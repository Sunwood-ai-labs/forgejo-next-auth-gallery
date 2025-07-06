/**
 * Forgejo API認証クラス (Next.js Client-Side)
 * Forgejo APIを使用してユーザー認証とAPI呼び出しを管理
 */
class ForgejoAuth {
    constructor() {
        this.baseUrl = null;
        this.token = null; // API Token or Basic Auth (username:password)
        this.userInfo = null;
        this.isInitialized = false;
        this.storageKey = 'forgejo_auth_next';
    }

    /**
     * 認証システムを初期化 (クライアントサイドでのみ呼び出し)
     */
    async initialize() {
        if (typeof window === 'undefined') return; // サーバーサイドでは何もしない

        if (this.isInitialized) return;

        try {
            const savedAuth = this._loadSavedAuth();
            if (savedAuth && savedAuth.token && savedAuth.baseUrl) {
                // トークンがBasic認証の形式かAPIトークンかを判断して再認証
                if (savedAuth.token.includes(':')) { // Basic Auth
                    // Basic Authの場合、ユーザー名とパスワードの再入力が必要なため、ここでは単純に復元しない。
                    // もしくは、保存されたユーザー情報で代用する。今回はユーザー情報があればOKとする。
                    if (savedAuth.userInfo) {
                        this.baseUrl = savedAuth.baseUrl;
                        this.token = savedAuth.token;
                        this.userInfo = savedAuth.userInfo;
                         console.log('Basic Auth session restored from localStorage (userInfo only)');
                    } else {
                        this._clearSavedAuth(); // 不完全な情報はクリア
                    }
                } else { // API Token
                    await this.loginWithToken(savedAuth.token, savedAuth.baseUrl, false);
                    console.log('API Token session restored from localStorage');
                }
            }
        } catch (error) {
            console.warn('Failed to restore saved authentication:', error.message);
            this._clearSavedAuth();
        } finally {
            this.isInitialized = true;
        }
    }

    /**
     * APIトークンでログイン
     * @param {string} apiToken - Forgejo APIトークン
     * @param {string} forgejoBaseUrl - Forgejo インスタンスのURL
     * @param {boolean} saveAuthData - 認証情報を保存するかどうか
     * @returns {Promise<Object>} ユーザー情報
     */
    async loginWithToken(apiToken, forgejoBaseUrl, saveAuthData = true) {
        if (!apiToken || !forgejoBaseUrl) {
            throw new Error('APIトークンとForgejo URLは必須です。');
        }
        this.baseUrl = forgejoBaseUrl.replace(/\/$/, '');
        this.token = apiToken; // APIトークンを直接保存

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `認証に失敗しました (${response.status})`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    // errorTextがJSONでない場合はそのまま利用
                     if(errorText) errorMessage = `${errorMessage}: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            this.userInfo = await response.json();

            if (saveAuthData) {
                this._saveAuth();
            }

            console.log('Login successful with API Token:', this.userInfo.login);
            return this.userInfo;

        } catch (error) {
            this.token = null; // 失敗したらトークンをクリア
            this.userInfo = null;
            if (error.message.includes('Failed to fetch')) {
                 throw new Error(`Forgejoサーバーに接続できません。URLを確認してください: ${this.baseUrl}`);
            }
            throw error;
        }
    }

    /**
     * Basic認証でログイン（ユーザー名とパスワード）
     * @param {string} username
     * @param {string} password
     * @param {string} forgejoBaseUrl
     * @param {boolean} saveAuthData
     * @returns {Promise<Object>} ユーザー情報
     */
    async loginWithBasicAuth(username, password, forgejoBaseUrl, saveAuthData = true) {
        if (!username || !password || !forgejoBaseUrl) {
            throw new Error('ユーザー名、パスワード、Forgejo URLは必須です。');
        }
        this.baseUrl = forgejoBaseUrl.replace(/\/$/, '');
        const basicAuthToken = btoa(`${username}:${password}`);
        this.token = basicAuthToken; // "username:password" 形式ではなく、Base64エンコードされたトークンを保存

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `認証に失敗しました (${response.status})`;
                 try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                     if(errorText) errorMessage = `${errorMessage}: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            this.userInfo = await response.json();

            if (saveAuthData) {
                this._saveAuth();
            }

            console.log('Login successful with Basic Auth:', this.userInfo.login);
            return this.userInfo;

        } catch (error) {
            this.token = null;
            this.userInfo = null;
            if (error.message.includes('Failed to fetch')) {
                 throw new Error(`Forgejoサーバーに接続できません。URLを確認してください: ${this.baseUrl}`);
            }
            throw error;
        }
    }


    /**
     * ログアウト
     */
    logout() {
        this.baseUrl = null;
        this.token = null;
        this.userInfo = null;
        this.isInitialized = false; // 再初期化が必要になるように
        this._clearSavedAuth();
        console.log('Logged out');
    }

    /**
     * 認証状態を確認
     * @returns {boolean} 認証済みかどうか
     */
    isAuthenticated() {
        return !!(this.token && this.userInfo && this.baseUrl);
    }

    /**
     * ユーザー情報を取得
     * @returns {Object|null} ユーザー情報
     */
    getUserInfo() {
        return this.userInfo;
    }

    /**
     * 現在のトークンを取得 (Basic Authの場合はBase64エンコードされたもの)
     * @returns {string|null}
     */
    getToken() {
        return this.token;
    }

    /**
     * ベースURLを取得
     * @returns {string|null}
     */
    getBaseUrl() {
        return this.baseUrl;
    }

    /**
     * 認証情報をローカルストレージに保存 (プライベートメソッド)
     */
    _saveAuth() {
        if (typeof window !== 'undefined') {
            try {
                const authData = {
                    token: this.token, // APIトークンまたはBase64エンコードされたBasic認証情報
                    baseUrl: this.baseUrl,
                    userInfo: this.userInfo,
                    timestamp: Date.now()
                };
                localStorage.setItem(this.storageKey, JSON.stringify(authData));
            } catch (error)
            {
                console.warn('Failed to save auth data to localStorage:', error);
            }
        }
    }

    /**
     * 保存された認証情報を読み込み (プライベートメソッド)
     * @returns {Object|null} 認証情報
     */
    _loadSavedAuth() {
        if (typeof window !== 'undefined') {
            try {
                const authData = localStorage.getItem(this.storageKey);
                if (authData) {
                    const parsed = JSON.parse(authData);
                    // 7日以上古い認証情報は無効とする
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7日間
                    if (Date.now() - parsed.timestamp > maxAge) {
                        this._clearSavedAuth();
                        console.log('Saved auth data expired and cleared.');
                        return null;
                    }
                    return parsed;
                }
            } catch (error) {
                console.warn('Failed to load auth data from localStorage:', error);
                this._clearSavedAuth(); // 破損している可能性があるのでクリア
            }
        }
        return null;
    }

    /**
     * 保存された認証情報をクリア (プライベートメソッド)
     */
    _clearSavedAuth() {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(this.storageKey);
            } catch (error) {
                 console.warn('Failed to clear auth data from localStorage:', error);
            }
        }
    }

    /**
     * 認証済みAPIリクエストを実行
     * @param {string} endpoint - APIエンドポイント (例: /user/repos)
     * @param {Object} options - fetchオプション
     * @returns {Promise<any>} APIレスポンス
     */
    async apiRequest(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('認証が必要です。再度ログインしてください。');
        }

        const url = `${this.baseUrl}/api/v1${endpoint}`;

        let authHeaderValue = '';
        // this.tokenが":"を含むか、またはBase64文字列として妥当かで判断もできるが、
        // loginWithToken と loginWithBasicAuth で token の性質を明確にしているので、
        // ここではシンプルにtokenの形式で判断する。
        // APIトークンは通常コロンを含まない。Basic認証トークンはbtoa()の結果なのでコロンを含まないが、
        // loginWithBasicAuthで保存するtokenはbtoaの結果。
        // loginWithTokenで保存するtokenは生のAPIトークン。
        // ここでは、保存されたトークンがAPIトークンかBasic認証かを区別する方法が必要。
        // 一つの方法は、保存時に type: 'api' | 'basic' も保存すること。
        // 現状の実装では、トークンが ":" を含んでいたらBasic認証時の元データとみなし、
        // そうでなければAPIトークンか、Basic認証のBase64エンコード済みトークンとみなす。
        // より堅牢なのは、login時にauthTypeを保存すること。
        // 今回は、initializeの時点でtokenの形式を判定し、適切にthis.tokenに格納している前提。
        // Basic認証の場合、this.tokenにはbtoa(`${username}:${password}`)が入る。
        // APIトークンの場合、this.tokenにはAPIトークンそのものが入る。
        // そのため、Authorizationヘッダーのプレフィックスで区別する。
        // APIトークンは通常 `token ` プレフィックス。
        // Basic認証は `Basic ` プレフィックス。
        // `forgejoAuth.token` にはプレフィックスを含めない方針とする。

        const isLikelyBasicAuth = this.userInfo && this.userInfo.login && this.token && this.token.length > 40 && this.token.endsWith('='); // heuristic

        if (isLikelyBasicAuth && this.token.match(/^[A-Za-z0-9+/=]+$/)) { // Base64 encoded
             authHeaderValue = `Basic ${this.token}`;
        } else { // Assumed API Token
             authHeaderValue = `token ${this.token}`;
        }


        const requestOptions = {
            ...options,
            headers: {
                'Authorization': authHeaderValue,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, requestOptions);

            if (response.status === 401) { // Unauthorized
                this.logout(); // 認証情報をクリアしてログアウト状態にする
                throw new Error('認証トークンが無効です。再度ログインしてください。');
            }
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `APIエラー (${response.status})`;
                 try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                     if(errorText) errorMessage = `${errorMessage}: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                 if (response.status === 204) return null; // No content
                return await response.json();
            }
            return await response.text(); // JSONでない場合はテキストで返す

        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error(`Forgejoサーバーに接続できません: ${url}`);
            }
            throw error;
        }
    }
}

// クライアントサイドでのみインスタンスを生成・エクスポート
let forgejoAuthInstance = null;
if (typeof window !== 'undefined') {
    forgejoAuthInstance = new ForgejoAuth();
    forgejoAuthInstance.initialize(); // クライアントでのみ初期化
}

export default forgejoAuthInstance;
export { ForgejoAuth }; // クラス自体もエクスポート（テストや特定用途向け）
