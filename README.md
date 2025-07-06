<h1 align="center">📚 Forgejoリポジトリギャラリー (Next.js版)</h1>

<div align="center">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" />
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Forgejo-FB7A28?style=for-the-badge&logo=forgejo&logoColor=white" />
</div>

---

Forgejoのユーザー名・パスワードでログインし、そのユーザーの権限範囲でForgejoリポジトリ一覧をカード形式で閲覧できるNext.js製ギャラリーアプリです。  
APIトークン不要、**Basic認証のみでOK**。Huggingface風の美しいカードUIでリポジトリを一覧できます。

---

## 🌟 特徴

- **🔒 シンプル認証**: Forgejoのユーザー名・パスワードでそのままログイン
- **📚 権限範囲でリポジトリ一覧**: ログインユーザーが閲覧可能なリポジトリのみ表示
- **🖼️ カードUI**: Huggingface風のカードグリッドでリポジトリを美しく表示
- **🎨 forgejo.yamlによるカードカスタマイズ**:  
  各リポジトリ直下に`forgejo.yaml`があれば、下記のようにカードのタイトル・絵文字・グラデーション色をカスタマイズ可能
  ```yaml
  title: Gradio MCP Minimal
  emoji: 🌍
  colorFrom: "#F28F16"
  colorTo: "#F2C49B"
  ```
- **📱 レスポンシブ**: モバイル・PC両対応
- **🌙 テーマ切替**: ライト/ダークテーマ対応
- **⚛️ Next.js & React**: モダンなフロントエンド技術

---

## 🚀 使い方

### 1. セットアップ

```bash
git clone <repository-url>
cd forgejo-next-auth-gallery
npm install
npm run dev
```
ブラウザで `http://localhost:3000` を開いてください。

### 2. ログイン方法

1. **Forgejo URL**: あなたのForgejoインスタンスのURLを入力（例: `http://192.168.0.131:3000/`）
2. **ユーザー名**: Forgejoのユーザー名を入力
3. **パスワード**: Forgejoのパスワードを入力
4. **「ログイン」ボタンをクリック**

> **APIトークンは不要です。ユーザー名とパスワードのみでOK！**

---

## 🖼️ ギャラリー画面

- ログイン後、あなたの権限で閲覧可能なForgejoリポジトリがカードグリッドで一覧表示されます。
- 各カードにはリポジトリ名、説明、オーナー、言語、スター数、更新日などが表示されます。
- **リポジトリ直下に`forgejo.yaml`があれば、カードのタイトル・絵文字・グラデーション色が上書きされます。**
- カードをクリックするとForgejoのリポジトリページが新しいタブで開きます。

---

## 🛠️ 技術スタック

- **フレームワーク**: Next.js (App Router)
- **UIライブラリ**: React
- **言語**: JavaScript (ES6+)
- **スタイリング**: Global CSS
- **認証**: Forgejo Basic認証 + REST API
- **状態管理**: React Context API (`AuthContext`)
- **アイコン**: Font Awesome 6 (CDN)
- **YAMLパース**: js-yaml

---

## 📁 プロジェクト構成

```
forgejo-next-auth-gallery/
├── public/                 # 静的ファイル
├── src/
│   ├── app/                # ルーティング・レイアウト
│   │   ├── login/          # ログインページ
│   │   ├── dashboard/      # ギャラリーページ
│   │   └── layout.jsx      # ルートレイアウト
│   ├── components/         # Reactコンポーネント
│   │   ├── ForgejoRepoGallery.jsx # リポジトリギャラリー
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── contexts/           # 認証状態管理
│   │   └── AuthContext.js
│   ├── lib/                # 認証・APIクライアント
│   │   └── forgejoAuth.js
│   └── styles/             # グローバルCSS
│       └── globals.css
├── docker-compose.yml      # Docker開発用
├── README.md
└── package.json
```

---

## ✨ 主要コンポーネント

- **`AuthContext.js`**  
  認証状態（ユーザー情報、認証済みか否か、ローディング状態）を管理。ログイン・ログアウト処理を提供。

- **`forgejoAuth.js`**  
  Forgejo APIとの通信を担当。Basic認証でユーザー情報・リポジトリ一覧を取得。

- **`ForgejoRepoGallery.jsx`**  
  ログインユーザーの権限範囲でリポジトリ一覧をカードグリッド表示。  
  各リポジトリ直下の`forgejo.yaml`を自動取得し、カードの見た目をカスタマイズ。

---

## 🔧 Forgejoサーバー設定（CORS）

Forgejoサーバー側でCORS (Cross-Origin Resource Sharing) 設定が必要です。  
`app.ini` の `[cors]` セクションに下記を追加してください。

```ini
[cors]
ENABLED = true
ALLOW_DOMAIN = *
METHODS = GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS
MAX_AGE = 10m
ALLOW_CREDENTIALS = false
HEADERS = Content-Type,User-Agent,Authorization
```
設定変更後、Forgejoサーバーを再起動してください。

---

## ⚠️ 注意事項

- **認証はBasic認証のみ対応**（APIトークン不要）
- 各ユーザーの権限範囲でリポジトリ一覧が取得されます
- ForgejoのCORS設定が正しくない場合、リポジトリ一覧やforgejo.yamlが取得できません

---

## 🤝 コントリビューション

プルリクエストや改善提案を歓迎します！

---

## 📄 ライセンス

MIT License

---

このアプリケーションは、Forgejoコミュニティのために作成されました。  
シンプルで使いやすいリポジトリギャラリーを通じて、日々の開発作業がより効率的になることを願っています。

🚀 Happy Coding with Forgejo Gallery (Next.js version)!
