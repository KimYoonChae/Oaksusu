import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase"; // auth 객체를 import 합니다.
import { useAuth } from "../contexts/AuthContext";
import { FcGoogle } from 'react-icons/fc';
import { Link} from "react-router-dom";
import "./Main.css";
import "../LoginPage/Login.css"; 

const Header = styled.header`
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 0;
  margin-bottom: 1rem;
`;

const PageTitle = styled.h1`
  flex-grow: 1;
  text-align: center;
  margin: 0;
  /* 버튼 공간을 확보하기 위해 약간 왼쪽으로 이동 */
  transform: translateX(-50px);
`;

const AuthButton = styled.button`
  display: inline-flex;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  border: 1px solid #2f83f3;
  background-color: white;
  color: #2f83f3;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f5f8ff;
  }
`;

const Main = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { currentUser: user } = useAuth(); // 2. AuthContext에서 사용자 정보를 가져옵니다.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // 로그인 성공 시 사용자 정보는 onAuthStateChanged 리스너를 통해 자동으로 업데이트됩니다.
      // 성공 후 MainPage에 머무르게 됩니다.
      console.log('로그인 성공:', result.user);
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("로그아웃 성공");
      // 로그아웃 후 별도 페이지 이동이 필요하다면 여기에 navigate('/login') 추가
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  const fetchBooks = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=20&key=${apiKey}`
      );
      setSearchResults(response.data.items || []);
    } catch (err) {
      console.error("책 정보를 가져오는 데 실패했습니다.", err);
      setError("책 정보를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <div className="main-container">
      <Header>
        <PageTitle>도서 검색</PageTitle>
        {user ? (
          // 로그인된 경우: 로그아웃 버튼 표시
          <AuthButton onClick={handleLogout}>로그아웃</AuthButton>
        ) : (
          // 로그인되지 않은 경우: Google 로그인 버튼 바로 표시
          <button onClick={handleGoogleLogin} className="google-login-button">
            <FcGoogle className="google-icon" />
            <span>Google로 로그인</span>
          </button>
        )}
      </Header>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="책 제목, 저자 등을 입력하세요."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="book-list">
        {searchResults.map((book) => (
          // Link 컴포넌트를 사용하여 상세 페이지로 이동
          <Link
            key={book.id}
            to={`/book/${book.id}`}
            state={{ book }}
            className="book-item">
            <img
              src={
                book.volumeInfo.imageLinks?.thumbnail ||
                "https://via.placeholder.com/128x192?text=No+Image"
              }
              alt={book.volumeInfo.title}
              className="book-cover"
            />
            <div className="book-info">
              <h3 className="book-title">{book.volumeInfo.title}</h3>
              <p className="book-author">
                {book.volumeInfo.authors?.join(", ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Main;