# 📚 Forgejoリポジトリギャラリー (Next.js版)

Forgejoのユーザー名・パスワードでログインし、そのユーザーの権限範囲でForgejoリポジトリ一覧をカード形式で閲覧できるNext.js製ギャラリーアプリです。
APIトークン不要、**Basic認証のみでOK**。Huggingface風の美しいカードUIでリポジトリを一覧できます。

---

## 🌟 特徴

- 🔒 シンプル認証（Forgejoユーザー名・パスワードでログイン）
- 📚 権限範囲でリポジトリ一覧
- 🖼️ カードUI（Huggingface風）
- 🎨 forgejo.yamlによるカードカスタマイズ
- 💬 **Slack風チャット機能**（全ユーザー共通のリアルタイムチャット、プラットフォームのカラーマップを踏襲）
- � レスポンシブ対応
- 🌙 テーマ切替（ライト/ダーク）
- ⚛️ Next.js & React

---

## 🚀 使い方

```bash
git clone <repository-url>
cd forgejo-next-auth-gallery
npm install
npm run dev
```
ブラウザで `http://localhost:3000` を開いてください。

- 上部ナビバーの「チャット」ボタンからSlack風チャット画面に移動できます。

---

## 🖼️ ギャラリー画面

- ログイン後、あなたの権限で閲覧可能なForgejoリポジトリがカードグリッドで一覧表示されます。
- 各カードにはリポジトリ名、説明、オーナー、言語、スター数、更新日などが表示されます。
- リポジトリ直下に`forgejo.yaml`があれば、カードのタイトル・絵文字・グラデーション色が上書きされます。
- カードをクリックするとForgejoのリポジトリページが新しいタブで開きます。

---

## 💬 チャット画面

- ナビバーの「チャット」ボタンからアクセス
- Slack風のサイドバー＋メインエリアUI
- 全ユーザー共通のグローバルチャット（Forgejo認証必須）
- メッセージは即時反映（2秒ごと自動更新）
- プラットフォームのカラーマップを踏襲したデザイン

---

## 🛠️ 技術スタック

- Next.js (App Router)
- React
- JavaScript (ES6+)
- Global CSS
- Forgejo Basic認証 + REST API
- React Context API
- Font Awesome 6 (CDN)
- js-yaml

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

- 認証はBasic認証のみ対応（APIトークン不要）
- 各ユーザーの権限範囲でリポジトリ一覧が取得されます
- ForgejoのCORS設定が正しくない場合、リポジトリ一覧やforgejo.yamlが取得できません

---

## 📄 ライセンス

MIT License

---

このアプリケーションは、Forgejoコミュニティのために作成されました。
シンプルで使いやすいリポジトリギャラリーを通じて、日々の開発作業がより効率的になることを願っています。

🚀 Happy Coding with Forgejo Gallery (Next.js version)!
