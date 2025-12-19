import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Detail.css";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

import {
  getBookId,
  isBookmarked,
  toggleBookmark,
  getBookmarkMemo,     
  saveBookmarkMemo,   
} from "../services/bookmarkService";

const Detail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const book = location.state?.book; // 검색 페이지에서 넘어온 도서 정보

  // 로그인 정보
  const { user, loading } = useContext(AuthContext);
  const uid = user?.uid;

  // 북마크 상태
  const [bookmarked, setBookmarked] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);

  // 도서 상세 정보
  const [detailBook, setDetailBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 북마크된 도서 ID
  const bookId = getBookId(book) || id;

  // 메모 상태 관리 
  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);

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

  // 북마크된 도서만 메모 불러오기
  useEffect(() => {
    if (!uid || !bookId) return;

    const run = async () => {
      if (!bookmarked) {
        setMemo(""); // 북마크 해제되면 메모 입력도 초기화
        return;
      }
      try {
        const m = await getBookmarkMemo(uid, bookId);
        setMemo(m);
      } catch (e) {
        console.error("메모 불러오기 실패", e);
      }
    };

    run();
  }, [uid, bookId, bookmarked]);

  // 로딩/로그인 가드
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
    return <div style={{ padding: "2rem" }}>도서 상세 정보 불러오는 중...</div>;
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

  // 북마크 토글
  const onToggleBookmark = async () => {
    if (!uid || !bookId) return;

    const bookForSave = book || detailBook;
    if (!bookForSave) {
      alert("북마크할 책 정보가 없습니다.");
      return;
    }

    setBmLoading(true);
    try {
      const now = await toggleBookmark(uid, bookForSave);
      setBookmarked(now);
    } catch (e) {
      console.error(e);
      alert("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setBmLoading(false);
    }
  };

  // 메모 저장
  const onSaveMemo = async () => {
    if (!uid || !bookId) return;

    if (!bookmarked) {
      alert("북마크한 책만 메모할 수 있어요. 먼저 북마크 해주세요!");
      return;
    }

    setMemoSaving(true);
    try {
      await saveBookmarkMemo(uid, bookId, memo);
      alert("메모가 저장되었습니다!");
    } catch (e) {
      if (String(e?.message).includes("BOOKMARK_REQUIRED")) {
        alert("북마크한 책만 메모할 수 있어요. 먼저 북마크 해주세요!");
      } else {
        console.error(e);
        alert("메모 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setMemoSaving(false);
    }
  };

  // 도서 설명에서 html 태그 제거
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
          <h1 className="detail-title">{displayBook?.volumeInfo?.title}</h1>

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

          {/* 메모: 북마크한 책에만 작성 가능 */}
          {bookmarked ? (
            <div style={{ marginTop: "16px" }}>
              <h3 style={{ marginBottom: "8px" }}>메모</h3>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="이 책에 대한 메모를 남겨보세요."
                rows={6}
                style={{ width: "100%", padding: "10px", resize: "vertical" }}
              />
              <button onClick={onSaveMemo} disabled={memoSaving}>
                {memoSaving ? "저장 중..." : "메모 저장"}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "16px", color: "#666" }}>
              메모는 <b>북마크한 책</b>에서만 작성할 수 있어요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
