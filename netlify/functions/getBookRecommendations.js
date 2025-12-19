const { OpenAI } = require("openai");

// Netlify 환경 변수에서 API 키를 안전하게 가져옵니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function (event) {
  // CORS 헤더 설정
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // POST 요청만 허용합니다.
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "메시지를 입력해주세요." }),
      };
    }

    // 시스템 메시지 추가 (대화 시작 시에만)
    const systemMessage = {
      role: "system",
      content: "당신은 친절한 도서 추천 전문가입니다. 사용자와 대화하며 그들의 취향, 관심사, 읽고 싶은 책의 장르나 주제를 파악한 후 적절한 책을 추천해주세요. 한국어로 대화하며, 책을 추천할 때는 책 제목, 저자, 간단한 추천 이유를 포함해주세요.",
    };

    // 메시지 배열 구성 (시스템 메시지가 없으면 추가)
    const hasSystemMessage = messages.some(msg => msg.role === "system");
    const conversationMessages = hasSystemMessage 
      ? messages 
      : [systemMessage, ...messages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 더 나은 성능을 위해 최신 모델 사용
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 1000, // 대화형 응답을 위해 토큰 수 증가
    });

    const assistantMessage = completion.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: assistantMessage,
        role: "assistant"
      }),
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    
    // 더 자세한 에러 정보 제공
    const errorMessage = error.response?.data?.error?.message || error.message || "책 추천을 받는 데 실패했습니다.";
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "책 추천을 받는 데 실패했습니다.",
        details: errorMessage
      }),
    };
  }
};

