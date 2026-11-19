import PriceList from "@/components/PriceList/PriceList";
import { PRICE_DISCLAIMER } from "@/data/currency";
export const metadata = { title: "Price List" };
export default function Page() {
  return (
    <div className="container-site pb-10 pt-28">
      <p className="label">Price list</p>
      <h1 className="display mt-3 text-[56px] md:text-[96px]">Every job, priced.</h1>
      <p className="mt-4 max-w-xl text-[14px] text-meta">Cars, parts and workshop services in one list. Click any car, part or service to see its full specs and price — parts and services include labour at the marque tier’s rate. {PRICE_DISCLAIMER}</p>
      <div className="mt-12"><PriceList /></div>
    </div>
  );
}
