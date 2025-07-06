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

// PUT: TODO更新
export async function PUT(request, { params }) {
  try {
    const user = await authenticateRequest(request);
    const todoId = params.id;
    const body = await request.json();

    // バリデーション
    if (body.title !== undefined && (!body.title || !body.title.trim())) {
      return NextResponse.json(
        { success: false, error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const updates = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.completed !== undefined) updates.completed = body.completed;

    const updatedTodo = await TodoService.updateTodo(user.id, parseInt(todoId), updates);

    return NextResponse.json({
      success: true,
      data: updatedTodo
    });
  } catch (error) {
    console.error(`PUT /api/todos/${params.id} error:`, error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return NextResponse.json(
        { success: false, error: 'TODOが見つからないか、アクセス権限がありません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('認証') ? 401 : 500 }
    );
  }
}

// DELETE: TODO削除
export async function DELETE(request, { params }) {
  try {
    const user = await authenticateRequest(request);
    const todoId = params.id;

    const deletedTodo = await TodoService.deleteTodo(user.id, parseInt(todoId));

    return NextResponse.json({
      success: true,
      data: deletedTodo
    });
  } catch (error) {
    console.error(`DELETE /api/todos/${params.id} error:`, error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return NextResponse.json(
        { success: false, error: 'TODOが見つからないか、アクセス権限がありません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('認証') ? 401 : 500 }
    );
  }
}