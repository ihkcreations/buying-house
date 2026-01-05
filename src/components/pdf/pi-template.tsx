/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ToWords } from 'to-words'; // Import the library

// Register Font
Font.register({
  family: 'Helvetica',
  fonts: [{ src: 'https://fonts.gstatic.com/s/helvetica/v1/0.ttf' }]
});

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8, fontFamily: 'Helvetica' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  companyName: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
  companyDetails: { fontSize: 8, marginTop: 2, color: '#444' },
  piTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', marginBottom: 5 },
  
  // Grid
  grid3: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  box: { flex: 1, border: '1px solid #000', padding: 5, minHeight: 60 },
  boxTitle: { fontSize: 7, fontWeight: 'bold', borderBottom: '1px solid #ccc', marginBottom: 4, paddingBottom: 2 },
  
  // Table
  table: { width: '100%', borderTop: '1px solid #000', borderLeft: '1px solid #000', marginBottom: 10 },
  row: { flexDirection: 'row', borderBottom: '1px solid #000' },
  headerRow: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
  cell: { padding: 3, borderRight: '1px solid #000', fontSize: 7 },
  
  // Columns
  c1: { width: '5%', textAlign: 'center' },
  c2: { width: '15%' },
  c3: { width: '10%' },
  c4: { width: '30%' },
  c5: { width: '10%' },
  c6: { width: '10%', textAlign: 'right' },
  c7: { width: '10%', textAlign: 'right' },
  c8: { width: '10%', textAlign: 'right' },

  // Amount in Words Row
  wordsRow: { padding: 5, borderBottom: '1px solid #000', borderRight: '1px solid #000', backgroundColor: '#f9fafb' },

  // Terms
  termsBox: { border: '1px solid #000', padding: 5, marginTop: 10 },
  termRow: { flexDirection: 'row', marginBottom: 2 },
  termKey: { width: 100, fontWeight: 'bold' },
  termVal: { flex: 1 },

  // Footer
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  sigLine: { width: 150, borderTop: '1px solid #000', paddingTop: 5, textAlign: 'center', fontSize: 7 },
});

export const PIDocument = ({ order, pi, settings }: { order: any, pi: any, settings: any }) => {
  const items = pi.items || [];
  const totalAmount = items.reduce((acc: number, item: any) => acc + (item.amount || 0), 0);
  const totalQty = items.reduce((acc: number, item: any) => acc + (item.qty || 0), 0);

  const supplierText = pi.supplierAddress || 
    `${settings?.companyName || ""}\n${settings?.companyAddress || ""}\n${settings?.contactPhone || ""}`;

  // Initialize Number to Words Converter
  const toWords = new ToWords({
    localeCode: 'en-US',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: { name: 'Dollar', plural: 'Dollars', symbol: '$', fractionalUnit: { name: 'Cent', plural: 'Cents', symbol: '¢' } }
    }
  });

  // Convert and Uppercase
  const amountInWords = toWords.convert(totalAmount).toUpperCase();

  const terms = [
    { label: "1. Payment", val: pi.payment },
    { label: "2. B/L Clause", val: pi.blClause },
    { label: "3. Tolerance", val: pi.tolerance },
    { label: "4. Freight", val: pi.freightTerm },
    { label: "5. Port Loading", val: pi.portLoading },
    { label: "6. Partial Ship", val: pi.partialShipment },
    { label: "7. Charges", val: pi.charges },
    { label: "8. Insurance", val: pi.insurance },
    { label: "9. L/C Term 1", val: pi.lcTerm1 },
    { label: "10. L/C Term 2", val: pi.lcTerm2 },
    { label: "11. Destination", val: pi.portDischarge },
    { label: "12. Documents", val: pi.documents },
  ].filter(t => t.val);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <View style={{ width: '60%' }}>
                {/* Use the specific text saved in the PI */}
                <Text style={styles.companyName}>{settings?.companyName || "P.I. OCEAN TEX"}</Text>
                <Text style={styles.companyDetails}>{supplierText}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.piTitle}>PROFORMA INVOICE</Text>
                <Text>PI No: {pi.piNumber}</Text>
                <Text>Date: {format(new Date(pi.date), "dd MMM yyyy")}</Text>
            </View>
        </View>

        {/* BOXES */}
        <View style={styles.grid3}>
            <View style={styles.box}>
                <Text style={styles.boxTitle}>BENEFICIARY</Text>
                {/* Use the specific text here too */}
                <Text>{supplierText}</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.boxTitle}>APPLICANT (BUYER)</Text>
                <Text>{order.buyer.name}</Text>
                <Text>{order.buyer.country}</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.boxTitle}>ADVISING BANK</Text>
                <Text>{pi.bankDetails}</Text>
            </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.c1]}>SL</Text>
                <Text style={[styles.cell, styles.c2]}>Style / Order</Text>
                <Text style={[styles.cell, styles.c3]}>Article</Text>
                <Text style={[styles.cell, styles.c4]}>Description</Text>
                <Text style={[styles.cell, styles.c5]}>Ship Date</Text>
                <Text style={[styles.cell, styles.c6]}>Qty</Text>
                <Text style={[styles.cell, styles.c7]}>Rate</Text>
                <Text style={[styles.cell, styles.c8]}>Amount</Text>
            </View>

            {items.map((item: any, i: number) => (
                <View key={i} style={styles.row}>
                    <Text style={[styles.cell, styles.c1]}>{i + 1}</Text>
                    <Text style={[styles.cell, styles.c2]}>{item.styleOrder}</Text>
                    <Text style={[styles.cell, styles.c3]}>{item.article}</Text>
                    <Text style={[styles.cell, styles.c4]}>{item.description}</Text>
                    <Text style={[styles.cell, styles.c5]}>{item.shippingDate}</Text>
                    <Text style={[styles.cell, styles.c6]}>{item.qty.toLocaleString()}</Text>
                    <Text style={[styles.cell, styles.c7]}>${item.rate.toFixed(2)}</Text>
                    <Text style={[styles.cell, styles.c8]}>${item.amount.toLocaleString()}</Text>
                </View>
            ))}

            {/* TOTAL ROW */}
            <View style={[styles.row, { backgroundColor: '#f9fafb' }]}>
                <Text style={[styles.cell, styles.c1, {borderRight:0}]}></Text>
                <Text style={[styles.cell, styles.c2, {borderRight:0}]}></Text>
                <Text style={[styles.cell, styles.c3, {borderRight:0}]}></Text>
                <Text style={[styles.cell, styles.c4, {borderRight:0}]}></Text>
                <Text style={[styles.cell, styles.c5, {borderRight:0, fontWeight: 'bold', textAlign: 'right'}]}>TOTAL:</Text>
                <Text style={[styles.cell, styles.c6, {fontWeight: 'bold'}]}>{totalQty.toLocaleString()}</Text>
                <Text style={[styles.cell, styles.c7, {borderRight:0}]}></Text>
                <Text style={[styles.cell, styles.c8, {fontWeight: 'bold'}]}>${totalAmount.toLocaleString()}</Text>
            </View>

            {/* --- NEW: AMOUNT IN WORDS ROW --- */}
            <View style={styles.wordsRow}>
                <Text style={{fontWeight: 'bold'}}>IN WORDS: {amountInWords}</Text>
            </View>
        </View>

        {/* TERMS */}
        <View style={styles.termsBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, textDecoration: 'underline' }}>TERMS & CONDITIONS:</Text>
            {terms.map((t, idx) => (
                <View key={idx} style={styles.termRow}>
                    <Text style={styles.termKey}>{t.label}:</Text>
                    <Text style={styles.termVal}>{t.val}</Text>
                </View>
            ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
            <View style={styles.sigLine}>
                <Text>ACCEPTED BY BUYER</Text>
                <Text>(Signature & Seal)</Text>
            </View>
            <View style={styles.sigLine}>
                <Text>{settings?.companyName}</Text>
                <Text>AUTHORIZED SIGNATURE</Text>
            </View>
        </View>

      </Page>
    </Document>
  );
};