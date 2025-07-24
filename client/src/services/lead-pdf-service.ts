import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Fonction pour exporter tous les leads au format CSV
export const exportLeadsToCSV = async (leads: any[]) => {
  try {
    // Définition des en-têtes du CSV
    const headers = ['ID', 'Référence', 'Nom', 'Email', 'Téléphone', 'Statut', 'Type de service', 'Date de création'];
    
    // Transformation des données en format CSV
    const csvRows = [];
    
    // Ajouter les en-têtes
    csvRows.push(headers.join(','));
    
    // Ajouter les données de chaque lead
    for (const lead of leads) {
      const values = [
        lead.id,
        lead.referenceNumber || '',
        `"${(lead.firstName && lead.lastName) ? `${lead.firstName} ${lead.lastName}` : (lead.name || 'Non spécifié')}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.status || 'Nouveau'}"`,
        `"${lead.serviceType || ''}"`,
        new Date(lead.createdAt).toLocaleDateString('fr-FR')
      ];
      csvRows.push(values.join(','));
    }
    
    // Création du contenu CSV
    const csvContent = csvRows.join('\n');
    
    // Création d'un blob pour le téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Création d'un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // Ajouter à la page, déclencher le téléchargement, puis nettoyer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erreur lors de l\'exportation CSV:', error);
    throw new Error('Impossible d\'exporter les leads au format CSV.');
  }
};

// Ne pas utiliser les types précis car il y a une différence entre le schéma DB et les données renvoyées par l'API
export const exportLeadToPDF = async (lead: any) => {
  try {
    // Création d'un élément HTML temporaire pour le rendu du PDF
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // En-tête avec le logo
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    header.style.padding = '10px';
    header.style.borderBottom = '1px solid #ddd';
    
    const logo = document.createElement('div');
    logo.style.fontWeight = 'bold';
    logo.style.fontSize = '24px';
    logo.style.color = '#3b82f6';
    logo.textContent = 'Raccordement Électrique';
    
    const dateDiv = document.createElement('div');
    dateDiv.textContent = `Date: ${new Date().toLocaleDateString('fr-FR')}`;
    dateDiv.style.color = '#666';
    
    header.appendChild(logo);
    header.appendChild(dateDiv);
    
    // Création du contenu
    const content = document.createElement('div');
    content.style.padding = '15px';
    
    const title = document.createElement('h1');
    title.textContent = 'Fiche Lead';
    title.style.fontSize = '20px';
    title.style.color = '#333';
    title.style.marginBottom = '15px';
    
    const infoContainer = document.createElement('div');
    infoContainer.style.marginBottom = '20px';
    
    // ID et Référence
    const idSection = document.createElement('div');
    idSection.style.marginBottom = '15px';
    idSection.style.padding = '10px';
    idSection.style.backgroundColor = '#f8fafc';
    idSection.style.borderRadius = '5px';
    
    const idTitle = document.createElement('div');
    idTitle.textContent = 'Identification';
    idTitle.style.fontWeight = 'bold';
    idTitle.style.marginBottom = '5px';
    idTitle.style.color = '#3b82f6';
    
    const idContent = document.createElement('div');
    idContent.style.display = 'flex';
    idContent.style.justifyContent = 'space-between';
    
    const leadId = document.createElement('div');
    leadId.textContent = `ID: ${lead.id}`;
    leadId.style.fontSize = '14px';
    
    const createdAt = document.createElement('div');
    createdAt.textContent = `Créé le: ${new Date(lead.createdAt).toLocaleString('fr-FR')}`;
    createdAt.style.fontSize = '14px';
    
    idContent.appendChild(leadId);
    idContent.appendChild(createdAt);
    
    idSection.appendChild(idTitle);
    idSection.appendChild(idContent);
    
    // Informations client
    const clientSection = document.createElement('div');
    clientSection.style.marginBottom = '15px';
    clientSection.style.padding = '10px';
    clientSection.style.backgroundColor = '#f8fafc';
    clientSection.style.borderRadius = '5px';
    
    const clientTitle = document.createElement('div');
    clientTitle.textContent = 'Informations client';
    clientTitle.style.fontWeight = 'bold';
    clientTitle.style.marginBottom = '10px';
    clientTitle.style.color = '#3b82f6';
    
    clientSection.appendChild(clientTitle);
    
    const clientGrid = document.createElement('div');
    clientGrid.style.display = 'grid';
    clientGrid.style.gridTemplateColumns = '1fr 1fr';
    clientGrid.style.gap = '10px';
    
    // Ajouter les informations client
    const fields = [
      { label: 'Nom complet', value: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Non renseigné' },
      { label: 'Email', value: lead.email || 'Non renseigné' },
      { label: 'Téléphone', value: lead.phone || 'Non renseigné' },
      { label: 'Type de client', value: lead.clientType === 'particulier' ? 'Particulier' : lead.clientType === 'professionnel' ? 'Professionnel' : 'Non renseigné' },
    ];
    
    if (lead.clientType === 'professionnel') {
      fields.push(
        { label: 'Entreprise', value: lead.company || 'Non renseigné' },
        { label: 'SIRET', value: lead.siret || 'Non renseigné' }
      );
    }
    
    fields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.style.marginBottom = '5px';
      
      const label = document.createElement('div');
      label.textContent = field.label;
      label.style.fontSize = '12px';
      label.style.color = '#666';
      
      const value = document.createElement('div');
      value.textContent = field.value;
      value.style.fontSize = '14px';
      
      fieldContainer.appendChild(label);
      fieldContainer.appendChild(value);
      
      clientGrid.appendChild(fieldContainer);
    });
    
    clientSection.appendChild(clientGrid);
    
    // Informations projet
    const projectSection = document.createElement('div');
    projectSection.style.marginBottom = '15px';
    projectSection.style.padding = '10px';
    projectSection.style.backgroundColor = '#f8fafc';
    projectSection.style.borderRadius = '5px';
    
    const projectTitle = document.createElement('div');
    projectTitle.textContent = 'Informations projet';
    projectTitle.style.fontWeight = 'bold';
    projectTitle.style.marginBottom = '10px';
    projectTitle.style.color = '#3b82f6';
    
    projectSection.appendChild(projectTitle);
    
    const projectGrid = document.createElement('div');
    projectGrid.style.display = 'grid';
    projectGrid.style.gridTemplateColumns = '1fr 1fr';
    projectGrid.style.gap = '10px';
    
    // Ajouter les informations projet
    const projectFields = [
      { label: 'Adresse', value: lead.address || 'Non renseigné' },
      { label: 'Code postal', value: lead.postalCode || 'Non renseigné' },
      { label: 'Ville', value: lead.city || 'Non renseigné' },
      { label: 'Type de bâtiment', value: lead.buildingType || 'Non renseigné' }
    ];
    
    projectFields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.style.marginBottom = '5px';
      
      const label = document.createElement('div');
      label.textContent = field.label;
      label.style.fontSize = '12px';
      label.style.color = '#666';
      
      const value = document.createElement('div');
      value.textContent = field.value;
      value.style.fontSize = '14px';
      
      fieldContainer.appendChild(label);
      fieldContainer.appendChild(value);
      
      projectGrid.appendChild(fieldContainer);
    });
    
    projectSection.appendChild(projectGrid);
    
    // Pied de page
    const footer = document.createElement('div');
    footer.style.marginTop = '30px';
    footer.style.borderTop = '1px solid #ddd';
    footer.style.paddingTop = '10px';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    footer.style.textAlign = 'center';
    footer.textContent = 'Document généré automatiquement - Raccordement Électrique © 2025';
    
    // Assemblage du contenu
    infoContainer.appendChild(idSection);
    infoContainer.appendChild(clientSection);
    infoContainer.appendChild(projectSection);
    
    content.appendChild(title);
    content.appendChild(infoContainer);
    content.appendChild(footer);
    
    // Assemblage final
    container.appendChild(header);
    container.appendChild(content);
    
    document.body.appendChild(container);
    
    // Conversion en canvas puis en PDF
    const canvas = await html2canvas(container);
    document.body.removeChild(container);
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = pdfWidth / canvasWidth;
    const newHeight = canvasHeight * ratio;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, newHeight);
    
    // Si le PDF est plus long qu'une page, ajouter des pages supplémentaires
    if (newHeight > pdfHeight) {
      const numPages = Math.ceil(newHeight / pdfHeight);
      for (let i = 1; i < numPages; i++) {
        pdf.addPage();
        pdf.addImage(
          imgData, 
          'JPEG', 
          0, 
          -(i * pdfHeight), 
          pdfWidth, 
          newHeight
        );
      }
    }
    
    // Génération du nom de fichier
    const fileName = `Lead_${lead.id}_${(lead.firstName || '') + (lead.lastName || '')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Téléchargement du PDF
    pdf.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};
