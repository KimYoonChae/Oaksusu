import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";
import styled from "styled-components";
import "./Login.css";

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
`;

const LoginPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    }
  };

  return (
    <LoginContainer>
      <h1>📚 도서 검색 및 추천</h1>
      <p style={{ margin: "8px 0 24px", fontSize: "1.1rem" }}>서비스를 이용하려면 로그인이 필요합니다.</p>
      <button onClick={handleGoogleLogin} className="google-login-button">
        <FcGoogle className="google-icon" />
        <span>Google로 로그인</span>
      </button>
    </LoginContainer>
  );
};

export default LoginPage;