import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage/Login";
import MainPage from "./MainPage/Main";
import Detail from "./DetailPage/Detail";

import RecommandPage from "../src/RecommandPage/Recommand";

import "./App.css";
import Bookmark from "./BookmarkPage/Bookmark";

import { AuthProvider } from "./DetailPage/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/book/:id" element={<Detail />} />
          <Route path="/bookmarks" element={<Bookmark />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recommand" element={<RecommandPage />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
