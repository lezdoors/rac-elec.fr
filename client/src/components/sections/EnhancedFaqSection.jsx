import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export const EnhancedFaqSection = () => {
  return (
    <section id="faq-raccordement" className="py-20 bg-gradient-to-br from-indigo-950 to-blue-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-blue-800/60 text-blue-200 mb-4">
            <span className="text-sm font-medium">Questions & Réponses</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Questions fréquentes sur le <span className="text-blue-300">raccordement électrique Enedis</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Toutes les informations essentielles pour votre raccordement au réseau électrique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Question 1 - Raccordement maison neuve */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-start">
              <span className="bg-blue-700/70 text-white text-xs font-medium mr-3 px-2 py-1 rounded flex-shrink-0 mt-1">POPULAIRE</span>
              <span>Raccordement Enedis maison neuve</span>
            </h3>
            <div className="text-blue-100 text-base">
              <p>Pour raccorder une maison neuve au réseau Enedis, vous devez disposer :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>D'un permis de construire valide</li>
                <li>Des plans de situation et de masse de votre construction</li>
                <li>De la puissance électrique souhaitée (monophasé ou triphasé)</li>
                <li>D'un certificat Consuel pour l'installation intérieure</li>
              </ul>
              <p className="mt-2">Notre formulaire en ligne facilite la démarche en vous aidant à réunir ces documents et en optimisant votre demande pour obtenir un raccordement électrique conforme aux normes actuelles.</p>
            </div>
          </div>
          
          {/* Question 2 - Raccordement maison ancienne */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3">
              Raccordement Enedis maison ancienne
            </h3>
            <div className="text-blue-100 text-base">
              <p>Le raccordement d'une maison ancienne peut nécessiter :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Une mise aux normes de l'installation électrique</li>
                <li>Un renforcement de puissance si nécessaire</li>
                <li>L'installation d'un compteur Linky communicant</li>
              </ul>
              <p className="mt-2">Pour une maison existante, le processus est généralement plus rapide qu'une construction neuve. Notre service vous guide pour accélérer le raccordement de votre maison ancienne et assurer sa conformité aux normes actuelles.</p>
            </div>
          </div>
          
          {/* Question 3 - Changement compteur Linky */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3">
              Changement de compteur Linky
            </h3>
            <div className="text-blue-100 text-base">
              <p>Le compteur Linky est désormais standard pour tous les raccordements :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Installation gratuite dans le cadre du déploiement national</li>
                <li>Remplacement sans intervention sur l'installation intérieure</li>
                <li>Lecture à distance et facturation sur consommation réelle</li>
                <li>Modifications tarifaires et de puissance réalisables à distance</li>
              </ul>
              <p className="mt-2">Ce compteur intelligent facilite le suivi de votre consommation et permet diverses opérations sans déplacement d'un technicien.</p>
            </div>
          </div>
          
          {/* Question 4 - Certificat Consuel */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3">
              Le certificat Consuel et son prix
            </h3>
            <div className="text-blue-100 text-base">
              <p>Le Consuel atteste de la conformité de votre installation électrique :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Prix : entre 120€ et 180€ selon le type d'installation</li>
                <li>Délivré après inspection par un organisme agréé</li>
                <li>Indispensable pour toute nouvelle construction</li>
                <li>Obligatoire avant tout raccordement définitif au réseau</li>
              </ul>
              <p className="mt-2">Notre service vous guide dans les démarches pour l'obtention de ce document essentiel, en vérifiant que votre installation respecte les normes NF C 15-100.</p>
            </div>
          </div>
          
          {/* Question 5 - Qui fait la demande */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3">
              Qui doit faire la demande de raccordement auprès d'Enedis ?
            </h3>
            <div className="text-blue-100 text-base">
              <p>La demande de raccordement peut être effectuée par :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Le propriétaire du logement</li>
                <li>Un tiers mandaté (architecte, constructeur, électricien)</li>
                <li>Un service d'accompagnement comme le nôtre</li>
              </ul>
              <p className="mt-2">En passant par notre service, vous bénéficiez d'un intermédiaire expérimenté qui optimise votre dossier et accélère le traitement par Enedis.</p>
            </div>
          </div>
          
          {/* Question 6 - Définition raccordement */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3">
              Qu'est-ce que le raccordement à l'électricité ?
            </h3>
            <div className="text-blue-100 text-base">
              <p>Le raccordement électrique est l'opération qui relie votre habitation au réseau de distribution d'électricité géré par Enedis. Il comprend :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>L'installation de la ligne électrique jusqu'à votre terrain</li>
                <li>La pose du compteur électrique</li>
                <li>Le raccordement au disjoncteur de branchement</li>
              </ul>
              <p className="mt-2">Cette étape est indispensable pour pouvoir souscrire un contrat avec un fournisseur d'électricité et alimenter votre logement en énergie.</p>
            </div>
          </div>
          
          {/* Question 7 - Procédure détaillée */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3">
              Comment déposer une demande de raccordement auprès d'Enedis ?
            </h3>
            <div className="text-blue-100 text-base">
              <p>Pour déposer une demande de raccordement efficacement :</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Utilisez notre formulaire en ligne spécialement conçu</li>
                <li>Fournissez les documents techniques requis (plans, permis)</li>
                <li>Répondez aux questions sur votre projet et installation</li>
                <li>Validez votre demande après vérification complète</li>
              </ol>
              <p className="mt-2">Notre solution vous fait gagner du temps en vérifiant chaque élément de votre dossier avant transmission à Enedis, réduisant les risques de rejet.</p>
            </div>
          </div>
          
          {/* Question 8 - Coûts */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3">
              Quel est le coût d'un raccordement électrique Enedis ?
            </h3>
            <div className="text-blue-100 text-base">
              <p>Le coût d'un raccordement électrique Enedis dépend de :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Raccordement simple sans extension : 1000€ à 1500€</li>
                <li>Avec extension réseau : 3000€ à 8000€ selon la distance</li>
                <li>Facteurs de prix : puissance demandée, distance au réseau, type d'installation</li>
              </ul>
              <p className="mt-2">Notre service vous accompagne dans l'optimisation de votre demande pour limiter les coûts et vous explique les détails du devis Enedis.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/faq" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <span>Consulter toutes les questions sur le raccordement Enedis</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFaqSection;