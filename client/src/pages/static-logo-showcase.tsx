import React from 'react';
import { StaticProfessionalLogoGallery } from '@/components/ui/static-professional-logos';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function StaticLogoShowcasePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Logos Professionnels sans Animation</h1>
          <div className="flex space-x-3">
            <Link href="/logos">
              <Button variant="outline">Logos Standard</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Accueil</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md mb-8">
          <StaticProfessionalLogoGallery />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Proposition de design final</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Pour les en-têtes et documents officiels</h3>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="border p-4 flex justify-between items-center">
                  <img src="/logo-header.svg" alt="Logo Raccordement Enedis" className="h-10" />
                  <div className="hidden md:flex space-x-4">
                    <span className="text-gray-700">Accueil</span>
                    <span className="text-gray-700">Services</span>
                    <span className="text-gray-700">Contact</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Demande</button>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Ce logo conserve l'identité visuelle d'Enedis tout en ajoutant le concept de raccordement résidentiel.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Pour les cartes de visite et affiches</h3>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <img src="/logo-card.svg" alt="Logo sur carte de visite" className="h-32" />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Version plus détaillée avec concept de maison et connexion, idéale pour les supports marketing.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Recommandations d'utilisation</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Respecter les proportions du logo lors du redimensionnement</li>
              <li>Maintenir une zone de protection autour du logo (espace minimal équivalent à la hauteur du logo)</li>
              <li>Ne pas modifier les couleurs du logo pour maintenir la cohérence de marque</li>
              <li>Pour les fonds colorés, utiliser la version "inversée" avec texte blanc</li>
              <li>Toujours associer le logo à la mention "Partenaire officiel" lors d'une utilisation sur des supports externes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}