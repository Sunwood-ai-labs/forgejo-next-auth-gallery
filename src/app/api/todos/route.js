import { NextResponse } from 'next/server';
import { TodoService } from '../../../lib/database/todoService.js';
import forgejoAuthInstance from '../../../lib/forgejoAuth.js';

// 認証チェック関数
async function authenticateRequest(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('認証ヘッダーがありません');
    }

    // Forgejo認証情報からユーザーを検証
    // この部分は実際のForgejoトークン検証ロジックに置き換える必要があります
    const token = authHeader.replace(/^Bearer\s+/, '');
    
    // TODO: 実際のForgejo API検証を実装
    // 今回はシンプルにヘッダーからユーザー情報を取得
    const userData = JSON.parse(request.headers.get('X-User-Data') || '{}');
    
    if (!userData.id) {
      throw new Error('無効なユーザーデータ');
    }

    return await TodoService.getOrCreateUser(userData);
  } catch (error) {
    throw new Error(`認証エラー: ${error.message}`);
  }
}

// GET: TODOリスト取得
export async function GET(request) {
  try {
    const user = await authenticateRequest(request);
    
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status'),
      priority: searchParams.get('priority')
    };

    const todos = await TodoService.getTodos(user.id, filters);
    
    return NextResponse.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('認証') ? 401 : 500 }
    );
  }
}

// POST: 新しいTODO作成
export async function POST(request) {
  try {
    const user = await authenticateRequest(request);
    const body = await request.json();

    // バリデーション
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const todoData = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      priority: body.priority || 'medium',
      completed: body.completed || false
    };

    const newTodo = await TodoService.createTodo(user.id, todoData);

    return NextResponse.json({
      success: true,
      data: newTodo
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('認証') ? 401 : 500 }
    );
  }
}