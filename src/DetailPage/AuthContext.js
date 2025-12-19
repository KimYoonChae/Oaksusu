import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// 전역에서 인증 상태를 관리한다.
export const AuthContext = createContext({
    user: null,
    loading: true,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // 로그인 user 객체가 변경될 때마다 호출된다. 만약, 로그아웃하면 null이 된다.
        setUser(currentUser);     
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
        {children}
        </AuthContext.Provider>
    );
}
