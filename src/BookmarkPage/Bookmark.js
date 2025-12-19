import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const Bookmark = () => {
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    
    const [items, setItems] = useState([]);
    const [err, setErr] = useState("");

    useEffect(() => {
        // 로그인 되어있지 않으면, firebase 조회하지 않는다.
        if (!user) return;

        // 북마크 최신순으로 불러오기
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

    return (
        <div style={{ padding: "1.5rem" }}>
        <h2>내 북마크</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {items.length === 0 ? (
            <p>북마크한 책이 없습니다.</p>
        ) : (
            <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
            {items.map((b) => (
                <div
                key={b.book_id || b.id}
                style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    cursor: "pointer",
                }}
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

                    navigate(`/book/${b.book_id}`, { state: { book: bookLike } });
                }}
                >
                <img
                    src={
                    b.thumbnail_url ||
                    "https://via.placeholder.com/80x120?text=No+Image"
                    }
                    alt={b.book_title}
                    style={{
                    width: 80,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    }}
                />
                <div>
                    <div style={{ fontWeight: 700 }}>{b.book_title}</div>
                    <div style={{ opacity: 0.8, marginTop: 4 }}>{b.book_author}</div>
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    상태: {b.status || "todo"}
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default Bookmark;
