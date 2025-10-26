import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import CourseCard from "./CourseCard";
import SearchFilter from "./SearchFilter";
import Pagination from "./Pagination";
import "./CourseList.css";

const CourseList = ({ featured = false, limit = null }) => {
  const { courses } = useSelector((state) => state.courses);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const itemsPerPage = 9;

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search
    if (searchTerm) {
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (filterLevel !== "all") {
      result = result.filter((course) => course.level === filterLevel);
    }

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((course) => course.category === filterCategory);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        result.sort((a, b) => a.id - b.id);
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result.sort((a, b) => (b.students || 0) - (a.students || 0));
        break;
      default:
        break;
    }

    // Featured only
    if (featured) {
      result = result.filter((course) => course.featured);
    }

    // Limit
    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [
    courses,
    searchTerm,
    filterLevel,
    filterCategory,
    sortBy,
    featured,
    limit,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    if (limit) return filteredCourses;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage, limit]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="course-list-container">
      {!featured && (
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={filteredCourses.length}
        />
      )}

      {paginatedCourses.length === 0 ? (
        <div className="no-courses">
          <div className="no-courses-icon">📚</div>
          <h3>Không tìm thấy khóa học</h3>
          <p>Vui lòng thử lại với từ khóa hoặc bộ lọc khác</p>
        </div>
      ) : (
        <>
          <div className="courses-grid">
            {paginatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {!limit && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CourseList;
