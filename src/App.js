import {Routes, Route } from "react-router-dom";
import LoginPage from '../src/LoginPage/Login'
import MainPage from '../src/MainPage/Main'; 
import Detail from "../src/DetailPage/Detail"; // 1. Detail 컴포넌트를 import 합니다.
import './App.css';

function App() {
  return (
    <div className="App">
        <Routes>
          {/* 2. /book/:id 동적 경로로 수정합니다. */}
          <Route path="/book/:id" element={<Detail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
    </div>
  );
}

export default App;