import { SimpleElectricLoader } from "../simple-electric-loader";

/**
 * Composant de gestion des loaders disponibles dans l'application
 * Centralise l'accès aux différents types d'animations de chargement
 */
export function LoaderManager({
  type = "simple",
  ...props
}: {
  type?: "simple" | "enhanced" | "premium" | "classic";
  [key: string]: any;
}) {
  // Mapper les types aux composants d'animation correspondants
  switch (type) {
    case "simple":
      return <SimpleElectricLoader {...props} />;
    // Les autres types seront ajoutés au fur et à mesure
    default:
      return <SimpleElectricLoader {...props} />;
  }
}