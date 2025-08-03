import Layout from "@/components/layout";

export default function ConfidentialitePage() {
  return (
    <Layout>
      <div id="top" className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
            {/* Filigrane Protectassur Ltd */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <p className="text-[150px] font-black text-gray-400/25 -rotate-90 transform">
                Protectassur Ltd
              </p>
            </div>
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Politique de Confidentialité</h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">1. Introduction</h2>
              <p>
                Portail-Electricite.com s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web et nos services.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">2. Informations que nous collectons</h2>
              <p>
                Nous collectons les informations suivantes lorsque vous utilisez notre service :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Informations personnelles (nom, prénom, adresse, numéro de téléphone, email)</li>
                <li>Informations techniques (adresse du site de raccordement, puissance souhaitée)</li>
                <li>Informations de paiement (traitées de manière sécurisée par notre prestataire de paiement)</li>
                <li>Données de navigation (cookies, adresse IP, type de navigateur)</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">3. Utilisation des informations</h2>
              <p>
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Traiter votre demande de raccordement électrique</li>
                <li>Vous contacter concernant votre demande</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
                <li>Vous envoyer des informations pertinentes avec votre consentement</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">4. Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Vous pouvez demander la suppression de vos données en nous contactant.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">5. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès non autorisé, altération, divulgation ou destruction.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">6. Partage des informations</h2>
              <p>
                Nous ne vendons jamais vos informations personnelles. Nous ne partageons vos informations qu'avec les parties suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Enedis et autres fournisseurs d'énergie nécessaires au traitement de votre demande</li>
                <li>Prestataires de services qui nous aident à exploiter notre site et à fournir nos services</li>
                <li>Autorités publiques lorsque la loi l'exige</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">7. Consentements dans le formulaire</h2>
              <p>
                Dans notre formulaire de demande de raccordement, nous recueillons plusieurs consentements via des cases à cocher. Voici comment nous traitons ces données :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li><strong>Acceptation des CGU et politique de confidentialité</strong> : Ce consentement obligatoire est enregistré avec horodatage comme preuve de votre accord.</li>
                <li><strong>Mandat pour effectuer les démarches</strong> : Ce consentement est transmis à Enedis comme preuve de votre autorisation à agir en votre nom.</li>
                <li><strong>Confirmation de l'exactitude des informations</strong> : Ce consentement est conservé avec votre dossier comme attestation de la véracité des informations.</li>
                <li><strong>Consentement marketing</strong> : Si vous cochez cette case optionnelle, nous utiliserons votre email pour vous envoyer des informations commerciales. Vous pouvez retirer ce consentement à tout moment en cliquant sur le lien de désabonnement présent dans nos emails.</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">8. Vos droits</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement (droit à l'oubli)</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">9. Modifications de la politique de confidentialité</h2>
              <p>
                Nous pouvons modifier cette politique de confidentialité de temps à autre. Les modifications prendront effet dès leur publication sur cette page.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">10. Nous contacter</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité, veuillez nous contacter à l'adresse suivante : contact@portail-electricite.com ou par téléphone au +33 (0) 9 70 70 95 70.
              </p>
              
              <div className="text-sm text-gray-500 mt-12 text-center italic">
                Portail-Electricite.com n'est pas affilié à Enedis. Enedis est une marque déposée.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}