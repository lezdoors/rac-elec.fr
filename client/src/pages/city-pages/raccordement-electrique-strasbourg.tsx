import { CityLandingPageTemplate } from "@/components/city-landing-page-template";
import { frenchCitiesData } from "@/data/french-cities";
import Layout from "@/components/layout";

export default function RaccordementElectriqueStrasbourg() {
  return <CityLandingPageTemplate cityData={frenchCitiesData.strasbourg} />;
}