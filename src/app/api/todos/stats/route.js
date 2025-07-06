import { NextResponse } from 'next/server';
import { TodoService } from '../../../../lib/database/todoService.js';

// 認証チェック関数
async function authenticateRequest(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('認証ヘッダーがありません');
    }

    const token = authHeader.replace(/^Bearer\s+/, '');
    const userData = JSON.parse(request.headers.get('X-User-Data') || '{}');
    
    if (!userData.id) {
      throw new Error('無効なユーザーデータ');
    }

    return await TodoService.getOrCreateUser(userData);
  } catch (error) {
    throw new Error(`認証エラー: ${error.message}`);
  }
}

// GET: TODO統計情報取得
export async function GET(request) {
  try {
    const user = await authenticateRequest(request);
    const stats = await TodoService.getTodoStats(user.id);
    
    return NextResponse.json({
      success: true,
      data: {
        total: parseInt(stats.total) || 0,
        completed: parseInt(stats.completed) || 0,
        pending: parseInt(stats.pending) || 0,
        completionRate: parseInt(stats.completion_rate) || 0
      }
    });
  } catch (error) {
    console.error('GET /api/todos/stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('認証') ? 401 : 500 }
    );
  }
}