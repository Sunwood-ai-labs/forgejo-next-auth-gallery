<h1 align="center">🔐 Forgejo認証TODOアプリ (Next.js版)</h1>

<div align="center">
</div>

<div align="center">

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Forgejo](https://img.shields.io/badge/Forgejo-FB7A28?style=for-the-badge&logo=forgejo&logoColor=white)

</div>

Forgejo APIを使用した認証機能付きTODOアプリケーションのNext.jsバージョンです。Forgejoのユーザー名・パスワード、またはAPIトークンを使用してログインし、個人のTODOを管理できます。このバージョンでは、ReactとNext.jsフレームワークを利用して構築されています。

## 🌟 特徴

- **🔒 簡単ログイン**: Forgejoのユーザー名・パスワードでそのままログイン
- **🔑 APIトークン対応**: 高度なユーザー向けAPIトークン認証
- **📋 高機能TODO管理**: タスクの追加、編集（モーダル）、削除、完了管理
- **🎯 優先度設定**: タスクに優先度（高・中・低）を設定可能
- **🔍 フィルタリング**: ステータス（全て・未完了・完了済み）と優先度でフィルタリング
- **📊 統計表示**: TODO数、完了率などのリアルタイム統計情報
- **💾 ローカル保存**: ブラウザのローカルストレージにデータを安全に保存
- **📱 レスポンシブ**: モバイルデバイスにも完全対応
- **🌙 モダンUI**: 直感的で使いやすいインターフェース（トースト通知、モーダル編集）
- **⚛️ Next.js & React**: ReactによるコンポーネントベースのUIとNext.jsによる効率的な開発体験

## 🚀 使い方

### 1. セットアップと起動

```bash
# プロジェクトをクローン (またはダウンロード)
# git clone <repository-url>
# cd forgejo-next-todo

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```
ブラウザで `http://localhost:3000` を開いてください。

### 2. ログイン方法

ログインページ (`/login`) が表示されます。

*   **Forgejoアカウントでログイン**:
    1.  **Forgejo URL**: あなたのForgejoインスタンスのURLを入力 (例: `http://192.168.0.131:3000/`)
    2.  **ユーザー名**: あなたのForgejoユーザー名を入力
    3.  **パスワード**: あなたのForgejoパスワードを入力
    4.  **「ログイン」**ボタンをクリック
*   **APIトークンでログイン**:
    1.  **「APIトークンでログイン」**ボタンをクリックしてフォームを切り替え
    2.  **Forgejo URL**: あなたのForgejoインスタンスのURLを入力
    3.  **APIトークン**: Forgejoで生成したアクセストークンを入力
        *   Forgejoにログイン → 右上のアバター → **設定**
        *   **アプリケーション** → **アクセストークンの管理**
        *   **新しいトークンを生成**（`read:user` 権限が最低限必要です）
    4.  **「APIトークンでログイン」**ボタンをクリック

認証成功後、TODOアプリのダッシュボード (`/dashboard`) が表示されます。

### 3. TODO管理

ダッシュボードで以下の操作が可能です。
- **新しいTODO追加**: タイトル、説明（任意）、優先度を設定して追加
- **TODO編集**: TODOアイテムの編集ボタンをクリックするとモーダルが開き、内容を修正可能
- **完了/未完了切り替え**: チェックボタンでステータス変更
- **TODO削除**: 削除ボタンで不要なTODOを削除（確認ダイアログあり）
- **フィルタリング**: ステータスや優先度でTODOを絞り込み

## 🛠️ 技術スタック

- **フレームワーク**: Next.js (App Router)
- **UIライブラリ**: React
- **言語**: JavaScript (ES6+)
- **スタイリング**: Global CSS (style.cssベース)
- **認証**: Forgejo Basic認証 + REST API (クライアントサイドで処理)
- **状態管理**: React Context API (`AuthContext`), React Hooks (`useState`, `useEffect`)
- **データ保存**: Browser LocalStorage
- **アイコン**: Font Awesome 6 (CDN)

## 📁 プロジェクト構造 (Next.js App Router)

```
forgejo-next-todo/
├── public/                 # 静的ファイル (画像など)
├── src/
│   ├── app/                # App Router ルーティングディレクトリ
│   │   ├── login/page.jsx  # ログインページ
│   │   ├── dashboard/page.jsx # ダッシュボードページ
│   │   └── layout.jsx      # ルートレイアウト (AuthProviderを含む)
│   ├── components/         # Reactコンポーネント
│   │   ├── TodoApp.jsx     # TODO管理のメインコンポーネント
│   │   ├── Modal.jsx       # 汎用モーダルコンポーネント
│   │   └── LoadingSpinner.jsx # ローディング表示コンポーネント
│   ├── contexts/           # React Context
│   │   └── AuthContext.js  # 認証状態管理コンテキスト
│   ├── lib/                # ライブラリ、ユーティリティ関数
│   │   └── forgejoAuth.js  # Forgejo認証サービスクラス (クライアントサイド)
│   └── styles/             # スタイルシート
│       └── globals.css     # グローバルCSS
├── .eslintrc.json          # ESLint設定
├── next.config.mjs         # Next.js設定
└── package.json            # プロジェクト定義、依存関係
```

## ✨ 主要コンポーネントと機能

### `AuthContext.js`
- アプリケーション全体の認証状態（ユーザー情報、認証済みか否か、ローディング状態）を管理。
- ログイン、ログアウト処理を提供。
- 未認証ユーザーのアクセス制御（リダイレクト）。

### `forgejoAuth.js`
- Forgejo APIとの通信を担当するクライアントサイドのサービスクラス。
- Basic認証、APIトークン認証によるユーザー情報取得。
- 認証情報のローカルストレージへの保存・復元。

### `pages/login/page.jsx`
- ログインフォーム（ユーザー名/パスワード、APIトークン）を表示。
- `AuthContext` を利用してログイン処理を実行。

### `pages/dashboard/page.jsx`
- 認証済みユーザー向けのメインページ。
- ヘッダーにユーザー情報とログアウトボタンを表示。
- `TodoApp` コンポーネントをレンダリング。

### `components/TodoApp.jsx`
- TODOのCRUD操作、フィルタリング、統計表示の全機能を提供。
- ローカルストレージへのTODOデータの永続化。
- TODO編集用のモーダル、操作結果のトースト通知を内包。

### `components/Modal.jsx`
- 汎用的なモーダル表示コンポーネント。

## 🔧 Forgejo CORS設定

Forgejoサーバー側でCORS (Cross-Origin Resource Sharing) 設定が必要です。
Forgejoの設定ファイル (`app.ini`) の `[cors]` セクションに以下を追加または修正してください。
Next.jsのデフォルト開発ポートは `3000` です。

```ini
[cors]
ENABLED = true
ALLOW_DOMAIN = localhost:3000, 127.0.0.1:3000 ; 開発環境のポートを追加
ALLOW_SUBDOMAIN = false
METHODS = GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS
MAX_AGE = 86400
ALLOW_CREDENTIALS = true
```
設定変更後、Forgejoサーバーを再起動してください。

## 🤝 コントリビューション
プルリクエストや改善提案を歓迎します！

## 📄 ライセンス
MIT License

---

このアプリケーションは、Forgejoコミュニティのために作成されました。シンプルで使いやすいTODO管理を通じて、日々の開発作業がより効率的になることを願っています。

🚀 Happy Coding with Forgejo TODO App (Next.js version)!
