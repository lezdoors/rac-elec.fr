import React from 'react';
import { User, Building, Home, Briefcase, LandPlot } from 'lucide-react';

type ClientType = 'particulier' | 'professionnel' | 'collectivite';

interface ClientTypeSelectorProps {
  value: string;
  onChange: (value: ClientType) => void;
  error?: string;
}

/**
 * Composant pour sélectionner le type de client
 * Version 3.0 - Implémentation exacte selon la capture d'écran voila.PNG
 */
export function ClientTypeSelector({ value, onChange, error }: ClientTypeSelectorProps) {
  const selected = (value || 'particulier') as ClientType;

  const handleSelect = (type: ClientType) => {
    onChange(type);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-2 text-sm text-blue-700 font-bold">
        <User className="w-4 h-4" />
        <span className="text-lg">Type de client <span className="text-red-500">*</span></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Option Particulier - Exactement comme dans voila.PNG */}
        <div 
          className={`
            border rounded-md cursor-pointer transition-all
            ${selected === 'particulier' 
              ? 'bg-blue-50 border-blue-600' 
              : 'bg-white border-gray-200 hover:border-blue-200'}
          `}
          onClick={() => handleSelect('particulier')}
        >
          <div className="flex p-3 items-center">
            {/* Bouton radio */}
            <input
              type="radio"
              name="clientType"
              checked={selected === 'particulier'}
              onChange={() => handleSelect('particulier')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
            />
            
            {/* Icône - Maison comme dans voila.PNG */}
            <div className="text-blue-600 mr-2">
              <Home className="h-5 w-5" />
            </div>
            
            {/* Texte */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">Particulier</span>
              <span className="text-xs text-gray-500">Logement personnel</span>
            </div>
          </div>
        </div>
        
        {/* Option Professionnel - Exactement comme dans voila.PNG */}
        <div 
          className={`
            border rounded-md cursor-pointer transition-all
            ${selected === 'professionnel' 
              ? 'bg-blue-50 border-blue-600' 
              : 'bg-white border-gray-200 hover:border-blue-200'}
          `}
          onClick={() => handleSelect('professionnel')}
        >
          <div className="flex p-3 items-center">
            {/* Bouton radio */}
            <input
              type="radio"
              name="clientType"
              checked={selected === 'professionnel'}
              onChange={() => handleSelect('professionnel')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
            />
            
            {/* Icône - Briefcase comme dans voila.PNG */}
            <div className="text-blue-600 mr-2">
              <Briefcase className="h-5 w-5" />
            </div>
            
            {/* Texte */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">Professionnel</span>
              <span className="text-xs text-gray-500">Entreprise, commerce</span>
            </div>
          </div>
        </div>
        
        {/* Option Collectivité - Exactement comme dans voila.PNG */}
        <div 
          className={`
            border rounded-md cursor-pointer transition-all
            ${selected === 'collectivite' 
              ? 'bg-blue-50 border-blue-600' 
              : 'bg-white border-gray-200 hover:border-blue-200'}
          `}
          onClick={() => handleSelect('collectivite')}
        >
          <div className="flex p-3 items-center">
            {/* Bouton radio */}
            <input
              type="radio"
              name="clientType"
              checked={selected === 'collectivite'}
              onChange={() => handleSelect('collectivite')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
            />
            
            {/* Icône - Bâtiment public comme dans voila.PNG */}
            <div className="text-blue-600 mr-2">
              <LandPlot className="h-5 w-5" />
            </div>
            
            {/* Texte */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">Collectivité</span>
              <span className="text-xs text-gray-500">Mairie, établissement public</span>
            </div>
          </div>
        </div>
      </div>
      
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}