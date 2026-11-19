import { Suspense } from "react";
import BookingForm from "@/components/BookingForm/BookingForm";
export const metadata = { title: "Book" };
export default function Page() {
  return (
    <div className="container-site pb-10 pt-28">
      <p className="label">Booking</p>
      <h1 className="display mt-3 text-[56px] md:text-[96px]">Book a visit.</h1>
      <div className="mt-12"><Suspense><BookingForm /></Suspense></div>
    </div>
  );
}
