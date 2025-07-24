import { User, Building, Home, Briefcase, LandPlot } from "lucide-react";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/lib/mobile-optimizations";
import { useState, useEffect } from "react";

// Définition du type pour assurer la cohérence
export type ClientType = "particulier" | "professionnel" | "collectivite";

interface ResponsiveClientTypeSelectProps {
  value: ClientType | string;
  onChange: (value: ClientType) => void;
  error?: string;
}

/**
 * Sélecteur de type de client réactif qui s'adapte aux écrans mobiles et de bureau
 */
export function ResponsiveClientTypeSelect({
  value,
  onChange,
  error
}: ResponsiveClientTypeSelectProps) {
  const isMobile = useIsMobile();
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    // Assurons-nous que la valeur est bien un des types attendus
    const validValue = (newValue === 'particulier' || newValue === 'professionnel' || newValue === 'collectivite') 
      ? newValue as ClientType
      : 'particulier' as ClientType;
      
    setLocalValue(validValue);
    onChange(validValue);
  };

  if (isMobile) {
    // Version mobile avec le design exact comme dans voila.PNG
    return (
      <div className="space-y-3" data-name="clientType">
        <div className="col-span-3">
          <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium">
            <User className="w-4 h-4" />
            <span>Type de client <span className="text-red-500">*</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Option Particulier - Style exact comme dans voila.PNG */}
          <div 
            className={`
              border rounded-md cursor-pointer transition-all
              ${localValue === 'particulier' 
                ? 'bg-blue-50 border-blue-600' 
                : 'bg-white border-gray-200 hover:border-blue-200'}
            `}
            onClick={() => handleChange('particulier')}
          >
            <div className="flex p-3 items-center">
              {/* Bouton radio */}
              <input
                type="radio"
                name="clientType"
                checked={localValue === 'particulier'}
                onChange={() => handleChange('particulier')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
              />
              
              {/* Icône */}
              <div className="text-blue-600 mr-2">
                <Home className="h-5 w-5" />
              </div>
              
              {/* Texte */}
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Particulier</span>
                <span className="text-xs text-gray-500">Logement personnel</span>
              </div>
            </div>
          </div>
          
          {/* Option Professionnel - Style exact comme dans voila.PNG */}
          <div 
            className={`
              border rounded-md cursor-pointer transition-all
              ${localValue === 'professionnel' 
                ? 'bg-blue-50 border-blue-600' 
                : 'bg-white border-gray-200 hover:border-blue-200'}
            `}
            onClick={() => handleChange('professionnel')}
          >
            <div className="flex p-3 items-center">
              {/* Bouton radio */}
              <input
                type="radio"
                name="clientType"
                checked={localValue === 'professionnel'}
                onChange={() => handleChange('professionnel')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
              />
              
              {/* Icône */}
              <div className="text-blue-600 mr-2">
                <Briefcase className="h-5 w-5" />
              </div>
              
              {/* Texte */}
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Professionnel</span>
                <span className="text-xs text-gray-500">Entreprise, commerce</span>
              </div>
            </div>
          </div>
          
          {/* Option Collectivité - Style exact comme dans voila.PNG */}
          <div 
            className={`
              border rounded-md cursor-pointer transition-all
              ${localValue === 'collectivite' 
                ? 'bg-blue-50 border-blue-600' 
                : 'bg-white border-gray-200 hover:border-blue-200'}
            `}
            onClick={() => handleChange('collectivite')}
          >
            <div className="flex p-3 items-center">
              {/* Bouton radio */}
              <input
                type="radio"
                name="clientType"
                checked={localValue === 'collectivite'}
                onChange={() => handleChange('collectivite')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
              />
              
              {/* Icône */}
              <div className="text-blue-600 mr-2">
                <LandPlot className="h-5 w-5" />
              </div>
              
              {/* Texte */}
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Collectivité</span>
                <span className="text-xs text-gray-500">Mairie, établissement public</span>
              </div>
            </div>
          </div>
        </div>
        
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // Version desktop: style exact comme dans voila.PNG
  return (
    <div className="w-full space-y-4" data-name="clientType">
      <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium">
        <User className="w-4 h-4" />
        <span>Type de client <span className="text-red-500">*</span></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Option Particulier - Style exact comme dans voila.PNG */}
        <div 
          className={`
            border rounded-md cursor-pointer transition-all
            ${localValue === 'particulier' 
              ? 'bg-blue-50 border-blue-600' 
              : 'bg-white border-gray-200 hover:border-blue-200'}
          `}
          onClick={() => handleChange('particulier')}
        >
          <div className="flex p-3 items-center">
            {/* Bouton radio */}
            <input
              type="radio"
              name="clientType"
              checked={localValue === 'particulier'}
              onChange={() => handleChange('particulier')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
            />
            
            {/* Icône */}
            <div className="text-blue-600 mr-2">
              <Home className="h-5 w-5" />
            </div>
            
            {/* Texte */}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">Particulier</span>
              <span className="text-xs text-gray-500">Logement personnel</span>
            </div>
          </div>
        </div>
        
        {/* Option Professionnel - Style exact comme dans voila.PNG */}
        <div 
          className={`
            border rounded-md cursor-pointer transition-all
            ${localValue === 'professionnel' 
              ? 'bg-blue-50 border-blue-600' 
              : 'bg-white border-gray-200 hover:border-blue-200'}
          `}
          onClick={() => handleChange('professionnel')}
        >
          <div className="flex p-3 items-center">
            {/* Bouton radio */}
            <input
              type="radio"
              name="clientType"
              checked={localValue === 'professionnel'}
              onChange={() => handleChange('professionnel')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
            />
            
            {/* Icône */}
            <div className="text-blue-600 mr-2">
              <Briefcase className="h-5 w-5" />
            </div>
            
            {/* Texte */}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">Professionnel</span>
              <span className="text-xs text-gray-500">Entreprise, commerce</span>
            </div>
          </div>
        </div>
        
        {/* Option Collectivité - Style exact comme dans voila.PNG */}
        <div 
          className={`
            border rounded-md cursor-pointer transition-all
            ${localValue === 'collectivite' 
              ? 'bg-blue-50 border-blue-600' 
              : 'bg-white border-gray-200 hover:border-blue-200'}
          `}
          onClick={() => handleChange('collectivite')}
        >
          <div className="flex p-3 items-center">
            {/* Bouton radio */}
            <input
              type="radio"
              name="clientType"
              checked={localValue === 'collectivite'}
              onChange={() => handleChange('collectivite')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
            />
            
            {/* Icône */}
            <div className="text-blue-600 mr-2">
              <LandPlot className="h-5 w-5" />
            </div>
            
            {/* Texte */}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">Collectivité</span>
              <span className="text-xs text-gray-500">Mairie, établissement public</span>
            </div>
          </div>
        </div>
      </div>
      
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/**
 * Wrapper FormField compatible pour le sélecteur responsive du type de client
 */
export function ResponsiveClientTypeField({ form, field }: any) {
  return (
    <FormItem className="space-y-2">
      <FormControl>
        <ResponsiveClientTypeSelect
          value={field.value}
          onChange={(value) => {
            field.onChange(value);
            // Assurons-nous que la valeur est toujours l'un des types valides
            form.setValue('clientType', value as ClientType);
          }}
          error={form.formState.errors.clientType?.message}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}