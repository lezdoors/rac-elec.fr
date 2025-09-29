import { Star, ShieldCheck, Clock, Users, Phone, CheckCircle2, Award, Zap } from "lucide-react";
import { useState, useEffect } from "react";

// Performance stats with real-time counter
interface PerformanceStat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
  increment: number;
  maxValue: number;
}

const performanceStats: PerformanceStat[] = [
  {
    label: "Dossiers traités",
    value: 2847,
    suffix: "+",
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    increment: 1,
    maxValue: 3000
  },
  {
    label: "Délai moyen",
    value: 72,
    suffix: "h",
    icon: <Clock className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600", 
    increment: 0,
    maxValue: 72
  },
  {
    label: "Taux de satisfaction",
    value: 97,
    suffix: "%",
    icon: <Star className="w-6 h-6" />,
    color: "from-yellow-500 to-yellow-600",
    increment: 0,
    maxValue: 97
  },
  {
    label: "Support disponible",
    value: 24,
    suffix: "h/24",
    icon: <Phone className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
    increment: 0,
    maxValue: 24
  }
];

// Client testimonials with verified badges
interface Testimonial {
  name: string;
  initials: string;
  location: string;
  rating: number;
  text: string;
  projectType: string;
  avatar: string;
  verified: boolean;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Marie L.",
    initials: "ML",
    location: "Paris 15ème",
    rating: 5,
    text: "Service impeccable pour notre raccordement de maison neuve. L'équipe nous a accompagnés de A à Z, très professionnel et délais respectés.",
    projectType: "Raccordement maison neuve",
    avatar: "#3B82F6",
    verified: true,
    date: "Il y a 3 jours"
  },
  {
    name: "David M.",
    initials: "DM", 
    location: "Lyon 3ème",
    rating: 5,
    text: "Excellente réactivité ! Mon dossier traité en moins de 48h et suivi constant par email. Je recommande vivement ce service.",
    projectType: "Raccordement provisoire",
    avatar: "#10B981",
    verified: true,
    date: "Il y a 1 semaine"
  },
  {
    name: "Sophie R.",
    initials: "SR",
    location: "Marseille 8ème", 
    rating: 5,
    text: "Parfait pour notre projet de raccordement photovoltaïque. Expertise technique et accompagnement jusqu'au bout. Tarifs transparents.",
    projectType: "Raccordement photovoltaïque",
    avatar: "#F59E0B",
    verified: true,
    date: "Il y a 5 jours"
  },
  {
    name: "Thomas B.",
    initials: "TB",
    location: "Toulouse 31",
    rating: 5,
    text: "Service client au top ! Questions répondues immédiatement et processus simplifié. Gain de temps considérable par rapport à la démarche classique.",
    projectType: "Raccordement entreprise",
    avatar: "#8B5CF6",
    verified: true,
    date: "Il y a 2 jours"
  }
];

export function TestimonialsPerformanceSection() {
  const [animatedStats, setAnimatedStats] = useState(performanceStats.map(stat => ({ ...stat, currentValue: 0 })));
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Animate stats on mount
  useEffect(() => {
    const animateStats = () => {
      performanceStats.forEach((stat, index) => {
        let currentValue = 0;
        const increment = stat.value / 50; // 50 steps for smooth animation
        
        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= stat.value) {
            currentValue = stat.value;
            clearInterval(timer);
          }
          
          setAnimatedStats(prev => 
            prev.map((s, i) => 
              i === index ? { ...s, currentValue: Math.floor(currentValue) } : s
            )
          );
        }, 30);
      });
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Performance Stats */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nos performances en temps réel
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Des résultats concrets qui témoignent de notre expertise et notre engagement
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {animatedStats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl group">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {stat.currentValue}
                    </span>
                    <span className="text-xl text-gray-600">{stat.suffix}</span>
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ce que disent nos clients
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Plus de 2 800 clients nous font confiance pour leurs projets de raccordement électrique
              </p>
            </div>

            {/* Desktop: 3-column grid */}
            <div className="hidden lg:grid grid-cols-3 gap-8 mb-8">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>

            {/* Mobile: Carousel */}
            <div className="lg:hidden">
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile indicators */}
              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonialIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentTestimonialIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 mt-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-md">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Service certifié</h3>
                    <p className="text-gray-600">Agréé partenaire Enedis officiel</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-md">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">97% de satisfaction</h3>
                    <p className="text-gray-600">Avis clients vérifiés</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-md">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Réponse sous 24h</h3>
                    <p className="text-gray-600">Garantie de traitement rapide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl relative">
      {/* Verified badge */}
      {testimonial.verified && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Avis vérifié
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: testimonial.avatar }}
        >
          {testimonial.initials}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-600">{testimonial.location}</p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <blockquote className="text-gray-700 leading-relaxed mb-4">
        "{testimonial.text}"
      </blockquote>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm font-medium text-blue-600">{testimonial.projectType}</span>
        <span className="text-xs text-gray-500">{testimonial.date}</span>
      </div>
    </div>
  );
}