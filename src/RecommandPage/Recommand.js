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

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 24px 16px;
  justify-content: center;
`;

const SuggestionButton = styled.button`
  padding: 8px 16px;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 18px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #e9ecef;
    border-color: #ced4da;
    transform: translateY(-2px);
  }
`;

const RecommendationContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 24px 10px 64px;
  margin-top: -8px;
  margin-bottom: 8px;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 4px;
  }
`;

const RecommendedBookCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  width: 140px;
  flex-shrink: 0;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const RecommendedBookCover = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  background-color: #f8f9fa;
`;

const RecommendedBookInfo = styled.div`
  padding: 12px;
`;

const RecommendedBookTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RecommendedBookAuthor = styled.p`
  font-size: 0.8rem;
  color: #868e96;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const { currentUser: user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // src/RecommandPage/Recommand.js에서 sendMessage 함수 부분만 수정

const sendMessage = async (content) => {
  const messageContent = content.trim();
  if (!messageContent || loading) return;

  const userMessage = {
    role: "user",
    content: messageContent,
  };

  setMessages(prev => [...prev, userMessage]);
  setLoading(true);
  setError(null);

  try {
    // Vercel Serverless Function 엔드포인트
    const functionUrl = '/api/getBookRecommendations';
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: [...messages, userMessage].map((msg) => ({
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
    
    // 책 추천이 있는 경우
    if (data.books && Array.isArray(data.books) && data.books.length > 0) {
      // 책 데이터 정제
      const cleanedBooks = data.books.map(book => ({
        id: book.id || `book-${Date.now()}-${Math.random()}`,
        title: book.title || "제목 없음",
        authors: Array.isArray(book.authors) ? book.authors : (book.authors ? [book.authors] : ["저자 미상"]),
        coverUrl: book.coverUrl || "https://via.placeholder.com/140x180?text=No+Image"
      }));

      setMessages(prev => [...prev, {
        role: "assistant",
        type: "book-recommendation",
        books: cleanedBooks,
        content: data.message || "이런 책들은 어떠세요? 📚"
      }]);
    } else {
      // 일반 텍스트 응답
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message || "죄송합니다, 추천할 만한 책을 찾지 못했어요."
      }]);
    }

  } catch (err) {
    console.error("책 추천을 받는 데 실패했습니다.", err);
    
    let errorMessage = "오류가 발생했습니다. 다시 시도해주세요.";
    
    if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
      errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
    }
    
    setError(errorMessage);
    
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "죄송합니다. " + errorMessage
    }]);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    setShowSuggestions(false);
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleSuggestionClick = (prompt) => {
    setShowSuggestions(false);
    sendMessage(prompt);
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "안녕하세요! 저는 도서 추천 전문가입니다. 어떤 종류의 책을 찾고 계신가요? 취향이나 관심사를 알려주시면 맞춤형 책을 추천해드릴게요! 📚"
      }
    ]);
    setError(null);
    setShowSuggestions(true);
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
            <React.Fragment key={index}>
              <MessageBubble $isUser={message.role === "user"}>
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
              
              {/* 책 추천 카드 */}
              {message.type === 'book-recommendation' && message.books && (
                <RecommendationContainer>
                  {message.books.map((book, bookIndex) => (
                    <RecommendedBookCard 
                      key={book.id || bookIndex}
                      to={`/book/${book.id}`}
                      state={{ 
                        book: { 
                          id: book.id, 
                          volumeInfo: { 
                            title: book.title, 
                            authors: book.authors, 
                            imageLinks: { 
                              thumbnail: book.coverUrl 
                            } 
                          } 
                        }
                      }}
                    >
                      <RecommendedBookCover
                        src={book.coverUrl}
                        alt={book.title}
                        onError={(e) => {
                          // 이미지 로드 실패 시 기본 이미지로 대체
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/140x180?text=No+Image";
                        }}
                      />
                      <RecommendedBookInfo>
                        <RecommendedBookTitle title={book.title}>
                          {book.title}
                        </RecommendedBookTitle>
                        <RecommendedBookAuthor title={book.authors?.join(', ')}>
                          {book.authors?.join(', ')}
                        </RecommendedBookAuthor>
                      </RecommendedBookInfo>
                    </RecommendedBookCard>
                  ))}
                </RecommendationContainer>
              )}
            </React.Fragment>
          ))}
          
          {showSuggestions && (
            <SuggestionsContainer>
              {[
                "요즘 인기 있는 소설 추천해줘",
                "스트레스 해소에 좋은 책은?",
                "30대 여성이 읽을 만한 자기계발서",
                "판타지 소설 좋아하는데, 뭐 볼까?",
              ].map((prompt, index) => (
                <SuggestionButton 
                  key={index} 
                  onClick={() => handleSuggestionClick(prompt)} 
                  disabled={loading}
                >
                  {prompt}
                </SuggestionButton>
              ))}
            </SuggestionsContainer>
          )}

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
            padding: "10px 24px", 
            background: "#ffebee", 
            color: "#c62828", 
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