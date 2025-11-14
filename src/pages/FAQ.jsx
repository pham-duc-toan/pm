import React, { useState, useMemo } from "react";
import FAQSearch from "../components/FAQSearch";
import FAQCategory from "../components/FAQCategory";
import TicketForm from "../components/TicketForm";
import LiveChatWidget from "../components/LiveChatWidget";
import "./FAQ.css";

// Import dữ liệu FAQ
import faqData from "../data/faq.json";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("faq");

  // Lọc FAQs theo từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return faqData.categories;

    const lowercaseSearch = searchTerm.toLowerCase();
    return faqData.categories
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(lowercaseSearch) ||
            faq.answer.toLowerCase().includes(lowercaseSearch)
        ),
      }))
      .filter((category) => category.faqs.length > 0);
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleTicketSubmit = (ticket) => {
    // Lưu ticket vào localStorage (demo)
    const existingTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
    localStorage.setItem(
      "tickets",
      JSON.stringify([...existingTickets, ticket])
    );
  };

  return (
    <div className="faq-page">
      <FAQSearch onSearch={handleSearch} />

      <div className="faq-container">
        {/* Tab Navigation */}
        <div className="faq-tabs">
          <button
            className={`faq-tab ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            ❓ Câu hỏi thường gặp
          </button>
          <button
            className={`faq-tab ${activeTab === "ticket" ? "active" : ""}`}
            onClick={() => setActiveTab("ticket")}
          >
            🎫 Gửi yêu cầu hỗ trợ
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "faq" && (
          <div className="faq-content">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <FAQCategory
                  key={category.id}
                  category={category}
                  faqs={category.faqs}
                />
              ))
            ) : (
              <div className="no-results">
                <span className="no-results-icon">🔍</span>
                <h3>Không tìm thấy câu hỏi phù hợp</h3>
                <p>
                  Thử tìm kiếm với từ khóa khác hoặc liên hệ hỗ trợ trực tiếp
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "ticket" && (
          <div className="ticket-content">
            <TicketForm onSubmit={handleTicketSubmit} />

            <div className="support-info">
              <h3>📞 Thông tin liên hệ khác</h3>
              <div className="support-methods">
                <div className="support-method">
                  <span className="method-icon">📧</span>
                  <div>
                    <strong>Email</strong>
                    <p>support@codelearn.io</p>
                  </div>
                </div>
                <div className="support-method">
                  <span className="method-icon">📱</span>
                  <div>
                    <strong>Hotline</strong>
                    <p>1900 6789 (8:00 - 22:00)</p>
                  </div>
                </div>
                <div className="support-method">
                  <span className="method-icon">💬</span>
                  <div>
                    <strong>Live Chat</strong>
                    <p>Nhấn nút chat góc phải màn hình</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default FAQ;
