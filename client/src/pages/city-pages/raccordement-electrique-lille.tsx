import { CityLandingPageTemplate } from "@/components/city-landing-page-template";
import { frenchCitiesData } from "@/data/french-cities";
import Layout from "@/components/layout";

export default function RaccordementElectriqueLille() {
  return <CityLandingPageTemplate cityData={frenchCitiesData.lille} />;
}