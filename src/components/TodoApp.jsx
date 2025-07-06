"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import TodoApiClient from '../lib/apiClient';

// Helper function for HTML escaping (simplified)
const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

export default function TodoApp() {
    const auth = useAuth();
    const [apiClient] = useState(() => new TodoApiClient(auth));
    
    const [todos, setTodos] = useState([]);
    const [todoTitle, setTodoTitle] = useState('');
    const [todoDescription, setTodoDescription] = useState('');
    const [todoPriority, setTodoPriority] = useState('medium');
    const [loading, setLoading] = useState(false);

    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    // Edit form states
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState('medium');

    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    
    // Stats state
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completionRate: 0 });
    
    // デバウンス用のタイマー参照
    const statsLoadTimerRef = useRef(null);

    // Load todos from API on initial render
    const loadTodos = useCallback(async () => {
        if (!auth.user) return;
        
        try {
            setLoading(true);
            const todosData = await apiClient.getTodos({ status: filterStatus, priority: filterPriority });
            setTodos(todosData);
        } catch (error) {
            console.error("Error loading todos:", error);
            showToast('TODOの読み込みに失敗しました', 'error');
        } finally {
            setLoading(false);
        }
    }, [auth.user, filterStatus, filterPriority, apiClient]);
    
    // Load stats from API (デバウンス付き)
    const loadStats = useCallback(async () => {
        if (!auth.user) return;
        
        // 既存のタイマーをクリア
        if (statsLoadTimerRef.current) {
            clearTimeout(statsLoadTimerRef.current);
        }
        
        // 500ms後に実行（デバウンス）
        statsLoadTimerRef.current = setTimeout(async () => {
            try {
                const statsData = await apiClient.getTodoStats();
                setStats(statsData);
            } catch (error) {
                console.error("Error loading stats:", error);
            }
        }, 500);
    }, [auth.user, apiClient]);

    useEffect(() => {
        loadTodos();
        loadStats();
    }, [loadTodos, loadStats]);

    // クリーンアップ関数でタイマーをクリア
    useEffect(() => {
        return () => {
            if (statsLoadTimerRef.current) {
                clearTimeout(statsLoadTimerRef.current);
            }
        };
    }, []);

    // Show toast message
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'info' });
        }, 3000);
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!todoTitle.trim()) {
            showToast('TODOのタイトルを入力してください', 'error');
            return;
        }
        
        try {
            setLoading(true);
            const todoData = {
                title: todoTitle.trim(),
                description: todoDescription.trim(),
                priority: todoPriority
            };
            
            await apiClient.createTodo(todoData);
            setTodoTitle('');
            setTodoDescription('');
            setTodoPriority('medium');
            showToast('TODOを追加しました', 'success');
            
            // Reload todos and stats
            await loadTodos();
            loadStats(); // デバウンス付きで実行
        } catch (error) {
            console.error('Error adding todo:', error);
            showToast('TODOの追加に失敗しました', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleTodoComplete = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        
        try {
            setLoading(true);
            await apiClient.updateTodo(id, { completed: !todo.completed });
            showToast(todo.completed ? `「${todo.title}」を未完了に戻しました` : `「${todo.title}」を完了しました`, 'success');
            
            // Reload todos and stats
            await loadTodos();
            loadStats(); // デバウンス付きで実行
        } catch (error) {
            console.error('Error toggling todo:', error);
            showToast('TODOの更新に失敗しました', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteTodo = async (id) => {
        const todoToDelete = todos.find(todo => todo.id === id);
        if (!todoToDelete || !confirm(`「${escapeHtml(todoToDelete.title)}」を削除しますか？`)) {
            return;
        }
        
        try {
            setLoading(true);
            await apiClient.deleteTodo(id);
            showToast(`「${escapeHtml(todoToDelete.title)}」を削除しました`, 'success');
            
            // Reload todos and stats
            await loadTodos();
            loadStats(); // デバウンス付きで実行
        } catch (error) {
            console.error('Error deleting todo:', error);
            showToast('TODOの削除に失敗しました', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (todo) => {
        setEditingTodo(todo);
        setEditTitle(todo.title);
        setEditDescription(todo.description);
        setEditPriority(todo.priority);
        setIsEditModalOpen(true);
    };

    const handleUpdateTodo = async (e) => {
        e.preventDefault();
        if (!editingTodo || !editTitle.trim()) {
            showToast('タイトルは必須です', 'error');
            return;
        }
        
        try {
            setLoading(true);
            const updates = {
                title: editTitle.trim(),
                description: editDescription.trim(),
                priority: editPriority
            };
            
            await apiClient.updateTodo(editingTodo.id, updates);
            setIsEditModalOpen(false);
            setEditingTodo(null);
            showToast('TODOを更新しました', 'success');
            
            // Reload todos and stats
            await loadTodos();
            loadStats(); // デバウンス付きで実行
        } catch (error) {
            console.error('Error updating todo:', error);
            showToast('TODOの更新に失敗しました', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter todos on client side (API already filters, but keeping for UI responsiveness)
    const filteredTodos = todos;
    
    // Use stats from API instead of calculating locally
    const { total: totalTodos, completed: completedTodosCount, pending: pendingTodosCount, completionRate } = stats;

    const priorityText = { low: '低', medium: '中', high: '高' };

    return (
        <>
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast toast-${toast.type}`}>
                    {escapeHtml(toast.message)}
                </div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="TODO編集">
                {editingTodo && (
                    <form id="editTodoFormModal" onSubmit={handleUpdateTodo}>
                        <div className="form-group">
                            <label htmlFor="modalEditTitle">タイトル</label>
                            <input
                                type="text"
                                id="modalEditTitle"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="modalEditDescription">説明</label>
                            <textarea
                                id="modalEditDescription"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="modalEditPriority">優先度</label>
                            <select
                                id="modalEditPriority"
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value)}
                            >
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button type="button" className="toggle-btn" onClick={() => setIsEditModalOpen(false)}>
                                キャンセル
                            </button>
                            <button type="submit" className="simple-login-btn" style={{marginTop: 0, marginBottom: 0}} disabled={loading}>
                                {loading ? '更新中...' : '更新'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* TODO Form Section */}
            <div className="todo-form-container">
                <h2><i className="fas fa-plus-circle"></i> 新しいTODO</h2>
                <form id="todoForm" className="todo-form" onSubmit={handleAddTodo}>
                    <div className="form-row">
                        <input
                            type="text"
                            id="todoTitle"
                            placeholder="TODOのタイトルを入力..."
                            value={todoTitle}
                            onChange={(e) => setTodoTitle(e.target.value)}
                            required
                        />
                        <select
                            id="todoPriority"
                            value={todoPriority}
                            onChange={(e) => setTodoPriority(e.target.value)}
                        >
                            <option value="low">低</option>
                            <option value="medium">中</option>
                            <option value="high">高</option>
                        </select>
                        <button type="submit" disabled={loading}>
                            {loading ? <><i className="fas fa-spinner fa-spin"></i> 追加中...</> : <><i className="fas fa-plus"></i> 追加</>}
                        </button>
                    </div>
                    <textarea
                        id="todoDescription"
                        placeholder="詳細説明（任意）"
                        value={todoDescription}
                        onChange={(e) => setTodoDescription(e.target.value)}
                        rows="3"
                    ></textarea>
                </form>
            </div>

            {/* TODO List Section */}
            <div className="todo-list-container">
                <div className="todo-list-header">
                    <h2><i className="fas fa-list"></i> TODOリスト</h2>
                    <div className="filter-controls">
                        <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} disabled={loading}>
                            <option value="all">全て</option>
                            <option value="pending">未完了</option>
                            <option value="completed">完了済み</option>
                        </select>
                        <select id="filterPriority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} disabled={loading}>
                            <option value="all">全優先度</option>
                            <option value="high">高</option>
                            <option value="medium">中</option>
                            <option value="low">低</option>
                        </select>
                    </div>
                </div>

                <div id="todoList" className="todo-list">
                    {filteredTodos.length === 0 && (
                        <div id="emptyState" className="empty-state">
                            <i className="fas fa-clipboard-list"></i>
                            <h3>TODOがありません</h3>
                            <p>新しいTODOを追加して始めましょう！</p>
                        </div>
                    )}
                    {filteredTodos.map(todo => (
                        <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                            <div className="todo-header">
                                <div>
                                    <div className="todo-title">{escapeHtml(todo.title)}</div>
                                    <div className="todo-meta">
                                        <span className={`priority-badge priority-${todo.priority}`}>
                                            {priorityText[todo.priority] || todo.priority}
                                        </span>
                                        <span><i className="fas fa-calendar-plus"></i> {new Date(todo.createdAt).toLocaleString('ja-JP')}</span>
                                        {todo.completedAt && <span><i className="fas fa-check-circle"></i> {new Date(todo.completedAt).toLocaleString('ja-JP')}</span>}
                                    </div>
                                </div>
                                <div className="todo-actions">
                                    <button onClick={() => toggleTodoComplete(todo.id)} className="complete-btn" title={todo.completed ? '未完了に戻す' : '完了にする'}>
                                        <i className={`fas fa-${todo.completed ? 'undo' : 'check'}`}></i>
                                    </button>
                                    <button onClick={() => openEditModal(todo)} className="edit-btn" title="編集">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => deleteTodo(todo.id)} className="delete-btn" title="削除">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            {todo.description && <div className="todo-description" dangerouslySetInnerHTML={{ __html: escapeHtml(todo.description).replace(/\n/g, '<br>') }}></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-container">
                <h2><i className="fas fa-chart-bar"></i> 統計</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fas fa-tasks"></i></div>
                        <div className="stat-info">
                            <span className="stat-value" id="totalTodos">{totalTodos}</span>
                            <span className="stat-label">総TODO数</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fas fa-clock"></i></div>
                        <div className="stat-info">
                            <span className="stat-value" id="pendingTodos">{pendingTodosCount}</span>
                            <span className="stat-label">未完了</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                        <div className="stat-info">
                            <span className="stat-value" id="completedTodos">{completedTodosCount}</span>
                            <span className="stat-label">完了済み</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fas fa-percentage"></i></div>
                        <div className="stat-info">
                            <span className="stat-value" id="completionRate">{completionRate}%</span>
                            <span className="stat-label">完了率</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
