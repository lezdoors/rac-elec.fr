import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const logoOptions = [
  {
    id: 'current',
    name: 'Logo Actuel',
    file: '/logo-portail-raccordement.svg',
    description: 'Design simple et compact'
  },
  {
    id: 'option1',
    name: 'Option 1 - Professionnel',
    file: '/logo-option-1.svg',
    description: 'Design avec fond dégradé et icône éclair bold'
  },
  {
    id: 'option2',
    name: 'Option 2 - Moderne',
    file: '/logo-option-2.svg',
    description: 'Style minimaliste avec cercle et gradient'
  },
  {
    id: 'option3',
    name: 'Option 3 - Premium',
    file: '/logo-option-3.svg',
    description: 'Design premium avec ombre et fond blanc'
  },
  {
    id: 'option4',
    name: 'Option 4 - Compact',
    file: '/logo-option-4.svg',
    description: 'Version compacte avec badge ENEDIS'
  },
  {
    id: 'option5',
    name: 'Option 5 - Corporate',
    file: '/logo-option-5.svg',
    description: 'Style corporatif avec éléments géométriques'
  }
];

export default function LogoTest() {
  const [selectedLogo, setSelectedLogo] = useState('current');

  const handleLogoSelect = async (logoId: string, logoFile: string) => {
    setSelectedLogo(logoId);
    
    // Update the current logo file
    try {
      const response = await fetch('/api/update-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoFile })
      });
      
      if (response.ok) {
        // Reload the page to see the new logo
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du logo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sélection du Logo - Portail Raccordement
            </h1>
            <p className="text-gray-600">
              Choisissez le logo qui convient le mieux à votre image de marque
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {logoOptions.map((logo) => (
              <div
                key={logo.id}
                className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-200 ${
                  selectedLogo === logo.id 
                    ? 'ring-2 ring-blue-500 shadow-xl' 
                    : 'hover:shadow-xl'
                }`}
              >
                {/* Logo preview */}
                <div className="bg-gray-50 rounded-lg p-6 mb-4 flex items-center justify-center min-h-[120px]">
                  <img
                    src={logo.file}
                    alt={logo.name}
                    className="max-w-full h-auto object-contain"
                    style={{ maxHeight: '80px' }}
                  />
                </div>

                {/* Logo info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {logo.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {logo.description}
                  </p>
                  
                  <Button
                    onClick={() => handleLogoSelect(logo.id, logo.file)}
                    className={`w-full ${
                      selectedLogo === logo.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {selectedLogo === logo.id ? 'Logo Sélectionné' : 'Sélectionner'}
                  </Button>
                </div>

                {/* Preview dans différents contextes */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Aperçu en-tête :</p>
                  <div className="bg-white border rounded p-2 flex items-center">
                    <img
                      src={logo.file}
                      alt="Aperçu en-tête"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Comment utiliser cette page :
            </h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Examinez chaque option de logo ci-dessus</li>
              <li>• Cliquez sur "Sélectionner" pour le logo de votre choix</li>
              <li>• Le logo sera automatiquement mis à jour sur tout le site</li>
              <li>• Vous pouvez changer de logo à tout moment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}