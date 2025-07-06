// API Client for TODO operations

class TodoApiClient {
  constructor(authContext) {
    this.authContext = authContext;
    this.baseUrl = '/api/todos';
  }

  // 認証ヘッダーを取得
  getAuthHeaders() {
    const { user } = this.authContext;
    if (!user) {
      throw new Error('未認証です');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer dummy-token`, // 実際のトークンに置き換える
      'X-User-Data': JSON.stringify(user), // 一時的な解決策
    };
  }

  // エラーハンドリング
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    return await response.json();
  }

  // TODOリスト取得
  async getTodos(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        queryParams.append('priority', filters.priority);
      }

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  // TODO作成
  async createTodo(todoData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(todoData),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  // TODO更新
  async updateTodo(todoId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/${todoId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // TODO削除
  async deleteTodo(todoId) {
    try {
      const response = await fetch(`${this.baseUrl}/${todoId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // TODO統計取得
  async getTodoStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching todo stats:', error);
      throw error;
    }
  }
}

export default TodoApiClient;