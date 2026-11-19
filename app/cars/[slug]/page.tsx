import { notFound } from "next/navigation";
import { CARS, carBySlug } from "@/data/cars";
import CarStudio from "@/components/CarStudio/CarStudio";

export const generateStaticParams = () => CARS.map((c) => ({ slug: c.slug }));
export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = carBySlug(params.slug);
  return { title: c ? `${c.make} ${c.model}` : "Car" };
}

export default function Page({ params }: { params: { slug: string } }) {
  const car = carBySlug(params.slug);
  if (!car) notFound();
  return <CarStudio car={car} />;
}
