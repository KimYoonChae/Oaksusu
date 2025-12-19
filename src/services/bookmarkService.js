import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    updateDoc, 
  } from "firebase/firestore";
  import { db } from "../firebase";
  
  // users/{uid}/bookmarks/{bookId}
  const bookmarkRef = (uid, bookId) => doc(db, "users", uid, "bookmarks", bookId);
  
  export const getBookId = (book) => book?.id;
  
  export async function isBookmarked(uid, bookId) {
    const snap = await getDoc(bookmarkRef(uid, bookId));
    return snap.exists();
  }
  
  export async function addBookmark(uid, book) {
    const bookId = getBookId(book);
    if (!bookId) throw new Error("bookId가 없습니다.");
  
    const v = book.volumeInfo || {};
    await setDoc(
      bookmarkRef(uid, bookId),
      {
        book_id: bookId,
        book_title: v.title || "",
        book_author: (v.authors && v.authors.join(", ")) || "",
        thumbnail_url: v.imageLinks?.thumbnail || "",
        publisher: v.publisher || "",
        status: "todo",
        memo: "",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  }
  
  export async function removeBookmark(uid, bookId) {
    await deleteDoc(bookmarkRef(uid, bookId));
  }
  
  export async function toggleBookmark(uid, book) {
    const bookId = getBookId(book);
    const exists = await isBookmarked(uid, bookId);
  
    if (exists) {
      await removeBookmark(uid, bookId);
      return false; // 북마크 안된 상태
    } else {
      await addBookmark(uid, book);
      return true; // 지금 북마크된 상태
    }
  }
  
  // 북마크 메모 불러오기
  export async function getBookmarkMemo(uid, bookId) {
    const snap = await getDoc(bookmarkRef(uid, bookId));
    if (!snap.exists()) return ""; // 북마크 없으면 메모 없음
    return snap.data().memo || "";
  }
  
  // 북마크된 책만 memo 저장(만약, 북마크가 안된 책이면 에러 발생)
  export async function saveBookmarkMemo(uid, bookId, memo) {
    const ref = bookmarkRef(uid, bookId);
    const snap = await getDoc(ref);
  
    if (!snap.exists()) {
      throw new Error("BOOKMARK_REQUIRED");
    }
  
    await updateDoc(ref, {
      memo: memo ?? "",
      updated_at: serverTimestamp(),
    });
  }
  