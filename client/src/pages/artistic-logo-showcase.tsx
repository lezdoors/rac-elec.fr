import React, { useState } from 'react';
import { ArtisticLogoGallery, PerspectiveLogo, AbstractLogo, EnergyLogo, NeonLogo } from '@/components/ui/artistic-logos';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ArtisticLogoShowcasePage() {
  const [animate, setAnimate] = useState(true);
  
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Logos Artistiques Raccordement Enedis</h1>
          <div className="flex space-x-3">
            <Button
              onClick={() => setAnimate(!animate)}
              variant={animate ? "default" : "outline"}
            >
              {animate ? "Animations Actives" : "Activer Animations"}
            </Button>
            <Link href="/logos">
              <Button variant="outline">Logos Standard</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Accueil</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md mb-8">
          <ArtisticLogoGallery />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Intégration dans Différents Environnements</h2>
          
          <Tabs defaultValue="header" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="header">En-tête</TabsTrigger>
              <TabsTrigger value="dark">Fond Sombre</TabsTrigger>
              <TabsTrigger value="sizes">Tailles</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="header" className="space-y-6">
              <h3 className="text-xl font-semibold">Intégration dans un En-tête</h3>
              
              {/* En-tête avec Logo Perspective */}
              <div className="border rounded-lg overflow-hidden mb-8">
                <header className="bg-white shadow-md py-3">
                  <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                      <PerspectiveLogo size="header" animate={animate} />
                      <nav className="hidden md:flex space-x-6">
                        <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Accueil</a>
                        <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Services</a>
                        <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Contact</a>
                        <Button>Raccordement</Button>
                      </nav>
                      <div className="md:hidden">
                        <Button variant="ghost" size="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="p-4 bg-gray-100 text-center text-sm text-gray-600">Logo Perspective 3D dans l'en-tête</div>
              </div>
              
              {/* En-tête avec Logo Énergie */}
              <div className="border rounded-lg overflow-hidden mb-8">
                <header className="bg-white shadow-md py-3">
                  <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                      <EnergyLogo size="header" animate={animate} />
                      <nav className="hidden md:flex space-x-6">
                        <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Accueil</a>
                        <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Services</a>
                        <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Contact</a>
                        <Button>Raccordement</Button>
                      </nav>
                      <div className="md:hidden">
                        <Button variant="ghost" size="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="p-4 bg-gray-100 text-center text-sm text-gray-600">Logo Énergie Dynamique dans l'en-tête</div>
              </div>
              
              {/* En-tête avec Logo Néon */}
              <div className="border rounded-lg overflow-hidden">
                <header className="bg-slate-900 shadow-md py-3">
                  <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                      <NeonLogo size="header" animate={animate} variant="vibrant" />
                      <nav className="hidden md:flex space-x-6">
                        <a href="#" className="text-gray-200 hover:text-blue-400 font-medium">Accueil</a>
                        <a href="#" className="text-gray-200 hover:text-blue-400 font-medium">Services</a>
                        <a href="#" className="text-gray-200 hover:text-blue-400 font-medium">Contact</a>
                        <Button variant="default">Raccordement</Button>
                      </nav>
                      <div className="md:hidden">
                        <Button variant="ghost" size="icon" className="text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="p-4 bg-gray-100 text-center text-sm text-gray-600">Logo Néon dans l'en-tête sombre</div>
              </div>
            </TabsContent>
            
            <TabsContent value="dark">
              <h3 className="text-xl font-semibold mb-4">Logos sur Fond Sombre</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-800 p-8 rounded-lg flex flex-col items-center">
                  <h4 className="text-white mb-4">Logo Abstrait</h4>
                  <AbstractLogo size="lg" animate={animate} variant="vibrant" />
                </div>
                <div className="bg-gray-900 p-8 rounded-lg flex flex-col items-center">
                  <h4 className="text-white mb-4">Logo Néon</h4>
                  <NeonLogo size="lg" animate={animate} variant="vibrant" />
                </div>
                <div className="bg-blue-900 p-8 rounded-lg flex flex-col items-center">
                  <h4 className="text-white mb-4">Logo Perspective</h4>
                  <PerspectiveLogo size="lg" animate={animate} variant="dark" />
                </div>
                <div className="bg-slate-900 p-8 rounded-lg flex flex-col items-center">
                  <h4 className="text-white mb-4">Logo Énergie</h4>
                  <EnergyLogo size="lg" animate={animate} variant="dark" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sizes">
              <h3 className="text-xl font-semibold mb-4">Comparaison des Tailles</h3>
              <div className="bg-white p-6 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center">
                    <h4 className="text-gray-700 mb-2">Petit</h4>
                    <NeonLogo size="sm" animate={animate} />
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="text-gray-700 mb-2">Moyen</h4>
                    <NeonLogo size="md" animate={animate} />
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="text-gray-700 mb-2">Grand</h4>
                    <NeonLogo size="lg" animate={animate} />
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="text-gray-700 mb-2">En-tête</h4>
                    <NeonLogo size="header" animate={animate} />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="variants">
              <h3 className="text-xl font-semibold mb-4">Variantes de Couleurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 border rounded-lg flex flex-col items-center">
                  <h4 className="text-gray-700 mb-2">Version Lumière</h4>
                  <PerspectiveLogo size="lg" animate={animate} variant="light" />
                </div>
                <div className="bg-white p-6 border rounded-lg flex flex-col items-center">
                  <h4 className="text-gray-700 mb-2">Version Colorée</h4>
                  <PerspectiveLogo size="lg" animate={animate} variant="colorful" />
                </div>
                <div className="bg-slate-800 p-6 border rounded-lg flex flex-col items-center">
                  <h4 className="text-white mb-2">Version Sombre</h4>
                  <PerspectiveLogo size="lg" animate={animate} variant="dark" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Contextes d'Utilisation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4">
                <h3 className="font-semibold text-lg mb-2">Application Mobile</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center items-center py-12">
                  <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg w-64">
                    <div className="p-4 bg-blue-900 flex justify-center">
                      <EnergyLogo size="sm" animate={animate} variant="dark" />
                    </div>
                    <div className="p-4 text-white">
                      <div className="bg-slate-700 h-3 w-3/4 rounded mb-2"></div>
                      <div className="bg-slate-700 h-3 w-full rounded mb-2"></div>
                      <div className="bg-slate-700 h-3 w-2/3 rounded mb-6"></div>
                      <div className="bg-blue-600 h-8 rounded flex items-center justify-center text-xs font-medium">
                        Raccordement Enedis
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4">
                <h3 className="font-semibold text-lg mb-2">Carte de Visite</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center items-center py-8">
                  <div className="bg-white rounded shadow-lg w-80 h-48 p-6 flex">
                    <div className="w-1/3 flex items-center justify-center">
                      <AbstractLogo size="sm" animate={animate} />
                    </div>
                    <div className="w-2/3 flex flex-col justify-center">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                      <div className="h-3 bg-blue-200 rounded w-1/2 mt-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}