# 🐳 Forgejo認証TODOアプリ (PostgreSQL + Docker版)

PostgreSQLデータベースとDocker Composeを使用したForgejo認証TODOアプリケーションです。

## 🚀 クイックスタート

### 前提条件
- Docker
- Docker Compose

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd forgejo-next-auth-todo-app-alpha
```

### 2. 環境変数の設定
```bash
cp .env.example .env
# 必要に応じて.envファイルを編集
```

### 3. Docker Composeで起動
```bash
# バックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

### 4. アクセス
- **アプリケーション**: http://localhost:3000
- **pgAdmin** (データベース管理): http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

## 🛠️ 開発環境

### ローカル開発（Docker使用）
```bash
# 開発モードで起動
docker-compose up

# 特定のサービスのみ起動
docker-compose up postgres pgadmin

# 依存関係をインストール（ローカル）
npm install

# ローカルでアプリを起動
npm run dev
```

### データベース操作
```bash
# PostgreSQLコンテナに接続
docker-compose exec postgres psql -U postgres -d forgejo_todo

# データベースのリセット
docker-compose down -v
docker-compose up postgres
```

## 📊 データベース構造

### テーブル設計
- **users**: Forgejoユーザー情報
- **todos**: TODOアイテム

詳細は `database/init.sql` を参照してください。

## 🔧 設定

### 環境変数
- `DATABASE_URL`: PostgreSQL接続URL
- `NEXTAUTH_URL`: アプリケーションURL
- `NEXTAUTH_SECRET`: NextAuth用秘密鍵

### Docker Compose設定
- `postgres`: PostgreSQL 15
- `app`: Next.jsアプリケーション
- `pgadmin`: データベース管理UI

## 📝 API仕様

### エンドポイント
- `GET /api/todos` - TODOリスト取得
- `POST /api/todos` - TODO作成
- `PUT /api/todos/[id]` - TODO更新
- `DELETE /api/todos/[id]` - TODO削除
- `GET /api/todos/stats` - 統計情報取得

### 認証
リクエストヘッダーに以下が必要：
- `Authorization: Bearer <token>`
- `X-User-Data: <JSON>`

## 🐛 トラブルシューティング

### よくある問題

1. **ポート衝突**
   ```bash
   # ポート使用状況確認
   docker-compose ps
   netstat -tlnp | grep :5432
   ```

2. **データベース接続エラー**
   ```bash
   # PostgreSQLログ確認
   docker-compose logs postgres
   
   # ヘルスチェック確認
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **ボリュームの問題**
   ```bash
   # ボリューム削除して再作成
   docker-compose down -v
   docker volume prune
   docker-compose up
   ```

## 🔄 データのバックアップ・復元

### バックアップ
```bash
docker-compose exec postgres pg_dump -U postgres forgejo_todo > backup.sql
```

### 復元
```bash
docker-compose exec -T postgres psql -U postgres forgejo_todo < backup.sql
```

## 🚀 本番環境デプロイ

1. **環境変数の設定**
   ```bash
   export NODE_ENV=production
   export NEXTAUTH_SECRET="your-production-secret"
   ```

2. **SSL証明書の設定**（必要に応じて）

3. **スケールアップ**
   ```bash
   docker-compose up --scale app=3
   ```

## 📚 参考リンク
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)