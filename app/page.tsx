import OrbitWheel from "@/components/OrbitWheel/OrbitWheel";
import CurvedRail from "@/components/CurvedRail/CurvedRail";
import AllCars from "@/components/ShuffleGrid/AllCars";
import Heritage from "@/components/Heritage/Heritage";
import AtelierTeaser from "@/components/FloatingParts/AtelierTeaser";

export default function Home() {
  return (
    <>
      <OrbitWheel />
      <CurvedRail />
      <AllCars />
      <AtelierTeaser />
      <Heritage />
    </>
  );
}
