import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ReactComponent as BookStackIcon } from "./logo.svg";
import Workmodal from "./Workmodal";
const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  z-index: 100;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  cursor: pointer;
`;



const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #789043;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #555;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 32px;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
  border-bottom: 1px solid #e5e5e5;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$active ? '#333' : '#999'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#333' : 'transparent'};
  
  &:hover {
    color: #333;
  }
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const Banner = styled.div`
  position: relative;
  background: linear-gradient(135deg, #D2D6A2 0%, #5FA143 100%);
  border-radius: 16px;
  padding: 60px;
  margin-bottom: 40px;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 40px 24px;
    min-height: 300px;
  }
`;

const BannerText = styled.div`
  color: white;
  max-width: 500px;
  z-index: 1;
`;

const BannerTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const BannerSubtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.95;
`;

const BannerBooks = styled.div`
  position: absolute;
  right: 80px; /* 오른쪽에서의 거리 (값을 키우면 왼쪽으로 이동) */
  bottom: 130px;   /* 아래쪽에서의 거리 (값을 키우면 위로 이동) */
  z-index: 1;
  
  /* 아이콘 크기 조절 */
  svg {
    width: 250px; /* 원하는 너비로 수정 */
    height: auto; /* 높이는 비율에 맞게 자동 조절 */
  }
`;

const SearchSection = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const SearchTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: #333;
  }
`;

const SearchButton = styled.button`
  padding: 14px 32px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #555;
  }
  
  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 40px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  transition: background 0.2s;
  
  &:hover {
    background: white;
  }
`;

const CategoryIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${props => props.$color || '#fff'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const CategoryLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #333;
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #333;
`;

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
`;

const BookCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const BookCoverWrapper = styled.div`
  position: relative;
  aspect-ratio: 3/4;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const BookCoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BookTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const BookAuthor = styled.p`
  font-size: 13px;
  color: #999;
  margin: 0;
`;

const ErrorMessage = styled.p`
  color: #ff4444;
  text-align: center;
  padding: 20px;
`;

const Main = () => {
  useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(q);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isFirstLoad = useRef(true);

  const categories = [
    { icon: "📚", label: "소설", query: "subject:fiction", color: "#FFE5E5" },
    { icon: "🎭", label: "에세이", query: "subject:essay", color: "#E5F3FF" },
    { icon: "📖", label: "인문학", query: "subject:humanities", color: "#FFF5E5" },
    { icon: "🎨", label: "예술", query: "subject:art", color: "#FFE5F3" },
    { icon: "✨", label: "자기계발", query: "subject:self-help", color: "#F5E5FF" },
    { icon: "📢", label: "경제경영", query: "subject:business", color: "#E5FFEF" },
    { icon: "🆕", label: "과학", query: "subject:science", color: "#FFE5E5" },
    { icon: "📦", label: "역사", query: "subject:history", color: "#E5F3FF" },
  ];

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (searchParams.get("q")) {
        setSearchParams({});
        setSearchResults([]);
      }
    }
  }, [searchParams, setSearchParams]);

  const fetchBooks = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&maxResults=20&key=${apiKey}`
      );
      const items = response.data.items || [];
      const processedItems = items.map(item => {
        if (item.volumeInfo.imageLinks?.thumbnail) {
          item.volumeInfo.imageLinks.thumbnail = item.volumeInfo.imageLinks.thumbnail.replace(/^http:/, 'https:');
        }
        return item;
      });
      setSearchResults(processedItems);
    } catch (err) {
      console.error("책 정보를 가져오는 데 실패했습니다.", err);
      setError("책 정보를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!q) {
      setSearchResults([]);
      return;
    }
    fetchBooks(q);
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchParams({});
      setSearchResults([]);
      setSelectedCategory(null);
      return;
    }

    setSearchParams({ q: trimmed });
    setSelectedCategory(null); // 검색 시 선택된 카테고리 초기화
  };

  const handleCategoryClick = (categoryLabel) => {
    const category = categories.find(c => c.label === categoryLabel);
    if (category) {
      setSelectedCategory(categoryLabel);
      setSearchQuery(""); // 검색어 초기화
      setSearchParams({}); // URL 파라미터 초기화
      fetchBooks(category.query);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  const handleTabClick = () => {
    setShowModal(true);
  };

  return (
    <Container>
      <Header>
        <TopBar>
          <Logo>오.도.독</Logo>
          
          <RightSection>
            <IconButton onClick={() => navigate("/bookmarks")}>북마크</IconButton>
            <IconButton onClick={() => navigate("/recommand")}>AI발견</IconButton>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </RightSection>
        </TopBar>
        
        <TabBar>
          <Tab $active>NOW</Tab>
          <Tab onClick={handleTabClick}>커뮤니티</Tab>
          <Tab onClick={handleTabClick}>오디오북</Tab>
          <Tab onClick={handleTabClick}>⚡오늘의 감상</Tab>
          <Tab onClick={handleTabClick}>오도독 플레이스</Tab>
        </TabBar>
      </Header>

      <MainContent>
        <Banner>
          <BannerText>
            <BannerTitle>
              이 책 왜 띵작?<br />
              오독 트렌드로 요약
            </BannerTitle>
            <BannerSubtitle>11월 오.도.독 회원 PICK</BannerSubtitle>
          </BannerText>
          
          <BannerBooks>
            <BookStackIcon/>
          </BannerBooks>
        </Banner>

        <SearchSection>
          <SearchTitle>지금 바로 읽어보세요</SearchTitle>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="책 제목, 저자 등을 입력하세요"
            />
            <SearchButton type="submit" disabled={loading}>
              {loading ? "검색 중..." : "검색"}
            </SearchButton>
          </SearchForm>
        </SearchSection>

        <CategorySection>
          <CategoryGrid>
            {categories.map((category, index) => (
              <CategoryItem key={index} onClick={() => handleCategoryClick(category.label)}>
                <CategoryIcon $color={category.color}>
                  {category.icon}
                </CategoryIcon>
                <CategoryLabel>{category.label}</CategoryLabel>
              </CategoryItem>
            ))}
          </CategoryGrid>
        </CategorySection>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {searchResults.length > 0 && (
          <>
            <SectionTitle>{selectedCategory ? `${selectedCategory} 추천 도서` : `검색 결과 (${searchResults.length}권)`}</SectionTitle>
            <BookGrid>
              {searchResults.map((book) => (
                <BookCard
                  key={book.id}
                  to={`/book/${book.id}`}
                  state={{ book, from: location }}
                >
                  <BookCoverWrapper>
                    <BookCoverImage
                      src={
                        book.volumeInfo.imageLinks?.thumbnail ||
                        "https://placehold.co/160x240?text=No+Image"
                      }
                      alt={book.volumeInfo.title}
                    />
                  </BookCoverWrapper>
                  <BookTitle>{book.volumeInfo.title}</BookTitle>
                  <BookAuthor>
                    {book.volumeInfo.authors?.join(", ") || "저자 미상"}
                  </BookAuthor>
                </BookCard>
              ))}
            </BookGrid>
          </>
        )}
      </MainContent>

      {showModal && (
        <Workmodal onClose={() => setShowModal(false)} />
      )}
    </Container>
  );
};

export default Main;