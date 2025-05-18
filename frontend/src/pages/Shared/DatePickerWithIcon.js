import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerWithIcon = ({
  selectedDate,
  onChange,
  placeholder = "Select Date",
  maxDate = new Date(),
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false); // State to control calendar visibility

  const handleIconClick = () => {
    if (!disabled) {
      setIsOpen(true); // Open the calendar when the icon is clicked
    }
  };

  const handleClose = () => {
    setIsOpen(false); // Close the calendar when clicking outside
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          onChange(date);
          setIsOpen(false); // Close the calendar after selecting a date
        }}
        dateFormat="dd-MMM-yyyy" // Display format
        placeholderText={placeholder}
        maxDate={maxDate} // Prevent selecting future dates
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        disabled={disabled}
        open={isOpen} // Control the visibility of the calendar
        onClickOutside={handleClose} // Close the calendar when clicking outside
        className="form-control"
        style={{
          width: "100%",
          paddingRight: "35px", // Add padding for the icon
          border: "1px solid #ccc",
          borderRadius: "3px",
          height: "38px",
        }}
      />
      <FaCalendarAlt
        onClick={handleIconClick} // Open the calendar when the icon is clicked
        style={{
          position: "absolute",
          right: "74%",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#6c757d",
          cursor: "pointer", // Make the icon clickable
        }}
      />
    </div>
  );
};

export default DatePickerWithIcon;