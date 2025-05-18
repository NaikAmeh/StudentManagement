// src/components/common/PaginationControls.js
import React from 'react';

// --- Styles ---
const buttonStyle = {
  padding: "6px 12px",
  cursor: "pointer",
  borderRadius: "3px",
  border: "1px solid #6c757d", // Neutral border
  fontSize: "0.9em",
  backgroundColor: "#ffffff", // White background
  color: "#343a40",      // Dark text
  margin: "0 3px",
};
const activeButtonStyle = {
    ...buttonStyle,
    fontWeight: "bold",
    backgroundColor: "#e9ecef", // Light grey for active
    borderColor: "#adb5bd",
};
const disabledButtonStyle = {
    ...buttonStyle,
    cursor: "not-allowed",
    opacity: 0.6,
};
const paginationContainerStyle = {
    marginTop: "20px",
    textAlign: "center",
    padding: '10px 0',
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page or less
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
      onPageChange(page);
  }

  // Basic pagination: Previous, Page Numbers, Next
  // You could add logic for ellipsis (...) for many pages later if needed
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div style={paginationContainerStyle}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
      >
        Previous
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          style={currentPage === page ? activeButtonStyle : buttonStyle}
        >
          {page}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;