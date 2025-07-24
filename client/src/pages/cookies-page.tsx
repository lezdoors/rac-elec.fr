import Layout from "@/components/layout";

export default function CookiesPage() {
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
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Politique des Cookies</h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">1. Qu'est-ce qu'un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. Les cookies sont largement utilisés pour faire fonctionner les sites web ou les rendre plus efficaces, ainsi que pour fournir des informations aux propriétaires du site.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">2. Comment utilisons-nous les cookies ?</h2>
              <p>
                Nous utilisons différents types de cookies pour les raisons suivantes :
              </p>
              
              <h3 className="text-lg font-medium text-blue-600 mt-6 mb-3">Cookies strictement nécessaires</h3>
              <p>
                Ces cookies sont essentiels pour vous permettre de naviguer sur notre site et d'utiliser ses fonctionnalités. Sans ces cookies, certains services que vous avez demandés ne peuvent pas être fournis.
              </p>
              
              <h3 className="text-lg font-medium text-blue-600 mt-6 mb-3">Cookies de performance</h3>
              <p>
                Ces cookies recueillent des informations sur la façon dont les visiteurs utilisent notre site, par exemple, quelles pages ils visitent le plus souvent et s'ils reçoivent des messages d'erreur. Ces cookies ne collectent pas d'informations qui identifient un visiteur. Toutes les informations que ces cookies collectent sont agrégées et donc anonymes.
              </p>
              
              <h3 className="text-lg font-medium text-blue-600 mt-6 mb-3">Cookies de fonctionnalité</h3>
              <p>
                Ces cookies permettent au site de se souvenir des choix que vous faites (comme votre nom d'utilisateur ou la langue que vous utilisez) et de fournir des fonctionnalités améliorées et plus personnelles.
              </p>
              
              <h3 className="text-lg font-medium text-blue-600 mt-6 mb-3">Cookies de ciblage ou publicitaires</h3>
              <p>
                Ces cookies sont utilisés pour diffuser des publicités plus pertinentes pour vous et vos intérêts. Ils sont également utilisés pour limiter le nombre de fois que vous voyez une publicité ainsi que pour aider à mesurer l'efficacité des campagnes publicitaires.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">3. Liste des cookies que nous utilisons</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 mt-2 mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Nom du cookie</th>
                      <th className="py-2 px-4 border-b text-left">Finalité</th>
                      <th className="py-2 px-4 border-b text-left">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b">session_id</td>
                      <td className="py-2 px-4 border-b">Maintient votre session active</td>
                      <td className="py-2 px-4 border-b">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b">cookie_consent</td>
                      <td className="py-2 px-4 border-b">Enregistre vos préférences concernant les cookies</td>
                      <td className="py-2 px-4 border-b">1 an</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b">_ga</td>
                      <td className="py-2 px-4 border-b">Utilisé par Google Analytics pour distinguer les utilisateurs</td>
                      <td className="py-2 px-4 border-b">2 ans</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">4. Notre hébergeur</h2>
              <p>
                Le site raccordement-elec.fr est hébergé par MochaHost (MochaHost LLC, 7365 Carnelian St. Suite 203, Rancho Cucamonga, CA 91730, États-Unis).
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">5. Comment gérer les cookies ?</h2>
              <p>
                Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. Vous pouvez supprimer tous les cookies qui sont déjà sur votre ordinateur et vous pouvez configurer la plupart des navigateurs pour les empêcher d'être placés. Mais si vous faites cela, vous devrez peut-être ajuster manuellement certaines préférences chaque fois que vous visitez un site, et certains services et fonctionnalités peuvent ne pas fonctionner.
              </p>
              <p>
                Pour plus d'informations sur la gestion des cookies, veuillez consulter les préférences de votre navigateur ou les sites web suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 mb-4">
                <li><a href="/cookies" className="text-blue-600 hover:underline">Guide de gestion des cookies</a></li>
                <li><a href="/confidentialite" className="text-blue-600 hover:underline">Politique de confidentialité</a></li>
              </ul>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">5. Modifications de notre politique de cookies</h2>
              <p>
                Toute modification de notre politique de cookies sera publiée sur cette page et, si nécessaire, signalée sur notre page d'accueil.
              </p>
              
              <h2 className="text-xl font-semibold text-blue-700 mt-8 mb-4">6. Nous contacter</h2>
              <p>
                Si vous avez des questions concernant notre politique de cookies, veuillez nous contacter à l'adresse suivante : contact@raccordement-elec.fr ou par téléphone au +33 (0) 9 70 70 95 70.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}