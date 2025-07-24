import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ArrowRight, Zap } from "lucide-react";
import Layout from "@/components/layout";

export default function PaiementTestPage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [, navigate] = useLocation();

  // Liste des références récentes pour faciliter les tests
  const recentReferences = [
    { ref: "REF-7857-902123", date: "01/05/2025", status: "En attente" },
    { ref: "REF-1553-897105", date: "30/04/2025", status: "En attente" },
    { ref: "REF-2839-591274", date: "29/04/2025", status: "En attente" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceNumber) {
      navigate(`/paiement/${referenceNumber}`);
    }
  };

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Page de test de paiement</h1>
          <p className="text-lg text-muted-foreground">
            Cette page permet de tester le nouveau système de paiement simplifié
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Accéder au paiement</CardTitle>
                <CardDescription>
                  Entrez une référence de demande existante ou utilisez un exemple
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Référence de la demande</Label>
                    <Input 
                      id="reference" 
                      placeholder="Format: REF-XXXX-XXXXXX" 
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Passer au paiement
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <p className="text-sm text-muted-foreground mb-4">
                  Cette page est uniquement destinée aux tests et à la démonstration.
                </p>
              </CardFooter>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Références récentes pour test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentReferences.map(item => (
                      <div 
                        key={item.ref}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-md hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setReferenceNumber(item.ref);
                          document.getElementById("reference")?.focus();
                        }}
                      >
                        <div>
                          <div className="font-medium">{item.ref}</div>
                          <div className="text-xs text-muted-foreground">{item.date}</div>
                        </div>
                        <div>
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Procédure de paiement simplifiée</CardTitle>
                <CardDescription>
                  Le nouveau parcours de paiement a été entièrement redessiné
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h3 className="text-md font-medium mb-1">Page de paiement unique</h3>
                      <p className="text-sm text-gray-600">
                        Toutes les informations de paiement sont recueillies sur une seule page
                        sans redirection complexe.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h3 className="text-md font-medium mb-1">Paiement par carte bancaire</h3>
                      <p className="text-sm text-gray-600">
                        Interface simplifiée qui se concentre uniquement sur le paiement par
                        carte bancaire, avec logos des principales cartes acceptées.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <h3 className="text-md font-medium mb-1">Confirmation immédiate</h3>
                      <p className="text-sm text-gray-600">
                        Page de confirmation de paiement avec état du paiement et prochaines
                        étapes clairement indiquées.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 w-full">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Tarif fixe</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Toutes les demandes de raccordement sont à un tarif unique de 129,80€ TTC
                    (108,17€ HT + 21,63€ TVA)
                  </p>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-4 flex justify-end">
              <Link href="/">
                <Button variant="outline" className="mr-2">
                  Retour à l'accueil
                </Button>
              </Link>
              <Link href="/payment-debug">
                <Button variant="secondary">
                  Page debug
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
