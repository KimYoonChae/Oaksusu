import { useLocation, useNavigate } from "react-router-dom";
import "./Detail.css";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

import { getBookId, isBookmarked, toggleBookmark } from "../services/bookmarkService";

const Detail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;

  const { user, loading } = useContext(AuthContext);
  const uid = user?.uid;

  const [bookmarked, setBookmarked] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);

  const bookId = getBookId(book);

  const from = location.state?.from;
   
  <button
    className="back-button"
    onClick={() => (from ? navigate(-1) : navigate("/"))}
  >← 뒤로가기
  </button>

  useEffect(() => {
    if (!uid || !bookId) return;

    const run = async () => {
      const exists = await isBookmarked(uid, bookId);
      setBookmarked(exists);
    };

    run();
  }, [uid, bookId]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>로그인 상태 확인 중...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>로그인이 필요합니다.</p>
        <button onClick={() => navigate("/login")}>로그인 하러가기</button>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>책 정보를 불러올 수 없습니다.</p>
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  const onToggleBookmark = async () => {
    if (!uid || !bookId) return;

    setBmLoading(true);
    try {
      const now = await toggleBookmark(uid, book);
      setBookmarked(now);
    } catch (e) {
      console.error(e);
      alert("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setBmLoading(false);
    }
  };

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← 뒤로가기
      </button>

      <button onClick={onToggleBookmark} disabled={bmLoading}>
        {bookmarked ? "★ 북마크 해제" : "☆ 북마크 추가"}
      </button>

      <div className="detail-content">
        <img
          src={
            book.volumeInfo.imageLinks?.thumbnail ||
            "https://via.placeholder.com/128x192?text=No+Image"
          }
          alt={book.volumeInfo.title}
          className="detail-cover"
        />

        <div className="detail-info">
          <h1 className="detail-title">{book.volumeInfo.title}</h1>
          {book.volumeInfo.authors && (
            <p>저자: {book.volumeInfo.authors.join(", ")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
