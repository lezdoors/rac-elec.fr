import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClientCertificateProps {
  clientId: number;
  referenceNumber: string;
  showTitle?: boolean;
}

export function ClientCertificate({
  clientId,
  referenceNumber,
  showTitle = false,
}: ClientCertificateProps) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  
  // Récupérer le certificat
  const {
    data: certificateUrl,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [`/api/certificates/${referenceNumber}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/certificates/${referenceNumber}`);
      if (!res.ok) {
        if (res.status === 404) {
          return null; // Pas d'erreur, juste pas de certificat
        }
        throw new Error("Erreur lors de la récupération du certificat");
      }
      const data = await res.json();
      return data.url;
    },
  });
  
  // Générer un nouveau certificat
  const handleGenerateCertificate = async () => {
    setDownloading(true);
    try {
      const res = await apiRequest("POST", `/api/certificates/${referenceNumber}/generate`, {});
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la génération du certificat");
      }
      
      const data = await res.json();
      
      // Forcer un rafraîchissement de la requête pour obtenir la nouvelle URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.open(data.url, "_blank");
      
      toast({
        title: "Certificat généré",
        description: "Le certificat a été généré avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };
  
  // Télécharger le certificat existant
  const handleDownloadCertificate = () => {
    if (!certificateUrl) return;
    
    setDownloading(true);
    window.open(certificateUrl, "_blank");
    
    setTimeout(() => {
      setDownloading(false);
    }, 1000);
  };
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Certificat de demande
            </CardTitle>
            <CardDescription>
              Certificat attestant la demande et le paiement
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-muted-foreground">
            Vérification du certificat...
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Affichage en cas d'erreur
  if (isError) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Certificat de demande
            </CardTitle>
            <CardDescription>
              Certificat attestant la demande et le paiement
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
          <p className="text-muted-foreground mb-2">
            Une erreur est survenue lors de la récupération du certificat
          </p>
          <p className="text-sm text-red-500">{error instanceof Error ? error.message : "Erreur inconnue"}</p>
        </CardContent>
      </Card>
    );
  }
  
  // Si pas de certificat disponible
  if (!certificateUrl) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Certificat de demande
            </CardTitle>
            <CardDescription>
              Certificat attestant la demande et le paiement
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="pt-6">
          <div className="text-center py-6 border border-dashed rounded-lg">
            <LockKeyhole className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Certificat non disponible
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Aucun certificat n'a encore été généré pour cette demande. Les certificats sont générés après validation du paiement.
            </p>
            <Button
              onClick={handleGenerateCertificate}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Générer le certificat
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Affichage du certificat existant
  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Certificat de demande
          </CardTitle>
          <CardDescription>
            Certificat attestant la demande et le paiement
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md mx-auto border rounded-md overflow-hidden mb-6">
            <div className="bg-blue-50 p-3 flex items-center border-b">
              <ShieldCheck className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">Certificat de demande #{referenceNumber}</span>
            </div>
            <div className="p-4 flex flex-col items-center">
              <FileText className="h-24 w-24 text-blue-600 mb-2" />
              <p className="text-center mb-4">
                Ce certificat atteste officiellement de la demande de raccordement électrique et du paiement associé. Il peut être utilisé comme preuve en cas de litige.
              </p>
              
              <div className="w-full mt-4 space-y-3">
                <div className="flex justify-between border-t border-dashed pt-3">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">PDF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sécurité:</span>
                  <span className="font-medium">Horodaté et sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleDownloadCertificate}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Télécharger le certificat
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}