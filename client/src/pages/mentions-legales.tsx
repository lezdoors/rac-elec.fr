import React from "react";
import Layout from "@/components/layout";
import { Helmet } from "react-helmet";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentionsLegalesPage() {
  return (
    <Layout>
      <div id="top" className="min-h-screen bg-gray-50 py-12">
        <Helmet>
          <title>Mentions Légales | Raccordement-Connect.com</title>
          <meta 
            name="description" 
            content="Mentions légales de Raccordement-Connect.com, service d'accompagnement pour vos démarches de raccordement électrique." 
          />
          <link rel="canonical" href="https://www.raccordement-connect.com/mentions-legales" />
        </Helmet>

        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
            {/* Filigrane Protectassur Ltd */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <p className="text-[150px] font-black text-gray-400/25 -rotate-90 transform">
                Protectassur Ltd
              </p>
            </div>
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Mentions Légales</h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">1. Éditeur du site</h2>
              <p>
                Le site demande-raccordement.fr est édité par une entreprise spécialisée dans les démarches administratives liées au raccordement électrique.
                <br />Email : contact@demande-raccordement.fr
              </p>
              <p>
                Protectassur Ltd – 61 Bridge Street, Kington, HR5 3DJ, Royaume-Uni – N° d'immatriculation 14112679
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">2. Directeur de la publication</h2>
              <p>
                Le directeur de la publication est le représentant légal de l'entreprise.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">3. Hébergement du site</h2>
              <p>
                Le site demande-raccordement.fr est hébergé par :
                <br />Nom de l'hébergeur : MochaHost
                <br />Adresse : MochaHost LLC, 7365 Carnelian St. Suite 203, Rancho Cucamonga, CA 91730, États-Unis
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">4. Propriété intellectuelle</h2>
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique ou autre est formellement interdite sauf autorisation expresse.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">5. Données personnelles</h2>
              <p>
                Conformément aux dispositions de la loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, vous disposez d'un droit d'accès, de modification, de rectification et de suppression des données qui vous concernent.
              </p>
              <p>
                Pour demander une modification, rectification ou suppression des données vous concernant, il vous suffit d'envoyer un courrier électronique à l'adresse contact@demande-raccordement.fr.
              </p>
              <p>
                Pour plus d'informations concernant la gestion de vos données personnelles, veuillez consulter notre <a href="/confidentialite" className="text-blue-600 hover:text-blue-800 underline">Politique de Confidentialité</a>.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">6. Cookies</h2>
              <p>
                Le site demande-raccordement.fr utilise des cookies pour améliorer l'expérience utilisateur. Pour plus d'informations sur notre utilisation des cookies, veuillez consulter notre <a href="/cookies" className="text-blue-600 hover:text-blue-800 underline">Politique des Cookies</a>.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">7. Limitation de responsabilité</h2>
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement mis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes. Si vous constatez une erreur ou ce qui peut être une inexactitude, défectuosité ou lacune, merci de bien vouloir le signaler par email à contact@demande-raccordement.fr.
              </p>
              <p>
                Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres ressources présentes sur le réseau Internet ne sauraient engager notre responsabilité.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">8. Droit applicable et juridiction compétente</h2>
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">9. Contact</h2>
              <p>
                Pour toute question relative au site demande-raccordement.fr, vous pouvez nous contacter :
                <br />Par téléphone : +33 (0) 9 70 70 95 70
                <br />Par email : contact@demande-raccordement.fr
              </p>
              
              <div className="text-sm text-gray-500 mt-12 text-center italic">
                Raccordement-Connect.com n'est pas affilié à Enedis. Enedis est une marque déposée.
              </div>
            </div>
            
            {/* Bouton retour en haut */}
            <div className="mt-10 text-center">
              <a href="#top">
                <Button variant="outline" size="sm" className="rounded-full">
                  <ArrowUp className="h-4 w-4 mr-1" /> Retour en haut
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}