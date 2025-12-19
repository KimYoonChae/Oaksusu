import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 40px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ImageWrapper = styled.div`
  max-width: 500px;
  width: 100%;
  
  img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
  }
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 48px 0;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  height: 48px;
  background: #ffe500;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  margin-bottom: 16px;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #ffd400;
  }

  &:disabled {
    background: #f0f0f0;
    color: #aaa;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
  color: #aaa;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #ddd;
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f8f8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 20px;
  }
`;

const Links = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  font-size: 13px;
`;

const Link = styled.a`
  color: #666;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  color: #ddd;
  margin: 0 8px;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 13px;
  margin-top: -12px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #fff5f5;
  border-radius: 4px;
  border-left: 3px solid #ff4444;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #4285f4;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: 16px;

  &:hover {
    color: #357ae8;
  }
`;

const LoginPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      if (isSignUp) {
        // 회원가입
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // 로그인
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (error) {
      console.error("인증 중 오류 발생:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else if (error.code === "auth/invalid-email") {
        setError("유효하지 않은 이메일 형식입니다.");
      } else if (error.code === "auth/weak-password") {
        setError("비밀번호는 최소 6자 이상이어야 합니다.");
      } else if (error.code === "auth/user-not-found") {
        setError("존재하지 않는 계정입니다.");
      } else if (error.code === "auth/wrong-password") {
        setError("비밀번호가 올바르지 않습니다.");
      } else if (error.code === "auth/invalid-credential") {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError("");
    
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Google 로그인 리디렉션 중 오류 발생:", error);
      setError("Google 로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container>
      <LeftSection>
        <ImageWrapper>
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80" 
            alt="Books illustration" 
          />
        </ImageWrapper>
      </LeftSection>

      <RightSection>
        <LoginBox>
          <Title>{isSignUp ? "회원가입" : "독서와 무제한 친해지리"}</Title>
          <Subtitle>22만 권 속에서 인생책을 찾아보세요</Subtitle>

          <form onSubmit={handleEmailLogin}>
            <InputSection>
              <Label>이메일</Label>
              <Input 
                type="email" 
                placeholder="이메일 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputSection>

            <InputSection>
              <Label>비밀번호</Label>
              <Input 
                type="password" 
                placeholder="비밀번호 입력 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputSection>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <LoginButton type="submit">
              {isSignUp ? "회원가입" : "로그인"}
            </LoginButton>
          </form>

          <ToggleButton onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setEmail("");
            setPassword("");
          }}>
            {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
          </ToggleButton>

          <Divider>또는</Divider>

          <GoogleButton onClick={handleGoogleLogin}>
            <FcGoogle />
            <span>Google로 로그인</span>
          </GoogleButton>

          <Links>
            <div>
              <Link onClick={() => setIsSignUp(true)}>회원가입</Link>
              <Separator>|</Separator>
              <Link>ID/PW 찾기</Link>
              <Separator>|</Separator>
              <Link>기업회원 로그인</Link>
            </div>
          </Links>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
            페이스북 로그인 계정 전환 안내
          </div>
        </LoginBox>
      </RightSection>
    </Container>
  );
};

export default LoginPage;