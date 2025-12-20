const { OpenAI } = require("openai");
const axios = require("axios");

// Netlify 환경 변수에서 API 키를 안전하게 가져옵니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;

exports.handler = async function (event) {
  // POST 요청만 허용합니다.
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const userMessage = messages[messages.length - 1];

    if (!userMessage || userMessage.role !== 'user' || !userMessage.content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid user message provided." }),
      };
    }

    const systemPrompt = `You are a helpful assistant who recommends books. Based on the user's request, recommend up to 3 books. For each book, provide the title and author. Respond with ONLY a valid JSON object containing a "books" key, which is an array of objects. Each object must have "title" and "author" keys. Example: {"books": [{"title": "The Hitchhiker's Guide to the Galaxy", "author": "Douglas Adams"}, {"title": "Project Hail Mary", "author": "Andy Weir"}]}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        userMessage,
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    let bookSuggestions = [];

    try {
      const parsedContent = JSON.parse(content);
      if (parsedContent.books && Array.isArray(parsedContent.books)) {
        bookSuggestions = parsedContent.books;
      } else {
        throw new Error("Unexpected JSON structure from OpenAI");
      }
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI:", e, content);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "책 추천을 받았지만 형식이 올바르지 않습니다. 다시 시도해주세요." }),
      };
    }

    if (bookSuggestions.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "죄송합니다, 적절한 책을 찾지 못했어요. 다른 관심사를 알려주시겠어요?" }),
      };
    }

    const bookDetailsPromises = bookSuggestions.map(async (book) => {
      try {
        const query = `intitle:${book.title}+inauthor:${book.author}`;
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&key=${googleApiKey}`
        );
        if (response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
          const coverUrl = item.volumeInfo.imageLinks?.thumbnail || null;
          return {
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors,
            coverUrl: coverUrl ? coverUrl.replace(/^http:/, 'https:') : null,
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching details for ${book.title}:`, error.message);
        return null;
      }
    });

    const bookDetails = (await Promise.all(bookDetailsPromises)).filter(Boolean);

    return {
      statusCode: 200,
      body: JSON.stringify({ books: bookDetails }),
    };
  } catch (error) {
    console.error("Error in getBookRecommendations function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "책 추천을 받는 데 실패했습니다." }),
    };
  }
};