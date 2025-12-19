import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const ref = (uid, bookId) => doc(db, "users", uid, "bookmarks", bookId);

export const getBookId = (book) => book?.id;

export async function isBookmarked(uid, bookId) {
  const snap = await getDoc(ref(uid, bookId));
  return snap.exists();
}

export async function addBookmark(uid, book) {
  const bookId = getBookId(book);
  const v = book.volumeInfo || {};

  await setDoc(ref(uid, bookId), {
    book_id: bookId,
    book_title: v.title || "",
    book_author: (v.authors && v.authors.join(", ")) || "",
    thumbnail_url: v.imageLinks?.thumbnail || "",
    publisher: v.publisher || "",
    status: "todo",
    memo: "",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }, { merge: true });
}

export async function removeBookmark(uid, bookId) {
  await deleteDoc(ref(uid, bookId));
}

export async function toggleBookmark(uid, book) {
  const bookId = getBookId(book);
  const exists = await isBookmarked(uid, bookId);

  if (exists) {
    await removeBookmark(uid, bookId);
    return false;
  } else {
    await addBookmark(uid, book);
    return true;
  }
}
