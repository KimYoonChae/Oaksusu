import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./Bookmark.css"; // CSS 파일 import

const Bookmark = () => {
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "bookmarks"),
      orderBy("updated_at", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
      },
      (e) => {
        console.error(e);
        setErr("북마크 목록을 불러오지 못했습니다.");
      }
    );

    return () => unsub();
  }, [user]);

  const goHome = () => navigate("/");
  const goBack = () => navigate(-1);

  return (
    <div className="bookmark-container">
      <div className="bookmark-content">
        {/* 상단 헤더: 홈/뒤로가기 버튼 추가 */}
        <div className="bookmark-header">
          <button className="bookmark-nav-btn" onClick={goBack}>
            ← 뒤로가기
          </button>

          <h2 className="bookmark-title-head">내 북마크</h2>

          <button className="bookmark-nav-btn" onClick={goHome}>
            🏠 홈으로
          </button>
        </div>

        {err && <p className="bookmark-error">{err}</p>}

        {items.length === 0 ? (
          <p className="bookmark-empty">북마크한 책이 없습니다.</p>
        ) : (
          <div className="bookmark-grid">
            {items.map((b) => (
              <div
                key={b.book_id || b.id}
                className="bookmark-card"
                onClick={() => {
                  const bookLike = {
                    id: b.book_id,
                    volumeInfo: {
                      title: b.book_title || "",
                      authors: b.book_author
                        ? b.book_author.split(",").map((s) => s.trim())
                        : [],
                      imageLinks: { thumbnail: b.thumbnail_url || "" },
                      publisher: b.publisher || "",
                      description: b.description || "",
                    },
                  };

                  // 북마크 목록 → 상세로 이동
                  navigate(`/book/${b.book_id}`, {
                    state: { book: bookLike, from: "bookmark" },
                  });
                }}
              >
                <img
                  src={
                    b.thumbnail_url ||
                    "https://via.placeholder.com/90x135?text=No+Image"
                  }
                  alt={b.book_title}
                  className="bookmark-thumbnail"
                />

                <div className="bookmark-info">
                  <div className="bookmark-title">{b.book_title}</div>
                  <div className="bookmark-author">{b.book_author}</div>

                  {b.memo && <div className="bookmark-memo">{b.memo}</div>}

                  <div className="bookmark-status">
                    {b.status === "reading"
                      ? "📖 읽는 중"
                      : b.status === "done"
                      ? "✅ 완독"
                      : "📚 읽을 예정"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmark;
