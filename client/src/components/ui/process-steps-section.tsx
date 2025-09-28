import { CheckCircle2, FileText, Search, Zap, Phone } from "lucide-react";

// Modern SVG Icons for the 4 steps
const StepIcons = {
  step1: () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
      <defs>
        <linearGradient id="step1Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#step1Gradient)" stroke="#E5E7EB" strokeWidth="2"/>
      <path d="M20 32h8l4-8 8 16 4-8h8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="20" cy="32" r="2" fill="white"/>
      <circle cx="56" cy="32" r="2" fill="white"/>
    </svg>
  ),
  
  step2: () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
      <defs>
        <linearGradient id="step2Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#step2Gradient)" stroke="#E5E7EB" strokeWidth="2"/>
      <path d="M22 30h20v20H22z" fill="white" rx="2"/>
      <path d="M26 30V22a6 6 0 0112 0v8" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="32" cy="40" r="2" fill="#10B981"/>
    </svg>
  ),
  
  step3: () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
      <defs>
        <linearGradient id="step3Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#step3Gradient)" stroke="#E5E7EB" strokeWidth="2"/>
      <path d="M24 28h16v16H24z" fill="white" rx="2"/>
      <path d="M28 28v-4a4 4 0 018 0v4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M30 36h4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      <path d="M28 40h8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  step4: () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
      <defs>
        <linearGradient id="step4Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#step4Gradient)" stroke="#E5E7EB" strokeWidth="2"/>
      <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  duration: string;
  icon: keyof typeof StepIcons;
}

const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Demande en ligne",
    description: "Remplissez notre formulaire sécurisé en quelques minutes avec vos informations projet",
    duration: "2 min",
    icon: "step1"
  },
  {
    number: "02", 
    title: "Analyse technique",
    description: "Nos experts analysent votre dossier et préparent les documents pour Enedis",
    duration: "24h",
    icon: "step2"
  },
  {
    number: "03",
    title: "Validation & devis",
    description: "Réception du devis Enedis et validation des conditions de raccordement",
    duration: "5-10 jours",
    icon: "step3"
  },
  {
    number: "04",
    title: "Raccordement",
    description: "Planification et réalisation des travaux par les équipes Enedis agréées",
    duration: "2-6 semaines",
    icon: "step4"
  }
];

export function ProcessStepsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Un processus simple et transparent en 4 étapes pour votre raccordement électrique Enedis
            </p>
          </div>

          {/* Desktop: Horizontal Flow */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connection Lines */}
              <div className="absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-yellow-200 to-purple-200 transform -translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="grid grid-cols-4 gap-8">
                {processSteps.map((step, index) => {
                  const IconComponent = StepIcons[step.icon];
                  return (
                    <div key={index} className="relative">
                      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-200">
                        
                        {/* Step Icon */}
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <IconComponent />
                            <div className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-gray-200">
                              <span className="text-sm font-bold text-gray-700">{step.number}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed mb-4">
                            {step.description}
                          </p>
                          <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="text-sm font-medium text-blue-700">{step.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical Flow */}
          <div className="lg:hidden space-y-8">
            {processSteps.map((step, index) => {
              const IconComponent = StepIcons[step.icon];
              return (
                <div key={index} className="relative">
                  {/* Connection Line */}
                  {index < processSteps.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-blue-300 to-green-300"></div>
                  )}
                  
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0 relative">
                      <IconComponent />
                      <div className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-gray-200">
                        <span className="text-xs font-bold text-gray-700">{step.number}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {step.description}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm font-medium text-blue-700">{step.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Prêt à commencer votre raccordement ?
              </h3>
              <p className="text-gray-600 mb-6">
                Démarrez votre demande en 2 minutes et bénéficiez de notre accompagnement expert
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Commencer ma demande
                </button>
                <button className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Être rappelé gratuitement
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}