import jsPDF from 'jspdf';

export function exportCarnetSantePDF(consultations, patientName = '') {
  const doc = new jsPDF();
  let y = 18;
  doc.setFontSize(18);
  doc.text('Carnet de santé' + (patientName ? ' - ' + patientName : ''), 14, y);
  y += 10;
  doc.setFontSize(12);
  consultations.forEach((consult, idx) => {
    const date = consult.date_consultation ? new Date(consult.date_consultation).toLocaleString() : '';
    const medecin = consult.medecin_nom || consult.medecin_id || '';
    const notes = consult.notes || '';
    const examens = consult.examens || consult.examen || '';
    const medicaments = consult.medicaments || consult.medications || consult.medicament || '';
    doc.setFont(undefined, 'bold');
    doc.text(`${idx + 1}. ${date} — Médecin : ${medecin}`, 14, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    // Notes
    doc.text('Notes :', 18, y);
    y += 6;
    if (notes) {
      const splitNotes = doc.splitTextToSize(notes, 170);
      doc.text(splitNotes, 22, y);
      y += splitNotes.length * 6 + 2;
    } else {
      doc.text('Aucune note.', 22, y);
      y += 8;
    }
    // Examens
    doc.text('Examens :', 18, y);
    y += 6;
    if (examens) {
      const splitExam = doc.splitTextToSize(examens, 170);
      doc.text(splitExam, 22, y);
      y += splitExam.length * 6 + 2;
    } else {
      doc.text('Aucun examen.', 22, y);
      y += 8;
    }
    // Médicaments
    doc.text('Médicaments :', 18, y);
    y += 6;
    if (medicaments) {
      const splitMed = doc.splitTextToSize(medicaments, 170);
      doc.text(splitMed, 22, y);
      y += splitMed.length * 6 + 2;
    } else {
      doc.text('Aucun médicament.', 22, y);
      y += 8;
    }
    // Séparateur visuel
    y += 2;
    doc.setDrawColor(180, 180, 180);
    doc.line(14, y, 196, y);
    y += 6;
    if (y > 260) {
      doc.addPage();
      y = 18;
    }
  });
  doc.save('Carnet_de_sante.pdf');
}
