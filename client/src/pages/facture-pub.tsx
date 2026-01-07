import { Helmet } from "react-helmet";

export default function FacturePub() {
  return (
    <>
      <Helmet>
        <title>Facture PA-2026-0107 - Protectassur Ltd</title>
      </Helmet>
      
      <style>{`
        @page {
          size: A4;
          margin: 10mm;
        }
        
        @media print {
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .invoice-container {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 8mm !important;
            max-width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-100 py-4 print:bg-white print:py-0">
        <div className="no-print max-w-[800px] mx-auto mb-4 px-4">
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Imprimer / Télécharger PDF
          </button>
        </div>
        
        <div 
          className="invoice-container max-w-[800px] mx-auto bg-white shadow-lg"
          style={{ padding: '28px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4" style={{ borderBottom: '2px solid #1e3a5f' }}>
            <div>
              <h1 style={{ fontSize: '22pt', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                Protectassur Ltd
              </h1>
              <p style={{ color: '#555', fontSize: '9pt', lineHeight: 1.4 }}>
                61 Bridge Street<br/>
                Kington, England, HR5 3DJ<br/>
                Registration Number: 14112679
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '12pt', fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                Facture
              </h2>
              <div style={{ fontSize: '9pt', color: '#444' }}>
                <p><strong>N°:</strong> PA-2026-0107</p>
                <p><strong>Date:</strong> 7 janvier 2026</p>
                <p><strong>Échéance:</strong> 6 février 2026</p>
              </div>
            </div>
          </div>
          
          {/* Parties */}
          <div className="flex justify-between mb-5">
            <div style={{ width: '45%' }}>
              <h3 style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '6px', fontWeight: 600 }}>Émetteur</h3>
              <p style={{ fontSize: '11pt', fontWeight: 700, color: '#1e3a5f', marginBottom: '3px' }}>Protectassur Ltd</p>
              <p style={{ fontSize: '9pt', color: '#444', lineHeight: 1.4 }}>
                61 Bridge Street<br/>
                Kington, England, HR5 3DJ<br/>
                Reg: 14112679
              </p>
            </div>
            <div style={{ width: '45%' }}>
              <h3 style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '6px', fontWeight: 600 }}>Destinataire</h3>
              <p style={{ fontSize: '11pt', fontWeight: 700, color: '#1e3a5f', marginBottom: '3px' }}>Zenassur SASU</p>
              <p style={{ fontSize: '9pt', color: '#444', lineHeight: 1.4 }}>
                66 Avenue des Champs-Élysées<br/>
                Paris, France<br/>
                SIREN: 942 553 579
              </p>
            </div>
          </div>
          
          {/* Document Title */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)', 
              color: '#fff', 
              padding: '12px 20px', 
              marginBottom: '16px', 
              borderRadius: '3px',
              textAlign: 'center'
            }}
          >
            <h2 style={{ fontSize: '11pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Facture de Remboursement de Frais Publicitaires
            </h2>
          </div>
          
          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '9pt' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#1e3a5f', borderBottom: '2px solid #dee2e6', width: '22%' }}>Plateforme</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#1e3a5f', borderBottom: '2px solid #dee2e6', width: '58%' }}>Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#1e3a5f', borderBottom: '2px solid #dee2e6', width: '20%' }}>Montant (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Facebook Ads</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Leads assurance décennale</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Courier New, monospace' }}>1 020,09</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Facebook Ads</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Leads assurance emprunteur France</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Courier New, monospace' }}>29,18</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Facebook Ads</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Leads assurance santé DOM-TOM</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Courier New, monospace' }}>132,50</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Facebook Ads</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Leads assurance emprunteur DOM-TOM</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Courier New, monospace' }}>133,77</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Facebook Ads</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Leads assurance automobile DOM-TOM <span style={{ fontSize: '8pt', color: '#666' }}>(ajusté décalage déc. 2025)</span></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Courier New, monospace' }}>1 078,97</td>
              </tr>
              <tr style={{ background: '#f0f4f8' }}>
                <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 600, color: '#1e3a5f' }}>Total Facebook Ads</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#1e3a5f', fontFamily: 'Courier New, monospace' }}>2 394,51</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Microsoft Ads (Bing)</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>Tous types d'assurance</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Courier New, monospace' }}>1 656,57</td>
              </tr>
              <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                <td colSpan={2} style={{ padding: '10px 10px', fontWeight: 700, fontSize: '10pt' }}>TOTAL À PAYER</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '11pt', fontFamily: 'Courier New, monospace' }}>4 051,08 €</td>
              </tr>
            </tbody>
          </table>
          
          {/* Payment Info */}
          <div style={{ background: '#f8f9fa', padding: '12px 14px', borderRadius: '3px', marginBottom: '14px', borderLeft: '3px solid #1e3a5f' }}>
            <h4 style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '1px', color: '#1e3a5f', marginBottom: '6px', fontWeight: 700 }}>Modalités de Paiement</h4>
            <p style={{ fontSize: '9pt', color: '#444', marginBottom: '3px' }}><strong>Mode:</strong> Virement bancaire</p>
            <p style={{ fontSize: '9pt', color: '#444' }}><strong>Échéance:</strong> 6 février 2026 (30 jours)</p>
          </div>
          
          {/* Notes */}
          <div style={{ background: '#fffbeb', padding: '12px 14px', borderRadius: '3px', marginBottom: '16px', border: '1px solid #fcd34d' }}>
            <h4 style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '1px', color: '#92400e', marginBottom: '6px', fontWeight: 700 }}>Notes Importantes</h4>
            <ol style={{ paddingLeft: '16px', margin: 0 }}>
              <li style={{ fontSize: '8pt', color: '#78350f', marginBottom: '4px', lineHeight: 1.4 }}>Cette facture correspond au remboursement des frais publicitaires réellement avancés par Protectassur Ltd pour le compte de Zenassur SASU.</li>
              <li style={{ fontSize: '8pt', color: '#78350f', lineHeight: 1.4 }}><strong>Décalage facturation Facebook Ads:</strong> Certaines diffusions fin décembre 2025 ont été prélevées en janvier 2026. Le montant exclut ces dépenses pour correspondre aux sorties bancaires 2025.</li>
            </ol>
          </div>
          
          {/* Signature */}
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '180px' }}>
              <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '50px' }}>
                <p style={{ fontSize: '10pt', fontWeight: 700, color: '#1e3a5f' }}>Protectassur Ltd</p>
                <p style={{ fontSize: '8pt', color: '#666' }}>Signature autorisée</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ marginTop: '24px', paddingTop: '10px', borderTop: '1px solid #dee2e6', textAlign: 'center', fontSize: '7pt', color: '#888' }}>
            Protectassur Ltd — 61 Bridge Street, Kington, England, HR5 3DJ — Registration Number: 14112679
          </div>
        </div>
      </div>
    </>
  );
}
