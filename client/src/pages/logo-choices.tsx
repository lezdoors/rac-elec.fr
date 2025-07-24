import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { 
  EnedisInspiredLogo, 
  EnedisLogoOption2, 
  EnedisLogoOption3, 
  EnedisLogoOption4, 
  EnedisLogoOption5 
} from "../components/ui/enedis-inspired-logo";

export default function LogoChoicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choisissez votre logo Enedis préféré
          </h1>
          <p className="text-lg text-gray-600">
            5 options inspirées du design officiel Enedis avec la petite maison et le texte "enedis"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Option 1: Original simple */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Option 1: Simple et Clean</h3>
            <div className="flex justify-center items-center h-20 mb-4 bg-gray-50 rounded">
              <EnedisInspiredLogo size="header" variant="light" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Design simple avec maison basique et texte "enedis". Style très proche de l'officiel.
            </p>
            <div className="flex gap-2">
              <div className="p-2 bg-gray-100 rounded flex-1 text-center">
                <EnedisInspiredLogo size="sm" variant="light" />
                <p className="text-xs mt-1">Clair</p>
              </div>
              <div className="p-2 bg-gray-800 rounded flex-1 text-center">
                <EnedisInspiredLogo size="sm" variant="dark" />
                <p className="text-xs mt-1 text-white">Sombre</p>
              </div>
            </div>
          </div>

          {/* Option 2: Détaillée */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Option 2: Détaillée avec sous-titre</h3>
            <div className="flex justify-center items-center h-20 mb-4 bg-gray-50 rounded">
              <EnedisLogoOption2 size="header" variant="light" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Maison avec fenêtres et porte détaillées. Inclut le sous-titre "Raccordement au réseau électrique".
            </p>
            <div className="flex gap-2">
              <div className="p-2 bg-gray-100 rounded flex-1 text-center">
                <EnedisLogoOption2 size="sm" variant="light" />
                <p className="text-xs mt-1">Clair</p>
              </div>
              <div className="p-2 bg-gray-800 rounded flex-1 text-center">
                <EnedisLogoOption2 size="sm" variant="dark" />
                <p className="text-xs mt-1 text-white">Sombre</p>
              </div>
            </div>
          </div>

          {/* Option 3: Compact */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Option 3: Compact horizontal</h3>
            <div className="flex justify-center items-center h-20 mb-4 bg-gray-50 rounded">
              <EnedisLogoOption3 size="header" variant="light" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Version compacte parfaite pour les en-têtes. Design épuré et professionnel.
            </p>
            <div className="flex gap-2">
              <div className="p-2 bg-gray-100 rounded flex-1 text-center">
                <EnedisLogoOption3 size="sm" variant="light" />
                <p className="text-xs mt-1">Clair</p>
              </div>
              <div className="p-2 bg-gray-800 rounded flex-1 text-center">
                <EnedisLogoOption3 size="sm" variant="dark" />
                <p className="text-xs mt-1 text-white">Sombre</p>
              </div>
            </div>
          </div>

          {/* Option 4: Avec éclair */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Option 4: Avec éclair électrique</h3>
            <div className="flex justify-center items-center h-20 mb-4 bg-gray-50 rounded">
              <EnedisLogoOption4 size="header" variant="light" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Maison avec éclair électrique animé et point d'énergie. Évoque clairement l'électricité.
            </p>
            <div className="flex gap-2">
              <div className="p-2 bg-gray-100 rounded flex-1 text-center">
                <EnedisLogoOption4 size="sm" variant="light" />
                <p className="text-xs mt-1">Clair</p>
              </div>
              <div className="p-2 bg-gray-800 rounded flex-1 text-center">
                <EnedisLogoOption4 size="sm" variant="dark" />
                <p className="text-xs mt-1 text-white">Sombre</p>
              </div>
            </div>
          </div>

          {/* Option 5: Minimaliste */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Option 5: Ultra minimaliste</h3>
            <div className="flex justify-center items-center h-20 mb-4 bg-gray-50 rounded">
              <EnedisLogoOption5 size="header" variant="light" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Design ultra épuré avec juste les contours de la maison. Le plus proche du style officiel Enedis.
            </p>
            <div className="flex gap-2 justify-center max-w-md mx-auto">
              <div className="p-2 bg-gray-100 rounded flex-1 text-center">
                <EnedisLogoOption5 size="sm" variant="light" />
                <p className="text-xs mt-1">Clair</p>
              </div>
              <div className="p-2 bg-gray-800 rounded flex-1 text-center">
                <EnedisLogoOption5 size="sm" variant="dark" />
                <p className="text-xs mt-1 text-white">Sombre</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Lequel préférez-vous ?
            </h2>
            <p className="text-gray-600 mb-6">
              Tous ces logos respectent la charte graphique officielle Enedis avec :
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
              <div className="text-left">
                ✓ Couleur bleue officielle (#4A63E8)<br/>
                ✓ Typographie Arial simple<br/>
                ✓ "e" vert comme l'original (#5BC248)
              </div>
              <div className="text-left">
                ✓ Icône maison comme sur le site Enedis<br/>
                ✓ Design responsive et adaptatif<br/>
                ✓ Versions clair/sombre disponibles
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">
                  Retour à l'accueil
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-[#4A63E8] hover:bg-[#3A52D8]">
                  Voir sur la page contact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}