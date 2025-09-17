import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CadastreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CadastreModal({ open, onOpenChange }: CadastreModalProps) {
  const handleSearch = () => {
    window.open('https://www.cadastre.gouv.fr', '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-5">
        <DialogHeader>
          <DialogTitle>Recherchez votre parcelle cadastrale</DialogTitle>
          <DialogDescription>
            Trouvez facilement les informations cadastrales de votre terrain
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse du terrain</Label>
            <Input
              id="address"
              placeholder="Ex: 123 rue de la République, 75001 Paris"
              className="w-full"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSearch} className="bg-[#0072CE] hover:bg-[#005bb5]">
            Rechercher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}