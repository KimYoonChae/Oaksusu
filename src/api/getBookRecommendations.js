// api/getBookRecommendations.js

const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google Books API로 책 검색
async function searchBooks(query) {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`
    );
    
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo.title || '제목 없음',
        authors: item.volumeInfo.authors || ['저자 미상'],
        coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                  item.volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
                  null,
        description: item.volumeInfo.description || '',
        publisher: item.volumeInfo.publisher || ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Google Books API 오류:', error);
    return [];
  }
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '유효하지 않은 요청입니다.' });
    }

    // Claude API 호출
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `당신은 친절한 도서 추천 전문가입니다. 
사용자의 취향과 관심사를 파악하여 적절한 책을 추천해주세요.
추천할 때는 반드시 구체적인 책 제목과 저자를 포함해야 합니다.

응답 형식:
1. 간단한 인사말 또는 추천 이유 (1-2문장)
2. 추천 도서 목록을 다음 형식으로 제시:
   BOOK: [책 제목] by [저자명]
   BOOK: [책 제목] by [저자명]
   (최대 5권까지)

예시:
스트레스 해소에 좋은 책을 찾으시는군요! 다음 책들을 추천드립니다:

BOOK: 아몬드 by 손원평
BOOK: 달러구트 꿈 백화점 by 이미예
BOOK: 불편한 편의점 by 김호연`,
      messages: messages,
    });

    const aiMessage = response.content[0].text;
    
    // "BOOK:" 형식의 추천 도서 추출
    const bookMatches = aiMessage.match(/BOOK:\s*(.+?)\s+by\s+(.+?)(?=\n|$)/gi);
    
    let books = [];
    if (bookMatches && bookMatches.length > 0) {
      // 각 책에 대해 Google Books API로 검색
      const searchPromises = bookMatches.slice(0, 5).map(async (match) => {
        const parts = match.replace('BOOK:', '').split(' by ');
        const title = parts[0]?.trim();
        const author = parts[1]?.trim();
        
        if (title) {
          // 제목과 저자로 검색
          const searchQuery = author ? `${title} ${author}` : title;
          const searchResults = await searchBooks(searchQuery);
          
          if (searchResults.length > 0) {
            return searchResults[0];
          }
        }
        return null;
      });

      const searchedBooks = await Promise.all(searchPromises);
      books = searchedBooks.filter(book => book !== null);
    }

    // 책을 찾았으면 책 정보와 함께 반환
    if (books.length > 0) {
      // BOOK: 형식을 제거한 메시지
      const cleanMessage = aiMessage.split('BOOK:')[0].trim();
      
      return res.status(200).json({
        message: cleanMessage || '이런 책들은 어떠세요? 📚',
        books: books,
      });
    }

    // 책을 찾지 못했으면 텍스트 메시지만 반환
    return res.status(200).json({
      message: aiMessage,
      books: [],
    });

  } catch (error) {
    console.error('오류 발생:', error);
    
    return res.status(500).json({
      error: '도서 추천 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
}