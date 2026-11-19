/* eslint-disable @next/next/no-img-element */
import { carImg } from "@/data/cars";

/** Responsive cutout/photo: AVIF + WebP at 640/1280/2400. Paint variants exist at 640/1280 (WebP). */
export default function CarPicture({
  slug, view, alt, sizes = "100vw", className = "", priority = false, paint, flip = false, style,
}: {
  slug: string; view: string; alt: string; sizes?: string; className?: string; priority?: boolean; paint?: string; flip?: boolean; style?: React.CSSProperties;
}) {
  const variant = paint && paint !== "factory";
  const base = `/cars/${slug}/${view}${variant ? `-${paint}` : ""}`;
  const widths = variant ? [640, 1280] : [640, 1280, 2400];
  const set = (ext: string) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture>
      {!variant && <source type="image/avif" srcSet={set("avif")} sizes={sizes} />}
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={carImg(slug, view, 1280, paint)}
        alt={alt}
        width={2400}
        height={1200}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={className}
        style={{ ...(flip ? { transform: "scaleX(-1)" } : null), ...style }}
      />
    </picture>
  );
}
