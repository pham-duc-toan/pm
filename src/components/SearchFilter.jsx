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
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm("")}>
            ✕
          </button>
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
            <option value="Lập trình">Lập trình</option>
            <option value="Thiết kế">Thiết kế</option>
            <option value="Kinh doanh">Kinh doanh</option>
            <option value="Marketing">Marketing</option>
            <option value="Ngoại ngữ">Ngoại ngữ</option>
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
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
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
