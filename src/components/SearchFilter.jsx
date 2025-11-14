import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import coursesData from "../data/courses.json";
import "./SearchFilter.css";

const SearchFilter = ({
  searchTerm,
  setSearchTerm,
  filterLevel,
  setFilterLevel,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  totalResults,
}) => {
  const navigate = useNavigate();
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  const allCourses = coursesData.courses;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (localSearchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = localSearchTerm.toLowerCase();
    const results = [];

    // Tìm trong tên khóa học
    allCourses.forEach((course) => {
      if (course.title.toLowerCase().includes(searchLower)) {
        results.push({
          type: "course",
          id: course.id,
          title: course.title,
          instructor: course.instructor.fullName,
          category: course.category,
        });
      }
    });

    // Tìm theo giảng viên
    const instructorMatches = allCourses.filter((course) =>
      course.instructor.fullName.toLowerCase().includes(searchLower)
    );

    const instructorGroups = {};
    instructorMatches.forEach((course) => {
      const name = course.instructor.fullName;
      if (!instructorGroups[name]) {
        instructorGroups[name] = [];
      }
      instructorGroups[name].push(course);
    });

    Object.entries(instructorGroups).forEach(([name, courses]) => {
      results.push({
        type: "instructor",
        name: name,
        courseCount: courses.length,
      });
    });

    // Tìm theo category
    const categoryMatches = allCourses.filter((course) =>
      course.category.toLowerCase().includes(searchLower)
    );

    const categoryGroups = {};
    categoryMatches.forEach((course) => {
      const cat = course.category;
      if (!categoryGroups[cat]) {
        categoryGroups[cat] = [];
      }
      categoryGroups[cat].push(course);
    });

    Object.entries(categoryGroups).forEach(([cat, courses]) => {
      if (
        !results.find(
          (r) => r.type === "course" && courses.find((c) => c.id === r.id)
        )
      ) {
        results.push({
          type: "category",
          name: cat,
          courseCount: courses.length,
        });
      }
    });

    setSuggestions(results.slice(0, 6));
    setShowSuggestions(true);
    setSelectedIndex(-1);
  }, [localSearchTerm]);

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.type === "course") {
      navigate(`/courses/${suggestion.id}`);
    } else if (suggestion.type === "instructor") {
      setSearchTerm(suggestion.name);
      setLocalSearchTerm(suggestion.name);
      setShowSuggestions(false);
    } else if (suggestion.type === "category") {
      setFilterCategory(suggestion.name);
      setSearchTerm("");
      setLocalSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const highlightMatch = (text) => {
    if (!localSearchTerm.trim()) return text;
    const parts = text.split(new RegExp(`(${localSearchTerm})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === localSearchTerm.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        part
      )
    );
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "course":
        return "📚";
      case "instructor":
        return "👨‍🏫";
      case "category":
        return "🏷️";
      default:
        return "🔍";
    }
  };

  return (
    <div className="search-filter-container">
      <div className="search-box" ref={searchRef}>
        <input
          type="text"
          placeholder="Tìm kiếm khóa học, giảng viên, chủ đề..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          className="search-input"
        />
        {localSearchTerm && (
          <button
            className="clear-search"
            onClick={() => {
              setLocalSearchTerm("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          >
            ✕
          </button>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown-filter">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`suggestion-item-filter ${
                  index === selectedIndex ? "selected" : ""
                }`}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="suggestion-icon">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <div className="suggestion-content">
                  {suggestion.type === "course" && (
                    <>
                      <div className="suggestion-title">
                        {highlightMatch(suggestion.title)}
                      </div>
                      <div className="suggestion-meta">
                        {suggestion.instructor} • {suggestion.category}
                      </div>
                    </>
                  )}
                  {suggestion.type === "instructor" && (
                    <>
                      <div className="suggestion-title">
                        Giảng viên: {highlightMatch(suggestion.name)}
                      </div>
                      <div className="suggestion-meta">
                        {suggestion.courseCount} khóa học
                      </div>
                    </>
                  )}
                  {suggestion.type === "category" && (
                    <>
                      <div className="suggestion-title">
                        Chủ đề: {highlightMatch(suggestion.name)}
                      </div>
                      <div className="suggestion-meta">
                        {suggestion.courseCount} khóa học
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="category">Danh mục:</label>
          <select
            id="category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="Web Development">Web Development</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Database">Database</option>
            <option value="DevOps">DevOps</option>
            <option value="Programming">Programming</option>
            <option value="Tools & Productivity">Tools & Productivity</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="level">Cấp độ:</label>
          <select
            id="level"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort">Sắp xếp:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      <div className="results-count">
        Tìm thấy <strong>{totalResults}</strong> khóa học
      </div>
    </div>
  );
};

export default SearchFilter;
