// src/utils/pdfGenerator.js
import jsPDF from "jspdf";

/**
 * Helper function to load an image, handling potential CORS issues.
 * Assumes image paths are relative to the public root unless they start with http.
 * @param {string} url - The URL or path of the image.
 * @returns {Promise<HTMLImageElement>} A promise that resolves with the loaded image element.
 */
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Attempt to handle CORS if images are on a different origin.
    // The server hosting the images needs to send appropriate CORS headers (Access-Control-Allow-Origin).
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      console.error(`Image load error for ${url}:`, err);
      reject(new Error(`Failed to load image: ${url}`)); // Provide a more specific error
    };
    // Prepend '/' if paths are relative to the public root and don't already start with '/' or 'http'
    if (!url.startsWith('/') && !url.startsWith('http')) {
       img.src = `/${url}`;
    } else {
       img.src = url;
    }
  });
};

/**
 * Generates a PDF document with ID cards for the selected students.
 * Arranges cards in a grid layout on A4 pages.
 * Triggers a download of the generated PDF.
 * @param {Array<Object>} selectedStudentDetails - Array of student objects to include.
 * @param {Object|null} selectedSchool - The school object (used for school name on card).
 */
export const generateSelectedStudentsPdf = async (selectedStudentDetails, selectedSchool) => {
  if (!selectedStudentDetails || selectedStudentDetails.length === 0) {
    console.warn("PDF Generation skipped: No student details provided.");
    // Optionally alert the user here as well, or let the caller handle it.
    // alert("No students selected to generate PDF.");
    return;
  }

  console.log(`Generating PDF for ${selectedStudentDetails.length} students...`);
  // Consider adding a more user-facing loading indicator managed by the caller

  const pdf = new jsPDF({
    orientation: "p", // portrait
    unit: "mm",       // millimeters
    format: "a4"      // A4 size page
  });

  // --- Card and Page Layout Constants ---
  const cardWidth = 85.6; // Standard ID card width in mm
  const cardHeight = 54;  // Standard ID card height in mm
  const pageMargin = 10;  // Margin from page edges in mm
  const cardMarginX = 5;  // Horizontal space between cards in mm
  const cardMarginY = 5;  // Vertical space between cards in mm
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const cardsPerRow = Math.floor((pageWidth - 2 * pageMargin + cardMarginX) / (cardWidth + cardMarginX));
  const cardsPerCol = Math.floor((pageHeight - 2 * pageMargin + cardMarginY) / (cardHeight + cardMarginY));
  const cardsPerPage = cardsPerRow * cardsPerCol;

  let cardIndexOnPage = 0;

  for (let i = 0; i < selectedStudentDetails.length; i++) {
    const student = selectedStudentDetails[i];

    // Check if new page is needed before drawing the card
    if (i > 0 && i % cardsPerPage === 0) {
      pdf.addPage();
      cardIndexOnPage = 0; // Reset card index for the new page
    }

    // Calculate position for the current card
    const rowIndex = Math.floor(cardIndexOnPage / cardsPerRow);
    const colIndex = cardIndexOnPage % cardsPerRow;
    const x = pageMargin + colIndex * (cardWidth + cardMarginX);
    const y = pageMargin + rowIndex * (cardHeight + cardMarginY);

    // --- Draw Card Content ---
    pdf.setDrawColor(180, 180, 180); // Light grey border
    pdf.setLineWidth(0.2);
    pdf.rect(x, y, cardWidth, cardHeight); // Card border

    // School Name (Example)
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text(selectedSchool?.name || "School Name", x + cardWidth / 2, y + 6, { align: 'center' });

    // Student Photo Area
    const photoX = x + 5;
    const photoY = y + 10;
    const photoW = 20; // Photo width mm
    const photoH = 20; // Photo height mm
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.1);
    pdf.rect(photoX, photoY, photoW, photoH); // Photo border/placeholder

    const photoPath = student.photoThumbnailPath || student.photoPath;
    if (photoPath) {
      try {
        const img = await loadImage(photoPath);
        // Calculate aspect ratio to fit image correctly
        const aspectRatio = img.width / img.height;
        let drawW = photoW, drawH = photoH;
        if (aspectRatio > 1) { // Wider than tall
          drawH = photoW / aspectRatio;
        } else { // Taller than wide or square
          drawW = photoH * aspectRatio;
        }
        // Center the image within the photo area
        const drawX = photoX + (photoW - drawW) / 2;
        const drawY = photoY + (photoH - drawH) / 2;

        pdf.addImage(img, 'JPEG', drawX, drawY, drawW, drawH); // Use JPEG for potential compression
      } catch (err) {
        // Draw placeholder text if image fails to load
        pdf.setFontSize(6);
        pdf.setTextColor(150, 0, 0); // Red text for error
        pdf.text("Photo Error", photoX + photoW / 2, photoY + photoH / 2, { align: 'center', baseline: 'middle' });
        pdf.setTextColor(0, 0, 0); // Reset text color
        console.error(`Failed to load or add image for student ${student.studentId}:`, err);
      }
    } else {
      // Draw placeholder text if no photo path
      pdf.setFontSize(6);
      pdf.setTextColor(120, 120, 120); // Grey text
      pdf.text("No Photo", photoX + photoW / 2, photoY + photoH / 2, { align: 'center', baseline: 'middle' });
      pdf.setTextColor(0, 0, 0); // Reset text color
    }

    // Student Details Text Area
    const textStartX = photoX + photoW + 4; // Start text after photo + margin
    const textEndX = x + cardWidth - 4;     // End text before right card edge - margin
    const textWidth = textEndX - textStartX;
    const textStartY = y + 12;
    const lineSpacing = 4.5;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    // Use splitTextToSize for long names (optional, adds complexity)
    pdf.text(`${student.firstName || ''} ${student.lastName || ''}`.trim(), textStartX, textStartY, { maxWidth: textWidth });

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`ID: ${student.studentIdentifier || "N/A"}`, textStartX, textStartY + lineSpacing, { maxWidth: textWidth });
    pdf.text(`Status: ${student.isActive ? "Active" : "Inactive"}`, textStartX, textStartY + 2 * lineSpacing, { maxWidth: textWidth });
    // Add more fields if needed, ensuring they fit:
    // pdf.text(`Class: ${student.className || 'N/A'}`, textStartX, textStartY + 3 * lineSpacing, { maxWidth: textWidth });

    cardIndexOnPage++; // Increment index for the next card on the page
  }

  // --- Save the PDF ---
  try {
    pdf.save("selected_students_idcards.pdf");
    console.log("PDF generation complete and download triggered.");
  } catch (error) {
      console.error("Failed to save or generate PDF:", error);
      alert("An error occurred while generating the PDF. See console for details.");
  }

   // Consider removing the loading indicator in the caller component here
};