import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

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

const BookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`;

const IntroText = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 12px;
`;

const BookCard = styled.div`
  display: flex;
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 16px;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.08);
  }
`;

const BookCover = styled.img`
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #f1f3f5;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const BookHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const BookTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: #212529;
  line-height: 1.3;
`;

const BookmarkButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${props => props.$active ? '#FFD700' : '#dee2e6'};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
    color: ${props => props.$active ? '#FFC107' : '#adb5bd'};
  }

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
    stroke: ${props => props.$active ? '#b7950b' : '#868e96'};
    stroke-width: 1.5px;
  }
`;

const BookAuthor = styled.div`
  font-size: 0.8rem;
  color: #868e96;
`;

const BookReason = styled.div`
  font-size: 0.85rem;
  color: #495057;
  line-height: 1.4;
  margin-top: 4px;
`;

const Recommand = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "안녕하세요! 저는 도서 추천 전문가입니다. 📚\n\n어떤 장르나 주제의 책을 찾고 계신가요? 취향, 관심사, 또는 최근 읽은 책을 알려주시면 맞춤형 책 3권을 추천해드릴게요!\n\n예를 들어:\n• 스트레스 해소에 좋은 힐링 소설\n• 30대가 읽을만한 자기계발서\n• 판타지 소설 추천해줘"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const { currentUser: user } = useAuth();
  
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) return;
      try {
        const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
        const snapshot = await getDocs(bookmarksRef);
        const bookmarkList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookmarks(bookmarkList);
      } catch (error) {
        console.error("북마크 로드 실패:", error);
      }
    };

    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const toggleBookmark = async (book) => {
    if (!user) {
      alert("북마크 기능을 사용하려면 로그인이 필요합니다.");
      return;
    }

    try {
      const bookId = book.title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", bookId);
      
      const isBookmarked = bookmarks.some(b => b.book_title === book.title);
      
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
        setBookmarks(prev => prev.filter(b => b.book_title !== book.title));
      } else {
        const bookmarkData = {
          book_id: bookId,
          book_title: book.title,
          book_author: book.author,
          thumbnail_url: book.cover || "",
          status: "wish",
          memo: book.reason || "",
          publisher: "",
          description: "",
          updated_at: new Date(),
          created_at: new Date()
        };
        
        await setDoc(bookmarkRef, bookmarkData);
        setBookmarks(prev => [...prev, bookmarkData]);
      }
    } catch (error) {
      console.error("북마크 저장 실패:", error);
      alert("북마크 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchBookCover = async (title, author) => {
    try {
      const query = `${title} ${author || ''}`;
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
      const data = await res.json();
      
      const volumeInfo = data.items?.[0]?.volumeInfo;
      const imageUrl = volumeInfo?.imageLinks?.thumbnail || volumeInfo?.imageLinks?.smallThumbnail;
      
      return imageUrl ? imageUrl.replace('http:', 'https:') : null;
    } catch (e) {
      console.error("Cover fetch failed:", e);
      return null;
    }
  };

  const sendMessage = async (content) => {
    const messageContent = content.trim();
    if (!messageContent || loading) return;

    const userMessage = {
      role: "user",
      content: messageContent
    };

    setLoading(true);
    setError(null);

    try {
      const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

      if (!API_KEY) {
        throw new Error("API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ 
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `당신은 친절한 도서 추천 전문가입니다. 사용자의 질문에 대해 다음 JSON 형식으로만 응답하세요.
              
              { 
                "type": "recommendation", 
                "intro": "추천 인사말 (2-3문장)",
                "books": [
                  { "title": "책제목", "author": "저자", "reason": "이 책을 추천하는 구체적인 이유 (2-3문장)" },
                  { "title": "책제목2", "author": "저자2", "reason": "추천 이유 2" }
                ]
              }
              
              { "type": "chat", "message": "친절한 답변 내용" }
              
              - 책 추천 시 반드시 3권을 추천해야 합니다
              - intro에는 사용자의 요청에 공감하고 추천 방향을 간단히 설명하세요
              - reason에는 각 책의 특징과 왜 추천하는지 구체적으로 2-3문장으로 작성하세요
              - 다른 설명 없이 오직 JSON만 반환하세요` 
            },
            ...messages,
            userMessage
          ].map((msg) => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API 호출 실패');
      }

      const data = await response.json();
      let aiContent = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(aiContent);
        if (parsed.type === 'recommendation') {
          const booksWithCovers = await Promise.all(parsed.books.map(async (book) => {
            const cover = await fetchBookCover(book.title, book.author);
            return { ...book, cover };
          }));
          parsed.books = booksWithCovers;
          aiContent = JSON.stringify(parsed);
        }
      } catch (e) {
        aiContent = JSON.stringify({
          type: "chat",
          message: aiContent
        });
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: aiContent
      }]);
    } catch (err) {
      console.error("책 추천을 받는 데 실패했습니다.", err);
      setError("오류가 발생했습니다: " + err.message);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "죄송합니다. 오류가 발생했습니다. API 키가 올바른지 확인해주세요."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", content: inputValue.trim() }]);
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleSuggestionClick = (prompt) => {
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    sendMessage(prompt);
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "안녕하세요! 저는 도서 추천 전문가입니다. 📚\n\n어떤 장르나 주제의 책을 찾고 계신가요? 취향, 관심사, 또는 최근 읽은 책을 알려주시면 맞춤형 책 3권을 추천해드릴게요!\n\n예를 들어:\n• 스트레스 해소에 좋은 힐링 소설\n• 30대가 읽을만한 자기계발서\n• 판타지 소설 추천해줘"
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
            <MessageBubble key={index} $isUser={message.role === "user"}>
              {message.role !== "user" && (
                <Avatar $isUser={false}>AI</Avatar>
              )}
              <MessageContent $isUser={message.role === "user"}>
                {(() => {
                  if (message.role === "user") return message.content;
                  try {
                    const parsed = JSON.parse(message.content);
                    if (parsed.type === "recommendation") {
                      return (
                        <>
                          {parsed.intro && <IntroText>{parsed.intro}</IntroText>}
                          <BookList>
                            {parsed.books.map((book, idx) => {
                              const isBookmarked = bookmarks.some(b => b.book_title === book.title);
                              return (
                                <BookCard key={idx}>
                                  <BookCover src={book.cover || "https://via.placeholder.com/80x120?text=No+Img"} alt={book.title} />
                                  <BookInfo>
                                    <BookHeaderRow>
                                      <BookTitle>{book.title}</BookTitle>
                                      <BookmarkButton 
                                        onClick={() => toggleBookmark(book)} 
                                        $active={isBookmarked}
                                        title={isBookmarked ? "북마크 해제" : "북마크 저장"}
                                      >
                                        <svg viewBox="0 0 24 24">
                                          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                        </svg>
                                      </BookmarkButton>
                                    </BookHeaderRow>
                                    <BookAuthor>{book.author}</BookAuthor>
                                    <BookReason>{book.reason}</BookReason>
                                  </BookInfo>
                                </BookCard>
                              );
                            })}
                          </BookList>
                        </>
                      );
                    }
                    return parsed.message || message.content;
                  } catch (e) {
                    return message.content;
                  }
                })()}
              </MessageContent>
              {message.role === "user" && (
                <Avatar $isUser={true}>{user?.displayName?.[0] || "U"}</Avatar>
              )}
            </MessageBubble>
          ))}
          
          {showSuggestions && (
            <SuggestionsContainer>
              {[
                "요즘 인기 있는 소설 추천해줘",
                "스트레스 해소에 좋은 책은?",
                "30대 여성이 읽을 만한 자기계발서",
                "판타지 소설 좋아하는데, 뭐 볼까?",
              ].map((prompt, index) => (
                <SuggestionButton key={index} onClick={() => handleSuggestionClick(prompt)} disabled={loading}>{prompt}</SuggestionButton>
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