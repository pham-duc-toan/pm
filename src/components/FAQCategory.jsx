import React, { useState } from "react";
import "./FAQCategory.css";

const FAQCategory = ({ category, faqs }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="faq-category">
      <h2 className="faq-category-title">
        <span className="faq-category-icon">{category.icon}</span>
        {category.name}
      </h2>
      <div className="faq-list">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className={`faq-item ${expandedId === faq.id ? "expanded" : ""}`}
          >
            <button className="faq-question" onClick={() => toggleFAQ(faq.id)}>
              <span>{faq.question}</span>
              <span className="faq-toggle-icon">
                {expandedId === faq.id ? "−" : "+"}
              </span>
            </button>
            {expandedId === faq.id && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
                {faq.links && (
                  <div className="faq-links">
                    {faq.links.map((link, index) => (
                      <a key={index} href={link.url} className="faq-link">
                        {link.text} →
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQCategory;
