import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Recommand.css";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 1rem;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const BackButton = styled(Link)`
  padding: 8px 16px;
  background-color: #4285f4;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357ae8;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
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
    background: #888;
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
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${props => props.$isUser ? '#4285f4' : '#e8e8e8'};
  color: ${props => props.$isUser ? 'white' : '#333'};
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$isUser ? '#4285f4' : '#e8e8e8'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${props => props.$isUser ? 'white' : '#666'};
  flex-shrink: 0;
`;

const InputContainer = styled.form`
  display: flex;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 8px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #4285f4;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #357ae8;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
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
    <div className="recommand-container">
      <Header>
        <PageTitle>AI 도서 추천 챗봇</PageTitle>
        <BackButton to="/">홈으로</BackButton>
      </Header>

      <ChatContainer>
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
                <LoadingIndicator>답변을 생성하고 있습니다...</LoadingIndicator>
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
    </div>
  );
};

export default Recommand;

