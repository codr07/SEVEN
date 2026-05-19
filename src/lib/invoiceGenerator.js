import { jsPDF } from 'jspdf';

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

/**
 * Generates a legal tax invoice PDF for a course or notes purchase.
 * @param {Object} payment - The payment transaction object
 * @param {Object} userProfile - The logged-in user profile object
 */
export const generateInvoicePDF = async (payment, userProfile, returnBase64 = false) => {
  const sign1 = await loadImage('/assets/images/sign/sign1.png');
  const sign2 = await loadImage('/assets/images/sign/sign2.png');
  
  const doc = new jsPDF('portrait', 'pt', 'a4');
  
  // A4 dimensions: 595.28 x 841.89 points
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  
  // Colors
  const primaryColor = [79, 70, 229]; // Indigo/Primary
  const accentColor = [224, 242, 254]; // Shaded BG
  const darkColor = [31, 41, 55]; // Charcoal Text
  const lightGray = [156, 163, 175]; // Light Gray Text
  const borderGray = [229, 231, 235]; // Table Borders

  // Helpers
  const drawLine = (y) => {
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // --- HEADER SECTION ---
  // Background brand block
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, pageWidth, 120, 'F');
  
  // 5EVEN Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5EVEN', margin, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('INSTITUTION', margin + 105, 43);
  
  // Organization Info
  doc.setFontSize(8);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('GSTIN: 19AAECF5739E1Z0', margin, 75);
  doc.text('Address: 12, Techno Arcade, Sector V, Bidhannagar, Kolkata, WB, 700091', margin, 88);
  doc.text('Email: institution5even@gmail.com | Web: 5even.netlify.app', margin, 101);

  // Invoice status badge
  const isPaid = payment.status === 'paid';
  const docTitle = isPaid ? 'TAX INVOICE' : 'PROFORMA INVOICE';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(docTitle, pageWidth - margin, 50, { align: 'right' });
  
  // Status box with icon
  const statusBoxWidth = 140;
  const statusBoxX = pageWidth - margin - statusBoxWidth;
  doc.setFillColor(isPaid ? 220 : 254, isPaid ? 252 : 243, isPaid ? 231 : 199);
  doc.roundedRect(statusBoxX, 65, statusBoxWidth, 22, 4, 4, 'F');
  
  // Status icon (circle + tick or circle + exclamation)
  if (isPaid) {
    // Green circle for checkmark
    doc.setFillColor(34, 197, 94);
    doc.circle(statusBoxX + 16, 65 + 11, 5, 'F');
    // White tick
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(statusBoxX + 13.5, 65 + 11, statusBoxX + 15.5, 65 + 13);
    doc.line(statusBoxX + 15.5, 65 + 13, statusBoxX + 18.5, 65 + 9);
  } else {
    // Amber circle for warning
    doc.setFillColor(245, 158, 11);
    doc.circle(statusBoxX + 16, 65 + 11, 5, 'F');
    // White exclamation
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.line(statusBoxX + 16, 65 + 8, statusBoxX + 16, 65 + 12);
    doc.circle(statusBoxX + 16, 65 + 14, 0.5, 'F');
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? 21 : 180, isPaid ? 128 : 83, isPaid ? 61 : 9);
  doc.text(isPaid ? 'PAID & VERIFIED' : 'PENDING APPROVAL', statusBoxX + 80, 79, { align: 'center' });

  // --- INVOICE & CLIENT INFO ---
  const infoY = 150;
  
  // Client Info (Left)
  // Draw premium vector User/Person icon
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.circle(margin + 5, infoY - 8, 3, 'F'); // Head
  doc.ellipse(margin + 5, infoY - 1, 5, 2.5, 'F'); // Shoulders
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('BILL TO:', margin + 16, infoY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${payment.billing_name || userProfile?.full_name || userProfile?.username || 'Student'}`, margin + 16, infoY + 18);
  doc.text(`Email: ${payment.billing_email || userProfile?.email || 'N/A'}`, margin + 16, infoY + 32);
  if (payment.billing_phone) doc.text(`Phone: ${payment.billing_phone}`, margin + 16, infoY + 46);
  if (payment.billing_address) {
    const addressLines = doc.splitTextToSize(`${payment.billing_address}, ${payment.billing_city}, ${payment.billing_state} - ${payment.billing_pin}`, 180);
    doc.text(addressLines, margin + 16, infoY + 60);
  }
  
  // Invoice Details (Right)
  const rightX = pageWidth - margin - 220;
  
  // Draw premium vector Document/File icon
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(rightX, infoY - 12, 10, 12, 1, 1, 'D'); // Page border
  doc.line(rightX + 2.5, infoY - 8, rightX + 7.5, infoY - 8); // Text lines
  doc.line(rightX + 2.5, infoY - 5, rightX + 7.5, infoY - 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DETAILS:', rightX + 16, infoY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: INV-${payment.transaction_id || payment.id}`, rightX + 16, infoY + 18);
  doc.text(`Date: ${new Date(payment.created_at || Date.now()).toLocaleString()}`, rightX + 16, infoY + 32);
  doc.text(`Payment Mode: UPI ${payment.payer_upi_id ? `(${payment.payer_upi_id})` : ''}`, rightX + 16, infoY + 46);
  doc.text(`Txn Ref ID: ${payment.transaction_id || 'N/A'}`, rightX + 16, infoY + 60);

  // --- TABLE SECTION ---
  const tableY = 250;
  
  // Table Header Shading
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, tableY, pageWidth - (margin * 2), 24, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  
  // Header labels
  doc.text('SI.', margin + 8, tableY + 15);
  doc.text('Description of Service / Product', margin + 30, tableY + 15);
  doc.text('SAC Code', margin + 190, tableY + 15);
  doc.text('Taxable Val', margin + 275, tableY + 15, { align: 'right' });
  doc.text('CGST (2.5%)', margin + 350, tableY + 15, { align: 'right' });
  doc.text('SGST (2.5%)', margin + 425, tableY + 15, { align: 'right' });
  doc.text('Total (INR)', pageWidth - margin - 10, tableY + 15, { align: 'right' });
  
  // Data extraction & Row population
  const purposeText = payment.purpose || '5EVEN Learning Asset';
  const isCertIncluded = purposeText.toLowerCase().includes('[cert]');
  const cleanTitle = purposeText.replace(/\[.*?\]\s*/g, '').trim();
  const rawAmount = payment.amount || 0;
  
  const basePrice = rawAmount / 1.05;
  const gstVal = rawAmount - basePrice;
  const cgstVal = gstVal / 2;
  const sgstVal = gstVal / 2;

  const rows = [];
  if (purposeText.includes('[Course]') && isCertIncluded && rawAmount > 524) {
    // Course + Certification bundle
    const certBase = 475.24;
    const certTotal = 499.00;
    const certCgst = 11.88;
    const certSgst = 11.88;
    
    const courseBase = basePrice - certBase;
    const courseTotal = rawAmount - certTotal;
    const courseCgst = cgstVal - certCgst;
    const courseSgst = sgstVal - certSgst;
    
    rows.push({
      title: `${cleanTitle} (Standard Course Enrollment)`,
      sac: '999249',
      base: courseBase,
      cgst: courseCgst,
      sgst: courseSgst,
      total: courseTotal
    });
    
    rows.push({
      title: 'Official Certification & Assessment (Add-On)',
      sac: '999249',
      base: certBase,
      cgst: certCgst,
      sgst: certSgst,
      total: certTotal
    });
  } else if (isCertIncluded) {
    // Certification only
    rows.push({
      title: `${cleanTitle} (Official Certification & Assessment Add-On)`,
      sac: '999249',
      base: basePrice,
      cgst: cgstVal,
      sgst: sgstVal,
      total: rawAmount
    });
  } else {
    // Standard course/service/academic/note purchase without add-ons
    rows.push({
      title: cleanTitle,
      sac: '999249',
      base: basePrice,
      cgst: cgstVal,
      sgst: sgstVal,
      total: rawAmount
    });
  }

  // Draw Dynamic Height Table Border
  const rowHeight = 35;
  const tableBottomY = tableY + 24 + (rows.length * rowHeight);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, tableY, pageWidth - (margin * 2), 24 + (rows.length * rowHeight), 'D');

  rows.forEach((row, idx) => {
    const currentRowY = tableY + 24 + (idx * rowHeight);
    
    // Horizontal divider between rows if not the first row
    if (idx > 0) {
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, currentRowY, pageWidth - margin, currentRowY);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    
    // Sl. No
    doc.text(String(idx + 1), margin + 8, currentRowY + 22);
    
    // Wrapped Title
    const textLines = doc.splitTextToSize(row.title, 140);
    doc.text(textLines, margin + 30, currentRowY + 15);
    
    // SAC
    doc.text(row.sac, margin + 190, currentRowY + 22);
    
    // Base Price
    doc.text(`INR ${row.base.toFixed(2)}`, margin + 275, currentRowY + 22, { align: 'right' });
    
    // CGST
    doc.text(`INR ${row.cgst.toFixed(2)}`, margin + 350, currentRowY + 22, { align: 'right' });
    
    // SGST
    doc.text(`INR ${row.sgst.toFixed(2)}`, margin + 425, currentRowY + 22, { align: 'right' });
    
    // Total
    doc.text(`INR ${row.total.toFixed(2)}`, pageWidth - margin - 10, currentRowY + 22, { align: 'right' });
  });

  // --- CALCULATION BLOCK (DYNAMIC Y) ---
  const calcY = tableBottomY + 20;
  const calcRightX = pageWidth - margin;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  
  doc.text('Subtotal (Excl. GST):', calcRightX - 180, calcY);
  doc.text(`INR ${basePrice.toFixed(2)}`, calcRightX - 15, calcY, { align: 'right' });
  
  doc.text('CGST (2.5%):', calcRightX - 180, calcY + 18);
  doc.text(`INR ${cgstVal.toFixed(2)}`, calcRightX - 15, calcY + 18, { align: 'right' });
  
  doc.text('SGST (2.5%):', calcRightX - 180, calcY + 36);
  doc.text(`INR ${sgstVal.toFixed(2)}`, calcRightX - 15, calcY + 36, { align: 'right' });
  
  // Grand Total Box
  doc.setFillColor(249, 250, 251);
  doc.rect(calcRightX - 190, calcY + 48, 190, 30, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1.5);
  doc.line(calcRightX - 190, calcY + 48, calcRightX, calcY + 48);
  doc.line(calcRightX - 190, calcY + 78, calcRightX, calcY + 78);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL AMOUNT:', calcRightX - 180, calcY + 67);
  doc.text(`INR ${rawAmount.toFixed(2)}`, calcRightX - 15, calcY + 67, { align: 'right' });
 
  // --- LEGAL & DISCLOSURES (DYNAMIC Y) ---
  const legalY = calcY + 105;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Terms & Conditions:', margin, legalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  
  const terms = [
    '1. This is a legally valid Tax Invoice generated electronically under GST rules for online education services.',
    '2. Payments are reviewed and authorized by the administration of 5EVEN Institution.',
    '3. Online learning assets, courses, and digital files are subject to intellectual property laws.',
    '4. Disputes, if any, are subject strictly to the jurisdiction of the court in Kolkata, West Bengal.'
  ];
  
  let currentY = legalY + 14;
  terms.forEach((term) => {
    const splitLines = doc.splitTextToSize(term, 250);
    doc.text(splitLines, margin, currentY);
    currentY += (splitLines.length * 8.5) + 1.5;
  });

  // --- SIGNATORY SEAL (DYNAMIC Y) ---
  const sealWidth = 240;
  const sealHeight = 70;
  const sealX = pageWidth - margin - sealWidth;
  const sealY = legalY;
  
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(sealX, sealY, sealWidth, sealHeight, 6, 6, 'D');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5EVEN INSTITUTION AUTHORIZED SIGNATORIES', sealX + sealWidth / 2, sealY + 12, { align: 'center' });
  
  // Render signature images inside the box side-by-side
  if (sign1) {
    // Authorized Signatory 1
    doc.addImage(sign1, 'PNG', sealX + 25, sealY + 18, 70, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Authorized Signatory', sealX + 60, sealY + 56, { align: 'center' });
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Authorized Signatory', sealX + 60, sealY + 36, { align: 'center' });
  }
  
  if (sign2) {
    // Authorized Signatory 2
    doc.addImage(sign2, 'PNG', sealX + 145, sealY + 18, 70, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Authorized Signatory', sealX + 180, sealY + 56, { align: 'center' });
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Authorized Signatory', sealX + 180, sealY + 36, { align: 'center' });
  }
  
  // Vertical divider between signatures
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(sealX + sealWidth / 2, sealY + 18, sealX + sealWidth / 2, sealY + 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Digitally Verified / No Seal Required', sealX + sealWidth / 2, sealY + 66, { align: 'center' });

  // --- FOOTER BLOCK ---
  doc.setFillColor(31, 41, 55);
  doc.rect(0, pageHeight - 35, pageWidth, 35, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('THANK YOU FOR YOUR VALUED ASSOCIATION', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save the document
  const safeTxnId = (payment.transaction_id || payment.id || 'INV').replace(/[^a-zA-Z0-9]/g, '');
  if (returnBase64) {
    return doc.output('datauristring').split(',')[1];
  } else {
    doc.save(`Invoice_${safeTxnId}.pdf`);
  }
};
