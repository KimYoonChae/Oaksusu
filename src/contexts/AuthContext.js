import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // firebase.js에서 auth 객체 가져오기

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가, 초기값은 true

  useEffect(() => {
    // auth가 null이면 Firebase가 초기화되지 않은 상태
    if (!auth) {
      console.warn('⚠️ Firebase가 초기화되지 않았습니다. .env 파일을 확인하세요.');
      setLoading(false); // Firebase가 초기화되지 않았으면 로딩 종료
      return;
    }

    // Firebase의 인증 상태 변경을 실시간으로 감지하고, 초기 로딩 상태를 설정합니다.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // 초기 인증 상태 확인 완료 후 로딩 종료
    }, (error) => {
      console.error('Firebase 인증 오류:', error);
      setLoading(false); // 오류 발생 시에도 로딩 종료
    });

    // 컴포넌트가 사라질 때 구독을 해제합니다.
    return unsubscribe;
  }, []);

  const value = { currentUser, loading }; // loading 상태도 함께 제공

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}