import AtelierView from "@/components/FloatingParts/AtelierView";
import DiagnosticMap from "@/components/DiagnosticMap/DiagnosticMap";
export const metadata = { title: "The Atelier" };
export default function Page() {
  return (
    <div className="pt-24">
      <AtelierView />
      <DiagnosticMap />
    </div>
  );
}
