import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Detail.css";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

import {
  getBookId,
  isBookmarked,
  toggleBookmark,
} from "../services/bookmarkService";

const Detail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const book = location.state?.book;

  // 로그인 정보
  const { user, loading } = useContext(AuthContext);
  const uid = user?.uid;

  // 북마크 상태 표시하는 부분
  const [bookmarked, setBookmarked] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);

  // 도서 상세 정보
  const [detailBook, setDetailBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // firestore에 저장할 때 사용할 도서 ID
  const bookId = getBookId(book);

  // 북마크 상태 확인
  useEffect(() => {
    if (!uid || !bookId) return;

    const checkBookmark = async () => {
      const exists = await isBookmarked(uid, bookId);
      setBookmarked(exists);
    };

    checkBookmark();
  }, [uid, bookId]);

  // 구글북스 API에서 도서 상세 정보 불러오기
  useEffect(() => {
    const fetchBookDetail = async () => {
      setDetailLoading(true);
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`
        );
        setDetailBook(res.data);
      } catch (e) {
        console.error("도서 상세 정보 로딩 실패", e);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchBookDetail();
  }, [id]);

  // 로딩 상태 표시하는 부분
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

  if (detailLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        도서 상세 정보 불러오는 중...
      </div>
    );
  }

  if (!book && !detailBook) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>책 정보를 불러올 수 없습니다.</p>
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  const displayBook = detailBook || book;

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

  // 도서 설명에서 html 태그 제거하는 부분
  const plainDescription = (displayBook?.volumeInfo?.description || "")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/p>/gi, "\n\n")
  .replace(/<[^>]+>/g, "")
  .trim();

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
            displayBook?.volumeInfo?.imageLinks?.thumbnail ||
            "https://via.placeholder.com/128x192?text=No+Image"
          }
          alt={displayBook?.volumeInfo?.title}
          className="detail-cover"
        />

        <div className="detail-info">
          <h1 className="detail-title">
            {displayBook?.volumeInfo?.title}
          </h1>

          {displayBook?.volumeInfo?.authors && (
            <p>저자: {displayBook.volumeInfo.authors.join(", ")}</p>
          )}

          {displayBook?.volumeInfo?.publishedDate && (
            <p>출판일: {displayBook.volumeInfo.publishedDate}</p>
          )}

          {displayBook?.volumeInfo?.publisher && (
            <p>출판사: {displayBook.volumeInfo.publisher}</p>
          )}

          {/* 도서 세부내용 */}
          {plainDescription && (
            <p className="detail-description" style={{ whiteSpace: "pre-line" }}>
              {plainDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
