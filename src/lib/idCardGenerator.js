import { jsPDF } from 'jspdf';

const loadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

export const generateIdCardPDF = async (userProfile) => {
  const doc = new jsPDF('portrait', 'pt', [300, 480]);
  
  // Background
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 300, 480, 'F');
  
  // Header accent
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 300, 80, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('5EVEN', 150, 45, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 242, 254);
  doc.text('INSTITUTION', 150, 60, { align: 'center' });
  
  // Avatar Frame
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(2);
  doc.roundedRect(100, 110, 100, 120, 8, 8, 'D');

  const avatarUrl = userProfile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (userProfile.username || 'user');
  const avatarImg = await loadImage(avatarUrl);
  
  if (avatarImg) {
    try {
      doc.addImage(avatarImg, 'PNG', 102, 112, 96, 116);
    } catch(e) {
      console.error('Failed to add avatar to PDF', e);
    }
  }
  
  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const fullName = userProfile.full_name || userProfile.name || userProfile.username || 'Agent';
  const splitName = doc.splitTextToSize(fullName.toUpperCase(), 260);
  doc.text(splitName, 150, 260, { align: 'center' });
  
  // Role
  const role = (userProfile.role || 'Member').toUpperCase();
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229); 
  doc.text(role, 150, 280, { align: 'center' });
  
  // Details Box
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(30, 310, 240, 90, 5, 5, 'D');
  
  let extra = userProfile.extra_details || {};
  if (typeof extra === 'string') {
    try { extra = JSON.parse(extra); } catch { extra = {}; }
  }
  
  const idNumber = extra.id_number || '70326-0001';
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  
  doc.text('ID NUMBER', 45, 330);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(idNumber, 45, 345);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('ISSUED BY', 45, 370);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('5EVEN Intelligence', 45, 385);
  
  // Barcode (simulated with lines)
  for(let i=0; i<15; i++) {
    doc.setLineWidth(Math.random() * 2 + 0.5);
    doc.setDrawColor(255, 255, 255);
    doc.line(190 + (i*4), 330, 190 + (i*4), 385);
  }
  
  // Footer
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 440, 300, 40, 'F');
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Property of 5EVEN Institution. If found, please return.', 150, 462, { align: 'center' });
  
  doc.save(`IDCard_${idNumber}.pdf`);
};
