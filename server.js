// 개발용 Express 서버 - Netlify 함수를 프록시합니다
require('dotenv').config(); // .env 파일 로드
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8888;

// 환경 변수 확인
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY가 설정되지 않았습니다.');
  console.warn('📝 프로젝트 루트에 .env 파일을 생성하고 다음을 추가하세요:');
  console.warn('   OPENAI_API_KEY=your-openai-api-key');
}

// Netlify 함수 디렉토리
const functionsPath = path.join(__dirname, 'netlify', 'functions');

// Netlify 함수를 직접 실행하기 위한 미들웨어
app.use(express.json());

// Netlify 함수 직접 실행
app.post('/.netlify/functions/getBookRecommendations', async (req, res) => {
  try {
    // Netlify 함수 모듈 직접 로드
    const functionHandler = require('./netlify/functions/getBookRecommendations');
    
    // Netlify 이벤트 객체 생성
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(req.body),
      headers: {
        'content-type': 'application/json'
      }
    };

    // 함수 실행
    const result = await functionHandler.handler(event);
    
    // 응답 처리
    res.status(result.statusCode || 200);
    Object.keys(result.headers || {}).forEach(key => {
      res.setHeader(key, result.headers[key]);
    });
    res.send(result.body);
  } catch (error) {
    console.error('Function execution error:', error);
    res.status(500).json({ 
      error: '함수 실행 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 개발용 함수 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
  console.log(`📝 React 앱을 다른 터미널에서 'npm start'로 실행하세요.`);
});

