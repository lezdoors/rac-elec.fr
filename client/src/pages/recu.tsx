import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, User, Mail, Phone, MapPin, Calendar, FileText, Loader2 } from "lucide-react";

interface ServiceRequest {
  id: number;
  referenceNumber: string;
  name: string;
  prenom?: string;
  nom?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  serviceType?: string;
  paymentAmount?: number;
  status?: string;
  paymentStatus?: string;
  paymentDate?: string;
  createdAt?: string;
}

export default function RecuPage() {
  const [, params] = useRoute("/recu/:reference");
  const reference = params?.reference || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/service-requests', reference],
    queryFn: async () => {
      const response = await fetch(`/api/service-requests/${reference}`);
      if (!response.ok) {
        throw new Error("Demande non trouvée");
      }
      return response.json();
    },
    enabled: !!reference,
  });

  const serviceRequest: ServiceRequest | null = data?.serviceRequest || null;

  const formatAmount = (amount: number | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getClientName = () => {
    if (serviceRequest?.prenom && serviceRequest?.nom) {
      return `${serviceRequest.prenom} ${serviceRequest.nom}`;
    }
    return serviceRequest?.name || "—";
  };

  const getFullAddress = () => {
    const parts = [
      serviceRequest?.address,
      serviceRequest?.postalCode,
      serviceRequest?.city
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const getServiceTypeLabel = (type: string | undefined) => {
    const types: Record<string, string> = {
      'neuf': 'Raccordement Maison Neuve',
      'definitif': 'Raccordement Définitif',
      'provisoire': 'Raccordement Provisoire',
      'modification': 'Modification de Branchement',
      'collectif': 'Raccordement Collectif',
      'viabilisation': 'Viabilisation de Terrain'
    };
    return type ? types[type] || type : "Raccordement Électrique";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du reçu...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Reçu introuvable</h1>
          <p className="text-gray-600">
            La référence <span className="font-mono font-medium">{reference}</span> n'a pas été trouvée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reçu de paiement - {reference}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 px-4" data-testid="recu-page">
        <div className="max-w-2xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1" data-testid="recu-title">Paiement confirmé</h1>
              <p className="text-green-100 text-sm">Votre transaction a été effectuée avec succès</p>
            </div>

            <div className="px-6 py-6 border-b border-gray-100 text-center bg-gray-50">
              <p className="text-sm text-gray-500 mb-1">Montant payé</p>
              <p className="text-4xl font-bold text-gray-900" data-testid="recu-amount">
                {formatAmount(serviceRequest.paymentAmount)}
              </p>
            </div>

            <div className="px-6 py-6 space-y-4">
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <FileText className="w-5 h-5" />
                  <span>Référence</span>
                </div>
                <span className="font-mono font-semibold text-gray-900" data-testid="recu-reference">
                  {serviceRequest.referenceNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-5 h-5" />
                  <span>Client</span>
                </div>
                <span className="font-medium text-gray-900" data-testid="recu-client-name">
                  {getClientName()}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </div>
                <span className="text-gray-900" data-testid="recu-email">
                  {serviceRequest.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>Téléphone</span>
                </div>
                <span className="text-gray-900" data-testid="recu-phone">
                  {serviceRequest.phone}
                </span>
              </div>

              {getFullAddress() && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>Adresse</span>
                  </div>
                  <span className="text-gray-900 text-right text-sm max-w-[200px]" data-testid="recu-address">
                    {getFullAddress()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Date</span>
                </div>
                <span className="text-gray-900" data-testid="recu-date">
                  {formatDate(serviceRequest.paymentDate || serviceRequest.createdAt)}
                </span>
              </div>

            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-medium text-gray-900" data-testid="recu-service-type">
                  {getServiceTypeLabel(serviceRequest.serviceType)}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 text-center">
              <p className="text-sm text-blue-800">
                Un email de confirmation a été envoyé à <strong>{serviceRequest.email}</strong>
              </p>
            </div>

          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Service de raccordement électrique Enedis
          </p>

        </div>
      </div>
    </>
  );
}
