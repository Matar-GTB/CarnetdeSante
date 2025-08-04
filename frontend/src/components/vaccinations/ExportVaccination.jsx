import React from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ExportVaccination = ({ vaccins, onExport }) => {
  const generatePDF = (type) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Carnet de Vaccination', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 105, 30, { align: 'center' });

    // Contenu
    let y = 50;
    vaccins.forEach((vaccin, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text(`${index + 1}. ${vaccin.nom_vaccin}`, 20, y);
      y += 7;

      doc.setFontSize(10);
      if (vaccin.date_administration) {
        doc.text(`Date: ${format(new Date(vaccin.date_administration), 'dd/MM/yyyy')}`, 25, y);
      }
      y += 5;

      if (vaccin.lieu_vaccination) {
        doc.text(`Lieu: ${vaccin.lieu_vaccination}`, 25, y);
        y += 5;
      }

      if (vaccin.professionnel_sante) {
        doc.text(`Professionnel: ${vaccin.professionnel_sante}`, 25, y);
        y += 5;
      }

      if (vaccin.notes) {
        doc.text(`Notes: ${vaccin.notes}`, 25, y);
        y += 5;
      }

      y += 5;
    });

    // Sauvegarde
    doc.save('carnet-vaccination.pdf');
  };

  return (
    <div className="export-section">
      <h4>📄 Exporter mon carnet</h4>
      <div className="export-options">
        <div 
          className="export-option"
          onClick={() => generatePDF('complet')}
        >
          <h5>📋 Carnet complet</h5>
          <p>Tous les vaccins avec détails</p>
        </div>
        <div 
          className="export-option"
          onClick={() => generatePDF('synthese')}
        >
          <h5>📊 Synthèse</h5>
          <p>Résumé des vaccinations</p>
        </div>
        <div 
          className="export-option"
          onClick={() => generatePDF('planification')}
        >
          <h5>📅 Planification</h5>
          <p>Calendrier des rappels</p>
        </div>
      </div>
    </div>
  );
};

export default ExportVaccination;
