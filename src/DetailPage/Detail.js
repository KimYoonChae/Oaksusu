import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Detail.css";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

import {
  getBookId,
  isBookmarked,
  toggleBookmark,
  getBookmarkMemo,
  saveBookmarkMemo,
  getBookmarkStatus,
  setBookmarkStatus,
} from "../services/bookmarkService";

const STATUS_LABEL = {
  todo: "읽기전",
  reading: "읽는 중",
  done: "읽기 완료",
};

const Detail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const book = location.state?.book;

  const { currentUser: user, loading } = useAuth();
  const uid = user?.uid;

  const [bookmarked, setBookmarked] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);

  const [detailBook, setDetailBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const bookId = getBookId(book) || id;

  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);

  const [status, setStatus] = useState("todo");
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (!uid || !bookId) return;

    const checkBookmark = async () => {
      try {
        const exists = await isBookmarked(uid, bookId);
        setBookmarked(exists);
      } catch (e) {
        console.error("북마크 상태 확인 실패", e);
      }
    };

    checkBookmark();
  }, [uid, bookId]);

  useEffect(() => {
    const fetchBookDetail = async () => {
      setDetailLoading(true);
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`
        );
        const bookData = res.data;
        if (bookData.volumeInfo.imageLinks?.thumbnail) {
          bookData.volumeInfo.imageLinks.thumbnail = bookData.volumeInfo.imageLinks.thumbnail.replace(/^http:/, 'https:');
        }
        setDetailBook(bookData);
      } catch (e) {
        console.error("도서 상세 정보 로딩 실패", e);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchBookDetail();
  }, [id]);

  useEffect(() => {
    if (!uid || !bookId) return;

    const run = async () => {
      if (!bookmarked) {
        setMemo("");
        setStatus("todo");
        return;
      }

      try {
        const [m, s] = await Promise.all([
          getBookmarkMemo(uid, bookId),
          getBookmarkStatus(uid, bookId),
        ]);

        setMemo(m || "");
        setStatus(s || "todo");
      } catch (e) {
        console.error("메모/상태 불러오기 실패", e);
      }
    };

    run();
  }, [uid, bookId, bookmarked]);

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

      if (!now) {
        setMemo("");
        setStatus("todo");
      }
    } catch (e) {
      console.error(e);
      alert("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setBmLoading(false);
    }
  };

  const onChangeStatus = async (nextStatus) => {
    setStatus(nextStatus);

    if (!uid || !bookId) return;

    if (!bookmarked) {
      alert("북마크한 책만 읽기 상태를 설정할 수 있어요. 먼저 북마크 해주세요!");
      return;
    }

    setStatusSaving(true);
    try {
      await setBookmarkStatus(uid, bookId, nextStatus);
    } catch (e) {
      if (String(e?.message).includes("BOOKMARK_REQUIRED")) {
        alert("북마크한 책만 읽기 상태를 설정할 수 있어요.");
      } else {
        console.error(e);
        alert("읽기 상태 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setStatusSaving(false);
    }
  };

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h1 className="detail-title" style={{ margin: 0 }}>{displayBook?.volumeInfo?.title}</h1>
            <button 
              onClick={onToggleBookmark} 
              disabled={bmLoading}
              style={{ marginLeft: "16px", flexShrink: 0 }}
              className="bookmark-icon-btn"
            >
              {bookmarked ? <FaBookmark size={24} color="#617830" /> : <FaRegBookmark size={24} color="#617830" />}
            </button>
          </div>

          {displayBook?.volumeInfo?.authors && (
            <p>저자: {displayBook.volumeInfo.authors.join(", ")}</p>
          )}

          {displayBook?.volumeInfo?.publishedDate && (
            <p>출판일: {displayBook.volumeInfo.publishedDate}</p>
          )}

          {displayBook?.volumeInfo?.publisher && (
            <p>출판사: {displayBook.volumeInfo.publisher}</p>
          )}

          {bookmarked ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 700, color: "#617830" }}>
                읽기 상태: {STATUS_LABEL[status]}
                {statusSaving ? " (저장 중...)" : ""}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => onChangeStatus("todo")}
                  disabled={statusSaving}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #617830",
                    background: status === "todo" ? "#617830" : "#fff",
                    color: status === "todo" ? "#fff" : "#617830",
                    cursor: "pointer",
                  }}
                >
                  읽기전
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus("reading")}
                  disabled={statusSaving}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #617830",
                    background: status === "reading" ? "#617830" : "#fff",
                    color: status === "reading" ? "#fff" : "#617830",
                    cursor: "pointer",
                  }}
                >
                  읽는 중
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus("done")}
                  disabled={statusSaving}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #617830",
                    background: status === "done" ? "#617830" : "#fff",
                    color: status === "done" ? "#fff" : "#617830",
                    cursor: "pointer",
                  }}
                >
                  읽기 완료
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16, color: "#666" }}>
              읽기 상태는 <b>북마크한 책</b>에서만 설정할 수 있어요.
            </div>
          )}

          {plainDescription && (
            <p className="detail-description" style={{ whiteSpace: "pre-line" }}>
              {plainDescription}
            </p>
          )}

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
