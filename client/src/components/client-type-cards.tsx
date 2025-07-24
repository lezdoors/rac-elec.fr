import { User, Home, Briefcase, LandPlot } from "lucide-react";
import { useState, useEffect } from "react";

// Type pour les valeurs de type client
type ClientType = "particulier" | "professionnel" | "collectivite";

/**
 * Composant spécifique pour les cartes de type client
 * Implémenté exactement selon le visuel fourni
 * 
 * Mise à jour avec les icônes qui correspondent à celles dans voila.PNG:
 * - Particulier: icône Home (maison)
 * - Professionnel: icône Briefcase (mallette)
 * - Collectivité: icône LandPlot (terrain)
 */
export function ClientTypeCards({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (value: ClientType) => void;
  error?: string;
}) {
  const [selectedType, setSelectedType] = useState<ClientType>((value || "") as ClientType);

  useEffect(() => {
    if (value && (value === "particulier" || value === "professionnel" || value === "collectivite")) {
      setSelectedType(value as ClientType);
    }
  }, [value]);

  const handleTypeSelect = (type: ClientType) => {
    setSelectedType(type);
    onChange(type);
  };

  return (
    <div className="client-type-selector" style={{margin: '8px 0'}}>
      <div style={{marginBottom: '12px'}}>
        <h3 style={{fontSize: '15px', fontWeight: 500, marginBottom: '4px'}}>
          Type de client <span style={{color: '#e11d48'}}>*</span>
        </h3>
        <p style={{fontSize: '13px', color: '#6b7280', marginBottom: '8px'}}>
          Sélectionnez le type de client pour votre demande de raccordement
        </p>
        <div style={{fontSize: '14px', fontWeight: 500, marginBottom: '8px'}}>
          Veuillez sélectionner votre profil
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        {/* Option Particulier */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '16px',
            backgroundColor: selectedType === "particulier" ? '#f0f7ff' : '#f5f9ff',
            border: `1px solid ${selectedType === "particulier" ? '#3b82f6' : '#e1e9ff'}`,
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => handleTypeSelect("particulier")}
        >
          <div style={{marginRight: '14px', color: '#3b82f6', marginTop: '2px'}}>
            <Home size={20} />
          </div>
          <div>
            <h4 style={{fontSize: '15px', fontWeight: 500, color: '#1e40af', marginBottom: '4px'}}>
              Particulier
            </h4>
            <p style={{fontSize: '13px', color: '#6b7280', lineHeight: 1.3, margin: 0}}>
              Je suis un particulier et je souhaite un raccordement pour ma maison
            </p>
          </div>
        </div>

        {/* Option Professionnel */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '16px',
            backgroundColor: selectedType === "professionnel" ? '#f0f7ff' : '#f5f9ff',
            border: `1px solid ${selectedType === "professionnel" ? '#3b82f6' : '#e1e9ff'}`,
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => handleTypeSelect("professionnel")}
        >
          <div style={{marginRight: '14px', color: '#3b82f6', marginTop: '2px'}}>
            <Briefcase size={20} />
          </div>
          <div>
            <h4 style={{fontSize: '15px', fontWeight: 500, color: '#1e40af', marginBottom: '4px'}}>
              Professionnel
            </h4>
            <p style={{fontSize: '13px', color: '#6b7280', lineHeight: 1.3, margin: 0}}>
              Je suis une entreprise qui a besoin d'un raccordement
            </p>
          </div>
        </div>

        {/* Option Collectivité */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '16px',
            backgroundColor: selectedType === "collectivite" ? '#f0f7ff' : '#f5f9ff',
            border: `1px solid ${selectedType === "collectivite" ? '#3b82f6' : '#e1e9ff'}`,
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => handleTypeSelect("collectivite")}
        >
          <div style={{marginRight: '14px', color: '#3b82f6', marginTop: '2px'}}>
            <LandPlot size={20} />
          </div>
          <div>
            <h4 style={{fontSize: '15px', fontWeight: 500, color: '#1e40af', marginBottom: '4px'}}>
              Collectivité
            </h4>
            <p style={{fontSize: '13px', color: '#6b7280', lineHeight: 1.3, margin: 0}}>
              Je représente une collectivité territoriale
            </p>
          </div>
        </div>
      </div>

      {error && <p style={{fontSize: '13px', color: '#e11d48', marginTop: '6px'}}>{error}</p>}
    </div>
  );
}