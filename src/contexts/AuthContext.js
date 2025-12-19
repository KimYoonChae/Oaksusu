import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // firebase.js에서 auth 객체 가져오기

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase의 인증 상태 변경을 실시간으로 감지합니다.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // 컴포넌트가 사라질 때 구독을 해제합니다.
    return unsubscribe;
  }, []);

  const value = { currentUser };

  // 로딩이 끝나면 자식 컴포넌트들을 렌더링합니다.
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}