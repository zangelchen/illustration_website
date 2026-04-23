import { ScrollWalkthrough } from "../components/home/ScrollWalkthrough";
import { SeamlessExperience } from "../components/home/SeamlessExperience";

export default function Page() {
  return (
    <main className="bg-[#f4eadb] text-stone-100">
      <ScrollWalkthrough />
      <SeamlessExperience />
    </main>
  );
}
