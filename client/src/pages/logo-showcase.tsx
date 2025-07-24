import React from 'react';
import { LogoGallery, RaccordementLogo } from '@/components/ui/logo-designs';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function LogoShowcasePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Nouvelles propositions de logo</h1>
          <div className="flex gap-2">
            <Link href="/logos-artistiques">
              <Button variant="default">Voir Designs Artistiques</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md">
          <LogoGallery />
        </div>
        
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Comparaison des tailles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
              <h3 className="mb-2 font-medium">Design 2 - Petit</h3>
              <RaccordementLogo design="design2" size="sm" animate={true} />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
              <h3 className="mb-2 font-medium">Design 2 - Moyen</h3>
              <RaccordementLogo design="design2" size="md" animate={true} />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
              <h3 className="mb-2 font-medium">Design 2 - Grand</h3>
              <RaccordementLogo design="design2" size="lg" animate={true} />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
              <h3 className="mb-2 font-medium">Design 2 - Format En-tête</h3>
              <RaccordementLogo design="design2" size="header" animate={true} />
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">À propos des logos proposés</h2>
          
          <p className="mb-4">
            Ces logos ont été conçus pour représenter l'essence de Raccordement Enedis tout en 
            apportant une touche de modernité et de dynamisme. Chaque design intègre des éléments 
            visuels clés liés à l'électricité et au raccordement.
          </p>
          
          <h3 className="font-medium mb-2 mt-6">Caractéristiques techniques</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Logos en SVG pour une qualité optimale à toutes les tailles</li>
            <li>Entièrement responsive et adaptables</li>
            <li>Compatibles avec les modes clair et sombre</li>
            <li>Options d'animation légères pour les interactions</li>
            <li>Accessibles avec texte alternatif pour les lecteurs d'écran</li>
            <li>Performance optimisée (SVG légers sans dépendances externes)</li>
          </ul>
          
          <h3 className="font-medium mb-2 mt-6">Comment utiliser ces logos</h3>
          <p className="mb-4">
            Pour intégrer un de ces logos dans le site, utilisez le composant <code>RaccordementLogo</code> avec 
            les propriétés suivantes :
          </p>
          
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-4">
{`import { RaccordementLogo } from '@/components/ui/logo-designs';

// Logo par défaut (design original modernisé)
<RaccordementLogo />

// Choisir un design spécifique
<RaccordementLogo design="design1" />
<RaccordementLogo design="design2" />
<RaccordementLogo design="design3" />

// Changer la taille
<RaccordementLogo size="sm" />
<RaccordementLogo size="md" />
<RaccordementLogo size="lg" />
<RaccordementLogo size="xl" />

// Mode sombre
<RaccordementLogo variant="dark" />

// Activer l'animation
<RaccordementLogo animate={true} />`}
          </pre>
          
          <p className="text-gray-600 italic">
            Tous les logos sont entièrement personnalisables en termes de couleurs et de dimensions 
            en modifiant directement le composant selon vos besoins spécifiques.
          </p>
          
          <div className="mt-8 border-t pt-4 text-center">
            <Link href="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}