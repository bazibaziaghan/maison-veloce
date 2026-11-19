import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { QuoteItem } from "@/lib/quote";
import { lineTotal } from "@/lib/quote";
import { formatFull } from "@/lib/currency";
import { PRICE_DISCLAIMER, type CurrencyCode } from "@/data/currency";

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 10, color: "#0E0E0E", backgroundColor: "#F5F4F1", fontFamily: "Helvetica" },
  brand: { fontSize: 20, letterSpacing: 4, fontFamily: "Times-Roman" },
  label: { fontSize: 7, letterSpacing: 2, color: "#8A8A8A", textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#DEDCD6", paddingVertical: 7 },
  total: { fontSize: 18, color: "#B3121B", fontFamily: "Times-Roman" },
});

type Args = { items: QuoteItem[]; currency: CurrencyCode; vat: boolean; sub: number; vatAmt: number; total: number; days: number; hours: number; drop: string; ready: string };

/** Uses built-in PDF fonts, so the naira sign is spelled NGN. */
const money = (usd: number, c: CurrencyCode) => formatFull(usd, c).replace("₦", "NGN");

export async function renderQuotePdf(a: Args) {
  const doc = (
    <Document title="Maison Veloce quote">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>MAISON VELOCE</Text>
        <Text style={[s.label, { marginTop: 4 }]}>Quote · {new Date().toDateString()} · prices in {a.currency}</Text>
        <View style={{ marginTop: 28 }}>
          {a.items.map((q) => (
            <View key={q.key} style={s.row}>
              <View style={{ width: "70%" }}>
                <Text>{q.qty} × {q.label}</Text>
                <Text style={{ color: "#8A8A8A", fontSize: 8 }}>{q.sub ?? ""}{q.hours ? ` · parts ${money(q.partsUSD, a.currency)} · labour ${money(q.labourUSD, a.currency)} · ${q.hours} h` : ""}</Text>
              </View>
              <Text>{money(lineTotal(q), a.currency)}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 16, alignItems: "flex-end" }}>
          <Text>Subtotal {money(a.sub, a.currency)}</Text>
          {a.vat && <Text>VAT {money(a.vatAmt, a.currency)}</Text>}
          <Text style={[s.total, { marginTop: 6 }]}>Total {money(a.total, a.currency)}</Text>
        </View>
        {a.hours > 0 && (
          <Text style={{ marginTop: 20 }}>Workshop: {a.hours} h labour · {a.days} working days on the critical path · drop-off {new Date(a.drop).toDateString()} · ready ≈ {a.ready}</Text>
        )}
        <Text style={{ marginTop: 32, color: "#8A8A8A", fontSize: 8 }}>{PRICE_DISCLAIMER} Maison Veloce is a fictional company; this document is a sample.</Text>
      </Page>
    </Document>
  );
  return pdf(doc).toBlob();
}
