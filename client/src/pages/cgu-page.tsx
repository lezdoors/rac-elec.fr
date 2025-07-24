import Layout from "@/components/layout";

export default function CGUPage() {
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
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Conditions Générales d'Utilisation</h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant ce site web, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation, tous les termes et conditions applicables, ainsi que toutes les lois et réglementations applicables. Si vous n'acceptez pas ces conditions, vous êtes prié de ne pas utiliser ce site.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">2. Description du service</h2>
              <p>
                Raccordement.net est un service qui facilite les demandes de raccordement électrique auprès d'Enedis et autres fournisseurs d'énergie. Nous vous aidons à préparer et à soumettre votre dossier de raccordement, mais nous n'effectuons pas les travaux de raccordement nous-mêmes.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">3. Utilisation du site</h2>
              <p>
                Vous acceptez d'utiliser ce site uniquement à des fins légales et d'une manière qui ne viole pas les droits de, ou ne restreint pas ou n'entrave pas l'utilisation et la jouissance de ce site par toute tierce partie.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">4. Propriété intellectuelle</h2>
              <p>
                Tout le contenu inclus dans ce site, tel que texte, graphiques, logos, images, clips audio, téléchargements numériques, compilations de données et logiciels, est la propriété de Raccordement.net ou de ses fournisseurs de contenu et est protégé par les lois françaises et internationales sur la propriété intellectuelle.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">5. Tarifs et paiements</h2>
              <p>
                Les tarifs de nos services sont clairement indiqués sur notre site. Le paiement est requis pour initier le traitement de votre demande. Nous utilisons des prestataires de paiement sécurisés pour traiter vos transactions.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">6. Limitation de responsabilité</h2>
              <p>
                Raccordement.net ne peut garantir l'approbation de votre demande de raccordement par Enedis ou tout autre fournisseur d'énergie. Notre service consiste à vous aider à préparer votre dossier et à le soumettre dans les meilleures conditions.
              </p>
              <p>
                Raccordement.net ne sera pas responsable des retards dans le traitement des demandes qui sont dus à des circonstances indépendantes de notre volonté, y compris mais sans s'y limiter, les retards causés par Enedis ou d'autres parties impliquées dans le processus de raccordement.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">7. Exactitude des informations</h2>
              <p>
                Vous êtes responsable de l'exactitude des informations que vous fournissez lors de la soumission de votre demande. Des informations inexactes peuvent entraîner des retards ou le rejet de votre demande de raccordement.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">8. Résolution des litiges</h2>
              <p>
                En cas de litige concernant nos services, nous vous encourageons à nous contacter directement pour trouver une solution amiable. Tout litige qui ne pourrait être résolu à l'amiable sera soumis aux tribunaux compétents de Paris, France.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">9. Cases à cocher et consentements</h2>
              <p>
                Lors de l'utilisation de notre formulaire de demande de raccordement, nous vous demandons de donner votre consentement à travers plusieurs cases à cocher. Voici le détail de ces consentements :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li><strong>Acceptation des CGU et politique de confidentialité</strong> : En cochant cette case, vous confirmez avoir lu, compris et accepté l'intégralité de nos Conditions Générales d'Utilisation et notre Politique de Confidentialité.</li>
                <li><strong>Mandat pour effectuer les démarches</strong> : En cochant cette case, vous nous autorisez à effectuer les démarches nécessaires auprès d'Enedis en votre nom pour le traitement de votre demande de raccordement.</li>
                <li><strong>Confirmation de l'exactitude des informations</strong> : En cochant cette case, vous confirmez que toutes les informations fournies dans le formulaire sont exactes, complètes et à jour.</li>
                <li><strong>Consentement à recevoir des communications</strong> : Cette case optionnelle vous permet de nous autoriser à vous envoyer des informations sur votre dossier et des offres promotionnelles par email.</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">10. Modifications des conditions</h2>
              <p>
                Nous nous réservons le droit de modifier ces Conditions Générales d'Utilisation à tout moment. Les modifications prendront effet immédiatement après leur publication sur ce site. Il est de votre responsabilité de consulter régulièrement ces conditions.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">11. Contact</h2>
              <p>
                Pour toute question concernant ces Conditions Générales d'Utilisation, veuillez nous contacter à l'adresse suivante : contact@raccordement-elec.fr ou par téléphone au +33 (0) 9 70 70 95 70.
              </p>
              
              <div className="text-sm text-gray-500 mt-12 text-center italic">
                Raccordement-Elec.fr n'est pas affilié à Enedis. Enedis est une marque déposée.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}