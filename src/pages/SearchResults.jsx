import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import coursesData from "../data/courses.json";
import usersData from "../data/users.json";
import CourseCard from "../components/CourseCard";
import "./SearchResults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(query);
  const [filters, setFilters] = useState({
    price: "all", // all, free, paid
    language: "all", // all, Tiếng Việt, English
    level: "all", // all, beginner, intermediate, advanced
    rating: "all", // all, 4+, 4.5+
  });
  const [sortBy, setSortBy] = useState("relevant"); // relevant, newest, popular, rating

  const allCourses = coursesData.courses;
  const instructors = usersData.users.filter(
    (u) => u.role === "teacher" || u.role === "instructor"
  );

  // Filter và search courses
  const filteredCourses = allCourses.filter((course) => {
    // Search trong tên, mô tả, giảng viên, tags
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      course.title.toLowerCase().includes(searchLower) ||
      course.description?.toLowerCase().includes(searchLower) ||
      course.instructor.fullName.toLowerCase().includes(searchLower) ||
      course.category.toLowerCase().includes(searchLower) ||
      (course.tags &&
        course.tags.some((tag) => tag.toLowerCase().includes(searchLower)));

    // Price filter
    const matchesPrice =
      filters.price === "all" ||
      (filters.price === "free" && course.price === 0) ||
      (filters.price === "paid" && course.price > 0);

    // Language filter
    const matchesLanguage =
      filters.language === "all" || course.language === filters.language;

    // Level filter
    const matchesLevel =
      filters.level === "all" || course.level === filters.level;

    // Rating filter
    const matchesRating =
      filters.rating === "all" ||
      (filters.rating === "4+" && course.rating >= 4) ||
      (filters.rating === "4.5+" && course.rating >= 4.5);

    return (
      matchesSearch &&
      matchesPrice &&
      matchesLanguage &&
      matchesLevel &&
      matchesRating
    );
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "popular":
        return b.totalStudents - a.totalStudents;
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default: // relevant
        return 0;
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      price: "all",
      language: "all",
      level: "all",
      rating: "all",
    });
    setSortBy("relevant");
  };

  const hasActiveFilters =
    filters.price !== "all" ||
    filters.language !== "all" ||
    filters.level !== "all" ||
    filters.rating !== "all";

  return (
    <div className="search-results-page">
      <div className="search-header">
        <div className="container">
          <h1>🔍 Kết quả tìm kiếm</h1>
          {searchTerm && (
            <p className="search-query">
              Tìm kiếm cho: <strong>"{searchTerm}"</strong>
            </p>
          )}
        </div>
      </div>

      <div className="search-content">
        <div className="container">
          <div className="search-layout">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              <div className="filters-header">
                <h3>🎯 Bộ lọc</h3>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              <div className="filter-section">
                <h4>💰 Giá</h4>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="price"
                    checked={filters.price === "all"}
                    onChange={() => handleFilterChange("price", "all")}
                  />
                  <span>Tất cả</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="price"
                    checked={filters.price === "free"}
                    onChange={() => handleFilterChange("price", "free")}
                  />
                  <span>Miễn phí</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="price"
                    checked={filters.price === "paid"}
                    onChange={() => handleFilterChange("price", "paid")}
                  />
                  <span>Trả phí</span>
                </label>
              </div>

              <div className="filter-section">
                <h4>🌐 Ngôn ngữ</h4>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="language"
                    checked={filters.language === "all"}
                    onChange={() => handleFilterChange("language", "all")}
                  />
                  <span>Tất cả</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="language"
                    checked={filters.language === "Tiếng Việt"}
                    onChange={() =>
                      handleFilterChange("language", "Tiếng Việt")
                    }
                  />
                  <span>Tiếng Việt</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="language"
                    checked={filters.language === "English"}
                    onChange={() => handleFilterChange("language", "English")}
                  />
                  <span>English</span>
                </label>
              </div>

              <div className="filter-section">
                <h4>📊 Độ khó</h4>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="level"
                    checked={filters.level === "all"}
                    onChange={() => handleFilterChange("level", "all")}
                  />
                  <span>Tất cả</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="level"
                    checked={filters.level === "beginner"}
                    onChange={() => handleFilterChange("level", "beginner")}
                  />
                  <span>Beginner</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="level"
                    checked={filters.level === "intermediate"}
                    onChange={() => handleFilterChange("level", "intermediate")}
                  />
                  <span>Intermediate</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="level"
                    checked={filters.level === "advanced"}
                    onChange={() => handleFilterChange("level", "advanced")}
                  />
                  <span>Advanced</span>
                </label>
              </div>

              <div className="filter-section">
                <h4>⭐ Đánh giá</h4>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === "all"}
                    onChange={() => handleFilterChange("rating", "all")}
                  />
                  <span>Tất cả</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === "4.5+"}
                    onChange={() => handleFilterChange("rating", "4.5+")}
                  />
                  <span>⭐ 4.5+</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === "4+"}
                    onChange={() => handleFilterChange("rating", "4+")}
                  />
                  <span>⭐ 4.0+</span>
                </label>
              </div>
            </aside>

            {/* Results */}
            <div className="results-main">
              <div className="results-toolbar">
                <div className="results-count">
                  Tìm thấy <strong>{sortedCourses.length}</strong> khóa học
                </div>
                <div className="sort-options">
                  <label>Sắp xếp:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="relevant">Liên quan nhất</option>
                    <option value="newest">Mới nhất</option>
                    <option value="popular">Phổ biến nhất</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                  </select>
                </div>
              </div>

              {sortedCourses.length > 0 ? (
                <div className="courses-grid">
                  {sortedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>Không tìm thấy khóa học</h3>
                  <p>
                    Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                  </p>
                  <button className="btn-clear-search" onClick={clearFilters}>
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
