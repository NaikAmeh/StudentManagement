import React, { useRef, useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { parse, format, isValid, isFuture } from "date-fns";

const CustomDatePicker = ({ selected, onChange, placeholder, maxDate, dateFormat = "dd/MM/yyyy", disabled }) => {
  const datePickerRef = useRef(null); // Ref for ReactDatePicker
  const inputRef = useRef(null); // Ref for the input field
  const [inputValue, setInputValue] = useState(""); // State to track the input value
  const [isInvalid, setIsInvalid] = useState(false); // State to track invalid input
  const [errorMessage, setErrorMessage] = useState(""); // State to track the error message

  // Sync input value with the selected date
  useEffect(() => {
    if (selected) {
      setInputValue(format(selected, "dd/MM/yyyy")); // Format the selected date
      setIsInvalid(false); // Reset invalid state
      setErrorMessage(""); // Clear error message
    } else {
      setInputValue(""); // Clear the input if no date is selected
    }
  }, [selected]);

  // Handle manual input with formatting
  const handleManualInput = (e) => {
    let inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart; // Save the cursor position
    setInputValue(inputValue); // Update the input value as the user types

    // Automatically add "/" after day and month
    if ((inputValue.length === 2 || inputValue.length === 5) && !inputValue.endsWith("/")) {
      inputValue += "/";
      setInputValue(inputValue); // Update the input value with the added "/"
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(cursorPosition + 1, cursorPosition + 1); // Adjust cursor position
        }
      }, 0);
      return;
    }

    // Handle incomplete input (e.g., "12/" or "12/05/")
    if (inputValue.length < 10) {
      setIsInvalid(true);
      setErrorMessage("Incomplete date. Please use dd/MM/yyyy format.");
      return;
    }

    // Validate and parse the input
    const parsedDate = parse(inputValue, "dd/MM/yyyy", new Date());
    if (isValid(parsedDate)) {
      const year = parsedDate.getFullYear();
      if (year < 1900 || year > new Date().getFullYear()) {
        setIsInvalid(true); // Mark input as invalid if the year is out of range
        setErrorMessage("Year must be between 1900 and the current year.");
      } else if (isFuture(parsedDate)) {
        setIsInvalid(true); // Mark input as invalid if the date is in the future
        setErrorMessage("Future dates are not allowed.");
      } else {
        setIsInvalid(false); // Reset invalid state
        setErrorMessage(""); // Clear error message
        onChange(parsedDate); // Pass the valid date to the parent
      }
    } else {
      setIsInvalid(true); // Mark input as invalid
      setErrorMessage("Invalid date format. Please use dd/MM/yyyy.");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", cursor: "pointer", position: "relative" }}>
      <ReactDatePicker
        ref={datePickerRef} // Attach the ref to ReactDatePicker
        selected={selected} // The selected date
        onChange={onChange} // Callback for date change
        maxDate={maxDate || new Date()} // Disable future dates by default
        dateFormat={dateFormat} // Display format
        showYearDropdown // Allow year selection
        scrollableYearDropdown // Make year dropdown scrollable
        placeholderText={placeholder || "Select a date"} // Default placeholder
        customInput={
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer", width: "100%" }}>
            <input
              ref={inputRef} // Attach the ref to the input field
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderBottom: isInvalid ? "2px solid #dc3545" : "2px solid #ccc", // Red border for invalid input
                fontSize: "1rem",
                outline: "none",
                backgroundColor: "transparent",
              }}
              value={inputValue} // Use the inputValue state
              onChange={handleManualInput} // Handle manual input
              placeholder={placeholder || "dd/MM/yyyy"}
              disabled={disabled} // Disable input if needed
              maxLength={10} 
              aria-invalid={isInvalid} // Accessibility: indicate invalid input
              aria-label="Date input field" // Accessibility: label for screen readers
            />
            <FaCalendarAlt
              style={{ marginLeft: "8px", color: "#0d6efd", cursor: "pointer" }}
              onClick={() => datePickerRef.current.setOpen(true)} // Open the calendar on icon click
              aria-label="Open calendar" // Accessibility: label for screen readers
            />
          </div>
        }
        disabled={disabled} // Disable the date picker if needed
      />
      {isInvalid && (
        <small style={{ color: "#dc3545", position: "absolute", top: "100%", left: 0, fontSize: "0.8rem" }}>
          {errorMessage}
        </small>
      )}
    </div>
  );
};

export default CustomDatePicker;