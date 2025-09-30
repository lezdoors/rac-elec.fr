import { Link } from "wouter";

export function ProfessionalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-300">
              <div>
                <span className="font-medium">Téléphone :</span>
                <a 
                  href="tel:+33970709570" 
                  className="ml-2 text-blue-400 hover:text-blue-300"
                  aria-label="Appeler le 09 70 70 95 70"
                >
                  09 70 70 95 70
                </a>
              </div>
              <div>
                <span className="font-medium">Horaires :</span>
                <span className="ml-2">8h–18h</span>
              </div>
              <div>
                <span className="font-medium">E-mail :</span>
                <Link href="/contact" className="ml-2 text-blue-400 hover:text-blue-300">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/raccordement-provisoire" className="hover:text-white">
                  Raccordement provisoire
                </Link>
              </li>
              <li>
                <Link href="/raccordement-definitif" className="hover:text-white">
                  Raccordement définitif
                </Link>
              </li>
              <li>
                <Link href="/viabilisation-terrain" className="hover:text-white">
                  Viabilisation de terrain
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Suivi de dossier
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/mentions-legales" className="hover:text-white">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:text-white">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-white">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-gray-400 text-sm">
            © {currentYear} Raccordement-Connect.com — Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}