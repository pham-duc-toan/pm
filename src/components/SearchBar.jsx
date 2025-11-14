import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import coursesData from "../data/courses.json";
import "./SearchBar.css";

const SearchBar = ({ placeholder = "Tìm kiếm khóa học, giảng viên..." }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
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
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
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

    // Group theo giảng viên
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

    // Tìm theo category/tag
    const categoryMatches = allCourses.filter((course) =>
      course.category.toLowerCase().includes(searchLower)
    );

    // Group theo category
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

    // Limit results
    setSuggestions(results.slice(0, 8));
    setShowSuggestions(true);
    setSelectedIndex(-1);
  }, [searchTerm]);

  const handleSearch = (query = searchTerm) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setSearchTerm("");
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.type === "course") {
      navigate(`/courses/${suggestion.id}`);
    } else if (suggestion.type === "instructor") {
      navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === "category") {
      navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    }
    setShowSuggestions(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

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
        } else {
          handleSearch();
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

  const highlightMatch = (text, search) => {
    if (!search.trim()) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
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
    <div className="search-bar-wrapper" ref={searchRef}>
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
        />
        {searchTerm && (
          <button
            className="clear-search-btn"
            onClick={() => {
              setSearchTerm("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          >
            ✕
          </button>
        )}
        <button className="submit-search-btn" onClick={() => handleSearch()}>
          Tìm kiếm
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${
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
                      {highlightMatch(suggestion.title, searchTerm)}
                    </div>
                    <div className="suggestion-meta">
                      {suggestion.instructor} • {suggestion.category}
                    </div>
                  </>
                )}
                {suggestion.type === "instructor" && (
                  <>
                    <div className="suggestion-title">
                      Giảng viên: {highlightMatch(suggestion.name, searchTerm)}
                    </div>
                    <div className="suggestion-meta">
                      {suggestion.courseCount} khóa học
                    </div>
                  </>
                )}
                {suggestion.type === "category" && (
                  <>
                    <div className="suggestion-title">
                      Chủ đề: {highlightMatch(suggestion.name, searchTerm)}
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
  );
};

export default SearchBar;
