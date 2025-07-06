"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import forgejoAuthInstance from '../lib/forgejoAuth'; // クライアントサイドのAuthインスタンス
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const initializeAuth = useCallback(async () => {
        setIsLoading(true);
        if (forgejoAuthInstance && !forgejoAuthInstance.isInitialized) {
            await forgejoAuthInstance.initialize();
        }
        if (forgejoAuthInstance && forgejoAuthInstance.isAuthenticated()) {
            setUser(forgejoAuthInstance.getUserInfo());
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    useEffect(() => {
        if (!isLoading) {
            const isAuthPage = pathname === '/login'; // ログインページか
            if (isAuthenticated && isAuthPage) {
                router.replace('/dashboard'); // 認証済みでログインページにいたらダッシュボードへ
            } else if (!isAuthenticated && !isAuthPage) {
                router.replace('/login'); // 未認証でログインページ以外にいたらログインページへ
            }
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    const login = async (type, credentials) => {
        setIsLoading(true);
        let userInfo;
        if (type === 'basic') {
            userInfo = await forgejoAuthInstance.loginWithBasicAuth(credentials.username, credentials.password, credentials.forgejoUrl);
        } else if (type === 'token') {
            userInfo = await forgejoAuthInstance.loginWithToken(credentials.apiToken, credentials.forgejoUrlApi);
        } else {
            setIsLoading(false);
            throw new Error("Invalid login type");
        }
        setUser(userInfo);
        setIsAuthenticated(true);
        setIsLoading(false);
        router.push('/dashboard');
        return userInfo;
    };

    const logout = () => {
        if (confirm('ログアウトしますか？')) {
            forgejoAuthInstance.logout();
            setUser(null);
            setIsAuthenticated(false);
            router.push('/login');
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        reInitializeAuth: initializeAuth // 手動で再初期化/状態確認をトリガーする関数
    };

    // グローバルなローディング状態（初期認証チェック中）
    // または特定ページ（非認証エリア）では表示しないなどの制御も可能
    if (isLoading && !['/login'].includes(pathname) && !isAuthenticated) {
         // 初回ロード時、認証状態が不明で、かつログインページでもない場合
         // もしくは認証されてない状態で保護されたルートにアクセスしようとした場合
         // router.replaceが完了するまでの間、スピナーを表示する
        return <LoadingSpinner message="認証情報を確認中..." />;
    }
     if (isLoading && isAuthenticated && ['/login'].includes(pathname)){
        // 認証済みでログインページにアクセスしようとしている場合（リダイレクト待ち）
        return <LoadingSpinner message="リダイレクトしています..." />;
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) { // nullチェックも追加
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
