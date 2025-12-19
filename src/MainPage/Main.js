import React, {useEffect, useState, useRef} from "react";
import styled from "styled-components";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  const { currentUser: user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // URL에 검색어(q)를 저장해서 뒤로가도 유지
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  // input은 URL q를 기준으로 유지
  const [searchQuery, setSearchQuery] = useState(q);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isFirstLoad = useRef(true);

  // URL(q)이 바뀌면 input도 동기화
  useEffect(() => {
    // 페이지 첫 로드때는 무시한다. 
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
  
      // URL에 q가 있으면 제거 → 검색 초기화
      if (searchParams.get("q")) {
        setSearchParams({});
        setSearchResults([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 실제 API 호출 함수: 매개변수로 query를 받도록 변경한다.
  const fetchBooks = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&maxResults=20&key=${apiKey}`
      );
      setSearchResults(response.data.items || []);
    } catch (err) {
      console.error("책 정보를 가져오는 데 실패했습니다.", err);
      setError("책 정보를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!q) {
      setSearchResults([]);
      return;
    }
    fetchBooks(q);

  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchParams({}); 
      setSearchResults([]);
      return;
    }

    setSearchParams({ q: trimmed }); 
  };

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("로그인 성공:", result.user);
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <div className="main-container">
      <Header>
        <PageTitle>도서 검색</PageTitle>

        {/* AI 추천 페이지 이동 버튼 */}
        <AuthButton
          onClick={() => navigate("/recommand")}
          style={{ marginRight: "8px" }}
        >
          AI 도서 추천
        </AuthButton>

        {/* 북마크 목록 이동 버튼 (로그인했을 때만 보여도 되고, 항상 보이기도 한다.) */}
        <AuthButton
          onClick={() => navigate("/bookmarks")}
          style={{ marginRight: "8px" }}
        >
          내 북마크
        </AuthButton>

        {user ? (
          <AuthButton onClick={handleLogout}>로그아웃</AuthButton>
        ) : (
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
          <Link
            key={book.id}
            to={`/book/${book.id}`}
            // from: location을 같이 넘겨서 Detail에서 뒤로가기 안정화
            state={{ book, from: location }}
            className="book-item"
          >
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
