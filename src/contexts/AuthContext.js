import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // firebase.js에서 auth 객체 가져오기

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // auth가 null이면 Firebase가 초기화되지 않은 상태
    if (!auth) {
      console.warn('⚠️ Firebase가 초기화되지 않았습니다. .env 파일을 확인하세요.');
      return;
    }

    // Firebase의 인증 상태 변경을 실시간으로 감지합니다.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    }, (error) => {
      console.error('Firebase 인증 오류:', error);
    });

    // 컴포넌트가 사라질 때 구독을 해제합니다.
    return unsubscribe;
  }, []);

  const value = { currentUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}