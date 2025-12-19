import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PageContainer = styled.div`
  background: linear-gradient(180deg, #f8f9fa 0%, #f1f8e9 100%);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  height: calc(100vh - 40px);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(30, 80, 30, 0.08);
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e9f0e9;
  flex-shrink: 0;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const BackButton = styled(Link)`
  padding: 8px 16px;
  background-color: #789043;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5e7332;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cdd2d9;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const MessageBubble = styled.div`
  display: flex;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  align-items: flex-start;
  gap: 8px;
`;

const MessageContent = styled.div`
  max-width: 70%;
  padding: 14px 20px;
  border-radius: 20px;
  background-color: ${props => props.$isUser ? '#789043' : '#f1f3f5'};
  color: ${props => props.$isUser ? 'white' : '#212529'};
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-top-left-radius: ${props => props.$isUser ? '20px' : '4px'};
  border-top-right-radius: ${props => props.$isUser ? '4px' : '20px'};
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$isUser ? '#789043' : '#e8e8e8'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${props => props.$isUser ? 'white' : '#666'};
  flex-shrink: 0;
`;

const InputContainer = styled.form`
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #e9f0e9;
  background: #f8f9fa;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e1e4e8;
  border-radius: 20px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #789043;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background-color: #789043;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #5e7332;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

const typing = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  
  span {
    width: 8px;
    height: 8px;
    background-color: #adb5bd;
    border-radius: 50%;
    animation: ${typing} 1s infinite ease-in-out;
  }

  span:nth-child(2) {
    animation-delay: 0.2s;
  }

  span:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

const Recommand = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "안녕하세요! 저는 도서 추천 전문가입니다. 어떤 종류의 책을 찾고 계신가요? 취향이나 관심사를 알려주시면 맞춤형 책을 추천해드릴게요! 📚"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser: user } = useAuth();

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: inputValue.trim()
    };

    // 사용자 메시지 추가
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setError(null);

    try {
      // 대화 히스토리를 포함하여 API 호출
      // 로컬 개발 환경에서는 netlify dev를 사용하거나, 직접 함수를 호출할 수 있도록 설정
      const functionUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8888/.netlify/functions/getBookRecommendations'
        : '/.netlify/functions/getBookRecommendations';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 응답을 받는 데 실패했습니다.');
      }

      const data = await response.json();
      
      // AI 응답 추가
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message
      }]);
    } catch (err) {
      console.error("책 추천을 받는 데 실패했습니다.", err);
      
      let errorMessage = "오류가 발생했습니다. 다시 시도해주세요.";
      
      // 네트워크 오류 또는 404 오류인 경우
      if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
        errorMessage = "Netlify 함수를 찾을 수 없습니다. 개발 환경에서는 'netlify dev' 명령어를 사용하여 서버를 실행하세요.";
        console.warn("💡 개발 환경에서 Netlify 함수를 사용하려면:");
        console.warn("   1. 터미널에서 'npm install -g netlify-cli' 실행");
        console.warn("   2. 'netlify dev' 명령어로 서버 시작");
        console.warn("   3. 또는 프로덕션 빌드 후 'netlify deploy' 사용");
      }
      
      setError(errorMessage);
      
      // 에러 메시지 추가
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "죄송합니다. 오류가 발생했습니다. " + errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "안녕하세요! 저는 도서 추천 전문가입니다. 어떤 종류의 책을 찾고 계신가요? 취향이나 관심사를 알려주시면 맞춤형 책을 추천해드릴게요! 📚"
      }
    ]);
    setError(null);
  };

  return (
    <PageContainer>
      <ChatContainer>
        <Header>
          <PageTitle>AI 도서 추천 챗봇</PageTitle>
          <BackButton to="/">홈으로</BackButton>
        </Header>
        <MessagesContainer>
          {messages.map((message, index) => (
            <MessageBubble key={index} $isUser={message.role === "user"}>
              {message.role !== "user" && (
                <Avatar $isUser={false}>AI</Avatar>
              )}
              <MessageContent $isUser={message.role === "user"}>
                {message.content}
              </MessageContent>
              {message.role === "user" && (
                <Avatar $isUser={true}>{user?.displayName?.[0] || "U"}</Avatar>
              )}
            </MessageBubble>
          ))}
          
          {loading && (
            <MessageBubble $isUser={false}>
              <Avatar $isUser={false}>AI</Avatar>
              <MessageContent $isUser={false}>
                <LoadingIndicator>
                  <span></span>
                  <span></span>
                  <span></span>
                </LoadingIndicator>
              </MessageContent>
            </MessageBubble>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>

        {error && (
          <div style={{ 
            padding: "10px", 
            background: "#ffebee", 
            color: "#c62828", 
            borderRadius: "8px",
            marginBottom: "10px",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        <InputContainer onSubmit={handleSubmit}>
          <MessageInput
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={loading}
          />
          <SendButton type="submit" disabled={loading || !inputValue.trim()}>
            {loading ? "전송 중..." : "전송"}
          </SendButton>
          <SendButton 
            type="button" 
            onClick={handleReset}
            disabled={loading}
            style={{ backgroundColor: "#666" }}
          >
            초기화
          </SendButton>
        </InputContainer>
      </ChatContainer>
    </PageContainer>
  );
};

export default Recommand;
