import { query } from './connection.js';

export class TodoService {
  
  // ユーザーの取得または作成
  static async getOrCreateUser(forgejoUserData) {
    try {
      // 既存ユーザーを検索
      const existingUser = await query(
        'SELECT * FROM users WHERE forgejo_user_id = $1',
        [forgejoUserData.id.toString()]
      );

      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];
        const fullName = forgejoUserData.full_name || forgejoUserData.login;
        
        // ユーザー情報に変更があるかチェック
        const needsUpdate =
          user.username !== forgejoUserData.login ||
          user.email !== forgejoUserData.email ||
          user.full_name !== fullName ||
          user.avatar_url !== forgejoUserData.avatar_url;
        
        if (needsUpdate) {
          // 変更がある場合のみ更新
          const updatedUser = await query(
            `UPDATE users
             SET username = $2, email = $3, full_name = $4, avatar_url = $5, updated_at = CURRENT_TIMESTAMP
             WHERE forgejo_user_id = $1
             RETURNING *`,
            [
              forgejoUserData.id.toString(),
              forgejoUserData.login,
              forgejoUserData.email,
              fullName,
              forgejoUserData.avatar_url
            ]
          );
          return updatedUser.rows[0];
        } else {
          // 変更がない場合は既存ユーザーをそのまま返す
          return user;
        }
      } else {
        // 新規ユーザーを作成
        const newUser = await query(
          `INSERT INTO users (forgejo_user_id, username, email, full_name, avatar_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            forgejoUserData.id.toString(),
            forgejoUserData.login,
            forgejoUserData.email,
            forgejoUserData.full_name || forgejoUserData.login,
            forgejoUserData.avatar_url
          ]
        );
        return newUser.rows[0];
      }
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      throw error;
    }
  }

  // TODOリストの取得
  static async getTodos(userId, filters = {}) {
    try {
      let queryText = `
        SELECT id, title, description, priority, completed, created_at, updated_at, completed_at
        FROM todos 
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramCount = 1;

      // フィルター条件を追加
      if (filters.status) {
        if (filters.status === 'completed') {
          queryText += ` AND completed = true`;
        } else if (filters.status === 'pending') {
          queryText += ` AND completed = false`;
        }
      }

      if (filters.priority && filters.priority !== 'all') {
        paramCount++;
        queryText += ` AND priority = $${paramCount}`;
        params.push(filters.priority);
      }

      queryText += ` ORDER BY created_at DESC`;

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error in getTodos:', error);
      throw error;
    }
  }

  // TODO作成
  static async createTodo(userId, todoData) {
    try {
      const result = await query(
        `INSERT INTO todos (user_id, title, description, priority, completed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          userId,
          todoData.title,
          todoData.description || null,
          todoData.priority || 'medium',
          todoData.completed || false
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in createTodo:', error);
      throw error;
    }
  }

  // TODO更新
  static async updateTodo(userId, todoId, updates) {
    try {
      const setClause = [];
      const params = [userId, todoId];
      let paramCount = 2;

      // 動的にUPDATE文を構築
      const allowedFields = ['title', 'description', 'priority', 'completed'];
      allowedFields.forEach(field => {
        if (updates.hasOwnProperty(field)) {
          paramCount++;
          setClause.push(`${field} = $${paramCount}`);
          params.push(updates[field]);
        }
      });

      // completedの変更時にcompleted_atも更新
      if (updates.hasOwnProperty('completed')) {
        paramCount++;
        setClause.push(`completed_at = $${paramCount}`);
        params.push(updates.completed ? new Date().toISOString() : null);
      }

      if (setClause.length === 0) {
        throw new Error('No valid fields to update');
      }

      const queryText = `
        UPDATE todos 
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND id = $2
        RETURNING *
      `;

      const result = await query(queryText, params);
      
      if (result.rows.length === 0) {
        throw new Error('Todo not found or access denied');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in updateTodo:', error);
      throw error;
    }
  }

  // TODO削除
  static async deleteTodo(userId, todoId) {
    try {
      const result = await query(
        'DELETE FROM todos WHERE user_id = $1 AND id = $2 RETURNING *',
        [userId, todoId]
      );

      if (result.rows.length === 0) {
        throw new Error('Todo not found or access denied');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in deleteTodo:', error);
      throw error;
    }
  }

  // TODO統計情報の取得
  static async getTodoStats(userId) {
    try {
      const result = await query(
        `SELECT 
           COUNT(*) as total,
           COUNT(CASE WHEN completed = true THEN 1 END) as completed,
           COUNT(CASE WHEN completed = false THEN 1 END) as pending,
           ROUND(
             (COUNT(CASE WHEN completed = true THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0))
           ) as completion_rate
         FROM todos 
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in getTodoStats:', error);
      throw error;
    }
  }
}
