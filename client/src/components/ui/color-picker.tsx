import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(value || '#1e40af');
  const inputRef = useRef<HTMLInputElement>(null);

  // Liste de couleurs prédéfinies pour un accès rapide
  const presetColors = [
    '#1e40af', // Bleu corporate (défaut)
    '#0ea5e9', // Bleu clair
    '#0f766e', // Bleu vert
    '#ef4444', // Rouge
    '#f97316', // Orange
    '#84cc16', // Vert
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Rose
    '#000000', // Noir
    '#71717a', // Gris
    '#d4d4d8', // Gris clair
  ];

  // Mettre à jour la couleur interne lorsque la valeur externe change
  useEffect(() => {
    if (value && value !== currentColor) {
      setCurrentColor(value);
    }
  }, [value]);

  // Appliquer la couleur et fermer le popover
  const applyColor = (color: string) => {
    setCurrentColor(color);
    onChange(color);
    setIsOpen(false);
  };

  // Gérer le changement de couleur via l'input
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-10 h-10 p-0 border-2" 
          style={{ backgroundColor: currentColor }}
          onClick={() => setIsOpen(true)}
        >
          <span className="sr-only">Choisir une couleur</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-color">Couleur courante</Label>
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded border" 
                style={{ backgroundColor: currentColor }}
              />
              <Input 
                id="current-color"
                ref={inputRef}
                type="text" 
                value={currentColor} 
                onChange={handleColorInputChange}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Couleurs prédéfinies</Label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-sm border ${currentColor === color ? 'ring-2 ring-offset-2 ring-offset-white ring-primary' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => applyColor(color)}
                  type="button"
                />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = '#1e40af';
                  applyColor('#1e40af');
                }
              }}
            >
              Réinitialiser
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                applyColor(currentColor);
              }}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
