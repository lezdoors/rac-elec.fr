import React from 'react';
import { LogoDesign2 } from '@/components/ui/logo-designs';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function GreenComparisonPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Comparaison des Verts</h1>
          <Link href="/">
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
        </div>
        
        {/* Comparison des deux verts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* #4CAF50 - Le vert principal */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">#4CAF50</h2>
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto rounded-lg mb-4" style={{backgroundColor: '#4CAF50'}}></div>
              <p className="text-gray-600">Vert principal (variant light)</p>
            </div>
            
            {/* Logo avec ce vert */}
            <div className="flex justify-center mb-4">
              <LogoDesign2 size="lg" variant="light" animate={true} />
            </div>
            
            {/* En-tête avec ce vert */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center">
                <LogoDesign2 size="header" variant="light" animate={true} />
                <nav className="flex space-x-4">
                  <span className="text-gray-700 hover:text-[#4CAF50] cursor-pointer">Accueil</span>
                  <span className="text-gray-700 hover:text-[#4CAF50] cursor-pointer">Services</span>
                </nav>
              </div>
            </div>
          </div>
          
          {/* #8BC34A - Le vert "b4c" */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">#8BC34A</h2>
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto rounded-lg mb-4" style={{backgroundColor: '#8BC34A'}}></div>
              <p className="text-gray-600">Vert "b4c" (variant dark)</p>
            </div>
            
            {/* Logo avec ce vert */}
            <div className="flex justify-center mb-4">
              <LogoDesign2 size="lg" variant="dark" animate={true} />
            </div>
            
            {/* En-tête avec ce vert */}
            <div className="border rounded-lg p-4 bg-gray-800">
              <div className="flex justify-between items-center">
                <LogoDesign2 size="header" variant="dark" animate={true} />
                <nav className="flex space-x-4">
                  <span className="text-white hover:text-[#8BC34A] cursor-pointer">Accueil</span>
                  <span className="text-white hover:text-[#8BC34A] cursor-pointer">Services</span>
                </nav>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Comparaison côte à côte */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Comparaison Directe</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">#4CAF50 (Vert principal)</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{backgroundColor: '#4CAF50', color: 'white'}}>
                  <p className="font-bold">Plus foncé et professionnel</p>
                  <p>Idéal pour les sites corporate</p>
                </div>
                <LogoDesign2 size="md" variant="light" animate={true} />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">#8BC34A (Vert "b4c")</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{backgroundColor: '#8BC34A', color: 'white'}}>
                  <p className="font-bold">Plus clair et moderne</p>
                  <p>Idéal pour les designs frais</p>
                </div>
                <LogoDesign2 size="md" variant="dark" animate={true} />
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Lequel préférez-vous pour votre site principal ?</p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-3 rounded-lg text-white font-semibold" style={{backgroundColor: '#4CAF50'}}>
                Choisir #4CAF50
              </button>
              <button className="px-6 py-3 rounded-lg text-white font-semibold" style={{backgroundColor: '#8BC34A'}}>
                Choisir #8BC34A
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}