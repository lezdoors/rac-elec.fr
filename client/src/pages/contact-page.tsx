import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Helmet } from "react-helmet";
import Layout from "../components/layout";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contactez-nous | Raccordement Enedis</title>
        <meta name="description" content="Contactez notre équipe pour toute question concernant votre raccordement Enedis." />
      </Helmet>
      <Layout>
        <div className="bg-gray-50 py-6 sm:py-8">
          <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
            
            {/* Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Nos coordonnées
                </h2>
                
                <div className="space-y-6">
                  
                  {/* Email */}
                  <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                      <a href="mailto:contact@demande-raccordement.fr" className="text-blue-600 hover:text-blue-800 font-medium break-all sm:break-normal text-sm sm:text-base">
                        contact@demande-raccordement.fr
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        Réponse sous 24h ouvrées
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Téléphone</h3>
                      <a href="tel:0970709570" className="text-green-600 hover:text-green-800 font-medium text-lg sm:text-xl">
                        09 70 70 95 70
                      </a>
                      <p className="text-sm text-gray-600 mt-1">Lundi - Vendredi : 8h - 18h</p>
                    </div>
                  </div>

                  {/* Service Area */}
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Zone de service</h3>
                      <p className="text-gray-700 font-medium">
                        Toute la France métropolitaine
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Service disponible dans toutes les régions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Response Time Info */}
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-900">
                      Temps de réponse
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-800">📧 Email</p>
                      <p className="text-blue-700">Sous 24h ouvrées</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">📞 Téléphone</p>
                      <p className="text-blue-700">Réponse immédiate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                {submitted ? (
                  <div className="text-center py-6 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                      Message envoyé avec succès !
                    </h3>
                    <p className="text-gray-600 mb-4 text-base sm:text-lg">
                      Merci pour votre message. Notre équipe a bien reçu votre demande.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-blue-800">Délai de réponse</span>
                      </div>
                      <p className="text-blue-700">
                        Un membre de notre équipe vous contactera sous <strong>24h ouvrées</strong>
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                      Pour toute urgence, appelez-nous au <strong>09 70 71 10 43</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        Envoyer un autre message
                      </Button>
                      <Button 
                        onClick={() => setLocation('/raccordement-enedis')}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                        data-testid="button-new-request"
                      >
                        Faire une demande de raccordement
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Envoyez-nous un message
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Name */}
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Nom complet *
                        </Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          placeholder="Votre nom et prénom"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Adresse email *
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          placeholder="votre@email.fr"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Téléphone
                        </Label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            // Autoriser seulement les chiffres, espaces, points et tirets
                            const value = e.target.value.replace(/[^0-9\s.-]/g, '');
                            // Formater automatiquement au format français
                            let formatted = value.replace(/\D/g, '');
                            if (formatted.length >= 1) {
                              formatted = formatted.replace(/(\d{2})(?=\d)/g, '$1 ');
                            }
                            if (formatted.length > 14) formatted = formatted.substring(0, 14);
                            setFormData(prev => ({ ...prev, phone: formatted }));
                          }}
                          className="mt-1"
                          placeholder="01 23 45 67 89"
                          pattern="^(0[1-9])\s?(\d{2}\s?){3}\d{2}$"
                          title="Numéro de téléphone français (ex: 01 23 45 67 89)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 01 23 45 67 89</p>
                      </div>

                      {/* Subject */}
                      <div>
                        <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                          Sujet *
                        </Label>
                        <Input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          placeholder="Objet de votre message"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="mt-1"
                          placeholder="Décrivez votre demande en détail..."
                        />
                      </div>

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-6 sm:mt-8 lg:mt-12 bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
                Questions fréquentes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Délais de raccordement</h4>
                  <p className="text-sm text-gray-600">Les délais varient selon la complexité de votre projet</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Suivi de dossier</h4>
                  <p className="text-sm text-gray-600">Suivez l'avancement de votre demande en temps réel</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Documents requis</h4>
                  <p className="text-sm text-gray-600">Liste des pièces nécessaires pour votre dossier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}