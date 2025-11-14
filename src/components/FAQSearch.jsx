import React, { useState } from "react";
import "./FAQSearch.css";

const FAQSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="faq-search-container">
      <h1>Câu hỏi thường gặp</h1>
      <p className="faq-subtitle">Tìm câu trả lời cho các thắc mắc của bạn</p>
      <form onSubmit={handleSearch} className="faq-search-form">
        <div className="faq-search-input-wrapper">
          <span className="faq-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value);
            }}
            className="faq-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="faq-clear-btn"
              onClick={() => {
                setSearchTerm("");
                onSearch("");
              }}
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FAQSearch;
