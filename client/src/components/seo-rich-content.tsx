import React from 'react';
import { ChevronRight, Zap, Bolt, CheckCircle, AlertCircle, Clock, HelpCircle, Home, Wrench } from 'lucide-react';

/**
 * Composant contenant du texte riche en mots-clés pour le SEO
 * Optimisé pour le référencement des pages liées au raccordement Enedis
 */
interface SeoRichContentProps {
  compactMode?: boolean;
}

export function SeoRichContent({ compactMode = false }: SeoRichContentProps) {
  if (compactMode) {
    return (
      <section className="py-6 bg-gray-50" id="information-raccordement">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 text-center md:text-left border-b border-gray-200 pb-3">
              Service de raccordement électrique Enedis en ligne
            </h2>
            
            {/* Processus mobile optimisé avec navigation verticale */}
            <div className="mb-6">
              {/* Version mobile - processus administratif simplifié */}
              <div className="block md:hidden">
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                    <h3 className="text-sm font-semibold text-gray-900">Processus de raccordement Enedis - 4 étapes</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {[
                      { title: "1. Demande en ligne", desc: "Formulaire simplifié 5 minutes" },
                      { title: "2. Études et devis", desc: "Analyse technique personnalisée" },
                      { title: "3. Intervention", desc: "Travaux qualifiés par Enedis" },
                      { title: "4. Mise en service", desc: "Activation compteur électrique" }
                    ].map((item, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Version desktop - tableau administratif */}
              <div className="hidden md:block">
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
                    <h3 className="text-base font-semibold text-gray-900">Étapes du processus de raccordement électrique Enedis</h3>
                  </div>
                  <div className="grid grid-cols-4 divide-x divide-gray-200">
                    {[
                      { title: "Demande en ligne", desc: "Formulaire simplifié 5 minutes", duration: "Immédiat" },
                      { title: "Études et devis", desc: "Analyse technique personnalisée", duration: "2-3 semaines" },
                      { title: "Intervention", desc: "Travaux qualifiés par Enedis", duration: "4-6 semaines" },
                      { title: "Mise en service", desc: "Activation compteur électrique", duration: "1-2 jours" }
                    ].map((item, index) => (
                      <div key={index} className="p-6 text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lg font-semibold text-gray-700">{index + 1}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{item.desc}</p>
                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          Délai : {item.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Types de raccordements - format administratif */}
            <div className="bg-white border border-gray-300 rounded-lg mb-6">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                <h3 className="text-base font-semibold text-gray-900">
                  Types de raccordements électriques Enedis
                </h3>
              </div>
              
              {/* Version mobile - liste administrative */}
              <div className="block md:hidden divide-y divide-gray-200">
                {[
                  { title: "Raccordement définitif Enedis", desc: "Maisons neuves et branchement électrique permanent", code: "DEF" },
                  { title: "Raccordement provisoire Enedis", desc: "Chantiers temporaires et événements ponctuels", code: "PROV" },
                  { title: "Modification de puissance Enedis", desc: "Adaptation et augmentation de puissance électrique", code: "MODIF" },
                  { title: "Production électrique Enedis", desc: "Panneaux solaires et autoconsommation énergétique", code: "PROD" }
                ].map((item, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                      </div>
                      <div className="ml-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Version desktop - tableau administratif */}
              <div className="hidden md:block">
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  {[
                    { title: "Raccordement définitif", desc: "Maisons neuves et branchement électrique", code: "DEF", type: "definitif" },
                    { title: "Raccordement provisoire", desc: "Chantiers et événements temporaires", code: "PROV", type: "provisoire" },
                    { title: "Modification puissance", desc: "Adaptation à vos besoins énergétiques", code: "MODIF", type: "modification" },
                    { title: "Solutions photovoltaïques", desc: "Production d'énergie solaire", code: "PROD", type: "production" }
                  ].map((item, index) => (
                    <a 
                      key={index} 
                      href={`/raccordement-enedis?type=${item.type}`}
                      className="block p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">{item.desc}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* CTA discret - Enedis raccordement */}
            <div className="mt-6 text-center">
              <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-600 mb-2">
                  Prêt pour votre raccordement électrique ?
                </p>
                <a 
                  href="/raccordement-enedis#formulaire-raccordement"
                  className="text-sm font-medium text-gray-800 hover:text-gray-900 underline decoration-gray-400 hover:decoration-gray-600"
                >
                  Formulaire raccordement Enedis →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50" id="information-raccordement">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Guide du raccordement électrique Enedis 2025 partout en France
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <h3 className="flex items-center text-xl font-semibold text-gray-800 mt-8 mb-4">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Qu'est-ce que le raccordement électrique Enedis?
            </h3>
            
            <p className="text-gray-700">
              Le <strong>raccordement électrique Enedis</strong> est l'opération qui consiste à relier une installation électrique (maison, appartement, local professionnel) au <strong>réseau public de distribution d'électricité</strong> géré par Enedis. 
              Ce processus comprend l'ensemble des travaux nécessaires pour permettre l'alimentation électrique d'un bâtiment, qu'il s'agisse d'une <strong>construction neuve</strong> ou d'une <strong>modification de raccordement existant</strong>.
            </p>
            
            <h3 className="flex items-center text-xl font-semibold text-gray-800 mt-8 mb-4">
              <Bolt className="h-5 w-5 mr-2 text-blue-600" />
              Types de raccordements électriques proposés
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-6">
              <a href="/raccordement-enedis?type=definitif" className="group">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-blue-900">
                      <path d="M20 10V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/>
                      <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/>
                      <path d="M12 12h.01"/>
                      <path d="M2 10h20"/>
                      <path d="M2 14h20"/>
                    </svg>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                      <Home className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-800">Raccordement définitif</h4>
                  </div>
                  <ul className="pl-2 space-y-1 text-gray-600 text-sm relative z-10">
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Maisons individuelles</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Locaux professionnels</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Bâtiments neufs</span>
                    </li>
                  </ul>
                </div>
              </a>
              
              <a href="/raccordement-enedis?type=provisoire" className="group">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-blue-900">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                      <Clock className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-800">Raccordement provisoire</h4>
                  </div>
                  <ul className="pl-2 space-y-1 text-gray-600 text-sm relative z-10">
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Chantiers de construction</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Événements temporaires</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>28 jours à 1 an</span>
                    </li>
                  </ul>
                </div>
              </a>
              
              <a href="/raccordement-enedis?type=modification" className="group">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-blue-900">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                      <Wrench className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-800">Modification raccordement</h4>
                  </div>
                  <ul className="pl-2 space-y-1 text-gray-600 text-sm relative z-10">
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Augmentation de puissance</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Déplacement de compteur</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Adaptation technique</span>
                    </li>
                  </ul>
                </div>
              </a>
              
              <a href="/raccordement-enedis?type=production" className="group">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-blue-900">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                      <Bolt className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-800">Raccordement photovoltaïque</h4>
                  </div>
                  <ul className="pl-2 space-y-1 text-gray-600 text-sm relative z-10">
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Panneaux solaires résidentiels</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Solutions d'autoconsommation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="min-w-[16px] h-4 flex items-center justify-center mr-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <span>Injection réseau Enedis</span>
                    </li>
                  </ul>
                </div>
              </a>
            </div>
            
            <h3 className="flex items-center text-xl font-semibold text-gray-800 mt-8 mb-4">
              <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
              Étapes du processus de raccordement Enedis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Étape 1 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-3 border-b border-gray-200 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Demande initiale</h4>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600">
                    Soumission du formulaire de raccordement avec les informations techniques nécessaires.
                  </p>
                </div>
              </div>
              
              {/* Étape 2 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-3 border-b border-gray-200 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Étude technique</h4>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600">
                    Analyse par nos experts et préparation du dossier pour Enedis.
                  </p>
                </div>
              </div>
              
              {/* Étape 3 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-3 border-b border-gray-200 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Proposition</h4>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600">
                    Réception du devis détaillé et des conditions techniques pour le raccordement.
                  </p>
                </div>
              </div>
              
              {/* Étape 4 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-3 border-b border-gray-200 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Acceptation</h4>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600">
                    Validation du devis et planification des travaux de raccordement électrique.
                  </p>
                </div>
              </div>
              
              {/* Étape 5 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-3 border-b border-gray-200 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-bold">5</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Réalisation</h4>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600">
                    Intervention des techniciens Enedis pour l'installation du branchement électrique.
                  </p>
                </div>
              </div>
              
              {/* Étape 6 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-3 border-b border-gray-200 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-bold">6</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Mise en service</h4>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600">
                    Activation de votre compteur et démarrage de la fourniture d'électricité.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="flex items-center text-xl font-semibold text-gray-800 mt-8 mb-4">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Délais de raccordement électrique
            </h3>
            
            <p className="text-gray-700">
              Les <strong>délais de raccordement Enedis</strong> varient selon la complexité du projet et la charge des équipes techniques dans chaque région. En Île-de-France, PACA, Bretagne ou Normandie, comptez en moyenne:
            </p>
            
            <ul className="list-disc pl-6 mb-6 space-y-1 text-gray-700">
              <li><strong>Raccordement provisoire</strong>: 2 à 3 semaines</li>
              <li><strong>Raccordement définitif simple</strong>: 6 à 8 semaines</li>
              <li><strong>Raccordement avec extension de réseau</strong>: 3 à 6 mois</li>
            </ul>
            
            <p className="text-gray-700">
              Notre service d'accompagnement vous permet d'<strong>accélérer ces délais de raccordement Enedis</strong> à travers la France (Grand Est, Occitanie, Auvergne-Rhône-Alpes, etc.) grâce à une prise en charge prioritaire et un suivi personnalisé de votre demande de branchement électrique.
            </p>
            
            <h3 className="flex items-center text-xl font-semibold text-gray-800 mt-8 mb-4">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Documents nécessaires pour votre raccordement
            </h3>
            
            <ul className="list-disc pl-6 mb-6 space-y-1 text-gray-700">
              <li>Formulaire de demande de raccordement (que nous remplissons pour vous)</li>
              <li>Plan de situation et plan de masse du terrain</li>
              <li>Permis de construire ou autorisation d'urbanisme pour les constructions neuves</li>
              <li>Puissance souhaitée et type d'installation (monophasé ou triphasé)</li>
              <li>Photos du site si nécessaire pour des configurations complexes</li>
            </ul>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-8">
              <h3 className="flex items-center text-xl font-semibold text-blue-800 mb-3">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                Pourquoi choisir notre service pour votre raccordement Enedis?
              </h3>
              
              <p className="text-blue-800">
                Notre service d'accompagnement au raccordement électrique Enedis vous apporte:
              </p>
              
              <ul className="list-disc pl-6 mt-2 space-y-1 text-blue-700">
                <li><strong>Gain de temps</strong> - Formulaire simplifié à remplir en 5 minutes au lieu de plusieurs heures</li>
                <li><strong>Réduction des erreurs</strong> - Vérification professionnelle de votre dossier avant transmission</li>
                <li><strong>Traitement prioritaire</strong> - Accélération du processus grâce à notre expertise</li>
                <li><strong>Accompagnement complet</strong> - Un conseiller dédié pour suivre l'avancement de votre demande</li>
                <li><strong>Économies potentielles</strong> - Conseils techniques pour optimiser votre raccordement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}