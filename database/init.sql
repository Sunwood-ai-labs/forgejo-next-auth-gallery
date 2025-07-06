-- PostgreSQL初期化スクリプト
-- forgejo_gallery データベースの初期テーブル作成

-- チャットメッセージテーブル
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    user_login VARCHAR(255) NOT NULL,
    user_full_name VARCHAR(255),
    user_avatar_url TEXT,
    text TEXT NOT NULL,
    channel VARCHAR(255) NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- チャットメッセージのインデックス
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- サンプルデータ（開発用）
INSERT INTO chat_messages (message_id, user_id, user_login, user_full_name, text, channel, created_at)
VALUES 
    ('sample-1', 1, 'admin', 'Administrator', 'チャット機能のテストメッセージです', 'general', CURRENT_TIMESTAMP),
    ('sample-2', 1, 'admin', 'Administrator', '# バグ報告\n\nログイン画面でエラーが発生しています', 'general', CURRENT_TIMESTAMP)
ON CONFLICT (message_id) DO NOTHING;