import { readPublicHome } from "@/services/publicHomeService";
import { HeroView } from "./HeroView";

export async function Hero() {
  const homeData = await readPublicHome();
  return <HeroView homeData={homeData} />;
}
