import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Link2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentLinksGeneratorProps {
  referenceNumber: string;
}

/**
 * Composant pour générer et afficher les liens de paiement multiple
 * pour une référence donnée avec le domaine demande-raccordement.fr
 */
export function PaymentLinksGenerator({ referenceNumber }: PaymentLinksGeneratorProps) {
  // Base de prix pour calculer les montants
  const baseAmount = 129.80;
  
  // Générer l'URL complète avec le domaine demande-raccordement.fr
  const generateUrl = (multiplier: number) => {
    return `https://www.raccordement-connect.com/paiement-multiple/${referenceNumber}/${multiplier}`;
  };
  
  // Fonction pour copier un lien dans le presse-papier
  const copyLink = (url: string, multiplier: number) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: 'Lien copié',
          description: `Le lien de paiement (x${multiplier}) a été copié dans le presse-papier.`,
        });
      })
      .catch(err => {
        console.error('Erreur lors de la copie du lien:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de copier le lien. Veuillez réessayer.',
          variant: 'destructive',
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          Liens de paiement majoré
        </CardTitle>
        <CardDescription>
          Liens de paiement avec montants majorés pour la référence <strong>{referenceNumber}</strong>.
          Partagez ces liens avec vos clients pour différents niveaux de service.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
          <p className="text-sm text-blue-700">
            Ces liens permettent aux clients d'effectuer des paiements avec différents multiplicateurs.
            Choisissez le montant approprié en fonction des services supplémentaires convenus.
          </p>
        </div>
        
        <div className="space-y-3">
          {[2, 3, 4, 5].map((multiplier) => {
            const url = generateUrl(multiplier);
            const amount = (baseAmount * multiplier).toFixed(2).replace('.', ',');
            
            return (
              <div key={multiplier} className="flex items-center justify-between p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">Paiement x{multiplier}</p>
                  <p className="text-sm text-gray-500 mt-1 truncate max-w-xs md:max-w-md">
                    {url}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    {amount}€
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyLink(url, multiplier)}
                  className="flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copier
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-gray-500">
          Les liens sont valables tant que la référence est active.
        </p>
      </CardFooter>
    </Card>
  );
}