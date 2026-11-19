import manifest from "@/data/image-manifest.json";

export const metadata = { title: "Image credits" };

type Entry = { group: string; role: string; file: string; title: string; sourceUrl: string; author: string; licence: string; licenceUrl: string | null; editorial: boolean; width: number; height: number };

export default function Credits() {
  const rows = manifest as Entry[];
  const groups = Array.from(new Set(rows.map((r) => r.group)));
  return (
    <div className="container-site pb-10 pt-28">
      <p className="label">Credits</p>
      <h1 className="display mt-3 text-[56px] md:text-[88px]">Image credits.</h1>
      <p className="mt-4 max-w-2xl text-[14px] text-meta">
        All photography is sourced from Wikimedia Commons under the licences listed. Car cutouts are derivatives (background removed, re-lit, generated contact shadow);
        paint swatches other than the factory colour are digital visualisations. Maison Veloce is fictional and not affiliated with any manufacturer shown.
      </p>
      {groups.map((g) => (
        <section key={g} className="mt-12">
          <h2 className="label border-b hair pb-2 !text-ink">{g.replace(/-/g, " ")}</h2>
          <ul className="divide-y divide-line text-[13px]">
            {rows.filter((r) => r.group === g).map((r) => (
              <li key={r.file} className="grid gap-1 py-3 md:grid-cols-[120px_1fr_1fr_160px]">
                <span className="label">{r.role}</span>
                <a href={r.sourceUrl} className="underline underline-offset-2 hover:text-racing" rel="noopener noreferrer">{r.title}</a>
                <span>{r.licenceUrl ? <a href={r.licenceUrl} className="underline underline-offset-2" rel="license noopener noreferrer">{r.licence}</a> : r.licence}</span>
                <span className="text-meta md:col-start-2 md:col-span-2">by {r.author}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
