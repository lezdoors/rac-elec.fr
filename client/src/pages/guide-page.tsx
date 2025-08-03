import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Home, Building, LandPlot, MapPin, Zap, Clock, 
  FileText, Phone, Mail, CheckCircle, ArrowRight,
  Users, Calculator, Shield, Lightbulb, AlertCircle,
  Download, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  steps: string[];
  tips?: string[];
  documents?: string[];
}

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const guideSections: GuideSection[] = [
    {
      id: 'particulier',
      title: 'Guide Particulier',
      description: 'Tout ce qu\'il faut savoir pour votre raccordement résidentiel',
      icon: Home,
      gradient: 'from-blue-500 to-blue-600',
      steps: [
        'Vérifiez l\'éligibilité de votre terrain',
        'Rassemblez les documents nécessaires',
        'Déposez votre demande en ligne',
        'Attendez l\'étude technique d\'Enedis',
        'Validez le devis et planifiez les travaux',
        'Réalisez la mise en service'
      ],
      tips: [
        'Anticipez votre demande 2-3 mois avant le besoin',
        'Vérifiez la viabilisation de votre terrain',
        'Préparez un plan de situation détaillé'
      ],
      documents: [
        'Plan de situation du terrain',
        'Plan de masse de la construction',
        'Permis de construire ou déclaration de travaux',
        'Justificatif de propriété du terrain'
      ]
    },
    {
      id: 'professionnel',
      title: 'Guide Professionnel',
      description: 'Raccordement électrique pour entreprises et commerces',
      icon: Building,
      gradient: 'from-indigo-500 to-purple-600',
      steps: [
        'Définissez vos besoins en puissance',
        'Contactez un bureau d\'études si nécessaire',
        'Préparez votre dossier technique',
        'Soumettez votre demande avec SIREN',
        'Négociez les modalités techniques',
        'Planifiez la mise en œuvre'
      ],
      tips: [
        'Évaluez précisément vos besoins futurs',
        'Considérez l\'évolutivité de l\'installation',
        'Prévoyez un délai plus long pour les gros projets'
      ],
      documents: [
        'SIREN et documents d\'entreprise',
        'Étude de besoins énergétiques',
        'Plans techniques détaillés',
        'Autorisations administratives'
      ]
    },
    {
      id: 'collectivite',
      title: 'Guide Collectivité',
      description: 'Raccordement pour administrations et collectivités locales',
      icon: LandPlot,
      gradient: 'from-red-500 to-red-600',
      steps: [
        'Identifiez le projet d\'intérêt général',
        'Constituez le dossier administratif',
        'Obtenez les autorisations préfectorales',
        'Déposez la demande avec SIREN collectivité',
        'Coordonnez avec les services techniques',
        'Suivez la mise en service'
      ],
      tips: [
        'Impliquez les services techniques dès le début',
        'Prévoyez les procédures administratives',
        'Coordonnez avec d\'autres projets publics'
      ],
      documents: [
        'SIREN de la collectivité',
        'Délibération du conseil',
        'Autorisations préfectorales',
        'Plans d\'aménagement public'
      ]
    }
  ];

  const faqData = [
    {
      id: 'delais',
      question: 'Quels sont les délais de raccordement ?',
      answer: 'Les délais varient de 2 à 6 mois selon la complexité du projet et la disponibilité du réseau Enedis dans votre zone.'
    },
    {
      id: 'cout',
      question: 'Comment est calculé le coût du raccordement ?',
      answer: 'Le coût dépend de la distance au réseau, de la puissance demandée, et des travaux nécessaires. Un devis personnalisé vous sera fourni.'
    },
    {
      id: 'documents',
      question: 'Quels documents dois-je fournir ?',
      answer: 'Les documents varient selon votre profil : particulier, professionnel ou collectivité. Consultez la section appropriée du guide.'
    },
    {
      id: 'urgence',
      question: 'Puis-je accélérer ma demande en cas d\'urgence ?',
      answer: 'Pour les cas urgents justifiés, contactez directement notre service client qui étudiera les possibilités d\'accélération.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Guide de raccordement électrique Enedis | Instructions complètes</title>
        <meta name="description" content="Guide complet pour votre raccordement électrique Enedis. Instructions détaillées pour particuliers, professionnels et collectivités." />
      </Helmet>

      {/* Elegant Header with French Flag */}
      <div className="bg-gradient-to-r from-blue-600 via-white to-red-600 h-1"></div>
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                Guide de Raccordement Électrique
              </h1>
              <p className="text-gray-600 text-sm">Votre accompagnement complet étape par étape</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-red-50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tout savoir sur votre raccordement électrique
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Découvrez les étapes, documents nécessaires et conseils pratiques pour réussir votre projet de raccordement Enedis
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 mr-2" />
              Commencer ma demande
            </Button>
            <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl">
              <Phone className="w-5 h-5 mr-2" />
              Nous contacter
            </Button>
          </div>
        </div>
      </div>

      {/* Guide Sections */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {guideSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <div key={section.id} className="space-y-6">
                {/* Section Card */}
                <div 
                  className={`group bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setActiveSection(isActive ? null : section.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {/* Expanded Content */}
                    {isActive && (
                      <div className="space-y-6 animate-in slide-in-from-top duration-300">
                        {/* Steps */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            Étapes à suivre
                          </h4>
                          <ol className="space-y-2">
                            {section.steps.map((step, index) => (
                              <li key={index} className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                                  {index + 1}
                                </div>
                                <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        
                        {/* Tips */}
                        {section.tips && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Lightbulb className="w-4 h-4 text-yellow-600 mr-2" />
                              Conseils pratiques
                            </h4>
                            <ul className="space-y-2">
                              {section.tips.map((tip, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <ArrowRight className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Documents */}
                        {section.documents && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <FileText className="w-4 h-4 text-blue-600 mr-2" />
                              Documents nécessaires
                            </h4>
                            <ul className="space-y-2">
                              {section.documents.map((doc, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <Download className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 leading-relaxed">{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <Button className={`w-full bg-gradient-to-r ${section.gradient} hover:opacity-90 text-white py-3 rounded-xl shadow-lg`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Commencer ma demande {section.title.toLowerCase()}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-gray-600">Retrouvez les réponses aux questions les plus courantes</p>
          </div>
          
          <div className="space-y-4">
            {faqData.map((faq) => (
              <div key={faq.id} className="bg-gray-50 rounded-xl border border-gray-200">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 rounded-xl"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    expandedFaq === faq.id ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-4 animate-in slide-in-from-top duration-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-red-50 border-t">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Besoin d'aide supplémentaire ?</h2>
            <p className="text-gray-600 mb-6">
              Notre équipe d'experts est là pour vous accompagner dans votre projet
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Téléphone</div>
                  <div className="text-blue-600 font-medium">09 70 70 95 70</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-red-600 font-medium">contact@portail-electricite.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}