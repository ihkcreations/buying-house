/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ToWords } from "to-words";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v1/0.ttf" }, // Regular
    {
      src: "https://fonts.gstatic.com/s/helvetica/v1/0b.ttf",
      fontWeight: "bold",
    }, // Bold
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 8, fontFamily: "Helvetica" },

  // Header
  titleContainer: { alignItems: "center", marginBottom: 10 },
  companyName: { fontSize: 18, fontWeight: "bold", textTransform: "uppercase" },
  docTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
    marginTop: 5,
  },

  // Date & PO Line
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 9,
  },

  // Intro Text
  intro: { marginBottom: 5, lineHeight: 1.4 },

  // Address/Bank Sections (Vertical List)
  section: { flexDirection: "row", marginBottom: 5 },
  label: { width: 120, fontWeight: "bold" },
  value: { flex: 1, lineHeight: 0.5 },

  // Table
  table: {
    width: "100%",
    borderTop: "1px solid #000",
    borderLeft: "1px solid #000",
    marginTop: 10,
    marginBottom: 5,
  },
  row: { flexDirection: "row", borderBottom: "1px solid #000" },
  headerRow: {
    backgroundColor: "#d1d5db",
    fontWeight: "bold",
    textAlign: "center",
  },
  cell: { padding: 3, borderRight: "1px solid #000", fontSize: 7 },

  // Columns matching your PDF
  c1: { width: "12%" }, // Order No
  c2: { width: "25%" }, // Item Desc
  c3: { width: "15%" }, // Color/Size
  c4: { width: "12%", textAlign: "right" }, // Qty
  c5: { width: "10%", textAlign: "right" }, // Unit Px
  c6: { width: "13%", textAlign: "right" }, // Amount
  c7: { width: "13%", textAlign: "center" }, // Ship Date

  // Total Row
  totalRow: { backgroundColor: "#f3f4f6", fontWeight: "bold" },

  // Terms Section
  termsHeader: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    textDecoration: "underline",
  },
  termItem: { flexDirection: "row", marginBottom: 2 },
  termKey: { fontWeight: "bold", fontSize: 6, },

  // Long Text Blocks
  blockText: {
    marginTop: 5,
    fontSize: 6,
    lineHeight: 1.3,
    textAlign: "justify",
  },

  // Footer
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigBox: { width: 150, textAlign: "center" },
  dottedLine: { borderBottom: "1px dotted #000", marginBottom: 5 },
});

export const SCDocument = ({
  order,
  pi,
  sc,
  settings,
}: {
  order: any;
  pi: any;
  sc: any;
  settings: any;
}) => {
  const items = pi?.items || [];
  const totalAmount = items.reduce(
    (acc: number, item: any) => acc + (item.amount || 0),
    0
  );
  const totalQty = items.reduce(
    (acc: number, item: any) => acc + (item.qty || 0),
    0
  );

  const toWords = new ToWords({ localeCode: "en-US" });
  const amountInWords = toWords.convert(totalAmount).toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CENTERED HEADER */}
        <View style={styles.titleContainer}>
          <Text style={styles.companyName}>
            {settings?.companyName || "P.I. OCEAN TRADE"}
          </Text>
          <Text style={styles.docTitle}>SALES CONTRACT</Text>
        </View>

        {/* DATE & PO */}
        <View style={styles.topRow}>
          <Text>
            Date : {format(new Date(sc?.scDate || new Date()), "do MMMM, yyyy")}
          </Text>
          <Text>Purchase Order No. {sc?.scNumber}</Text>
        </View>

        <Text style={styles.intro}>
          Enclosed is the Purchase order from {order.buyer.name} and orders have
          been placed with {settings?.companyName} and the details are as
          follows:
        </Text>

        {/* ADDRESSES & BANKS */}
        <View style={styles.section}>
          <Text style={styles.label}>Address of Vendor :</Text>
          <Text style={styles.value}>
            {sc?.vendorAddress || settings?.companyAddress}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Address/ Consignee :</Text>
          <Text style={styles.value}>{sc?.consignee}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Vendor&apos;s bank :</Text>
          <Text style={styles.value}>
            {sc?.vendorBank || settings?.bankDetails}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>LC/TT Opening Bank :</Text>
          <Text style={styles.value}>{sc?.buyerBank || "To be advised"}</Text>
        </View>

        <Text style={{ fontWeight: "bold", marginTop: 5 }}>Order details:</Text>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.c1]}>Order No</Text>
            <Text style={[styles.cell, styles.c2]}>Item Description</Text>
            <Text style={[styles.cell, styles.c3]}>Article</Text>
            <Text style={[styles.cell, styles.c4]}>Quantity/Pcs</Text>
            <Text style={[styles.cell, styles.c5]}>Unit Px/pc</Text>
            <Text style={[styles.cell, styles.c6]}>Amount (USD)</Text>
            <Text style={[styles.cell, styles.c7]}>Shipment Date</Text>
          </View>

          {items.map((item: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.cell, styles.c1]}>
                {item.styleOrder.split("/")[1] || item.styleOrder}
              </Text>
              <Text style={[styles.cell, styles.c2]}>{item.description}</Text>
              <Text style={[styles.cell, styles.c3]}>
                {item.article || "Free"}
              </Text>
              <Text style={[styles.cell, styles.c4]}>
                {item.qty.toLocaleString()}
              </Text>
              <Text style={[styles.cell, styles.c5]}>
                ${item.rate.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.c6]}>
                $
                {item.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text style={[styles.cell, styles.c7]}>
                {item.shippingDate
                  ? format(new Date(item.shippingDate), "dd.MM.yyyy")
                  : ""}
              </Text>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <Text
              style={[
                styles.cell,
                {
                  flex: 1,
                  borderRight: 0,
                  textAlign: "right",
                  paddingRight: 10,
                },
              ]}
            >
              G. TOTAL =
            </Text>
            <Text style={[styles.cell, styles.c4]}>
              {totalQty.toLocaleString()}
            </Text>
            <Text style={[styles.cell, styles.c5, { borderRight: 0 }]}></Text>
            <Text style={[styles.cell, styles.c6]}>
              ${totalAmount.toLocaleString()}
            </Text>
            <Text style={[styles.cell, styles.c7]}></Text>
          </View>
        </View>

        <Text style={{ fontSize: 8, marginTop: 4, fontWeight: "bold" }}>
          Total Value: USD ${totalAmount.toLocaleString()} (In words-US DOLLARS{" "}
          {amountInWords} ONLY).
        </Text>

        {/* TERMS */}
        <Text style={styles.termsHeader}>TERMS & CONDITIONS:-</Text>

        <View style={styles.termItem}>
          <Text style={styles.termKey}>TERMS OF DELIVERY : </Text>
          <Text>&quot;{sc?.deliveryTerm}&quot;</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>MODE OF SHIPMENT : </Text>
          <Text>{sc?.shipmentMode}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>PAYMENT TERM : </Text>
          <Text>{sc?.paymentTerm}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>TOLERANCE : </Text>
          <Text>{sc?.tolerance}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>PARTIAL SHIPMENT : </Text>
          <Text>{sc?.partialShipment}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>TRANS SHIPMENT :</Text>
          <Text>{sc?.transShipment}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>PORT OF DISCHARGE : </Text>
          <Text>{sc?.portDischarge}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>PORT OF DELIVERY : </Text>
          <Text>{sc?.finalDest}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>PORT OF LOADING : </Text>
          <Text>{sc?.portLoading}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>LATEST DATE OF SHIPMENT : </Text>
          <Text>{sc?.latestShipDate}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>DATE AND PLACE OF EXPIRY : </Text>
          <Text>{sc?.expiryDate}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>NEGOTIATING BANK : </Text>
          <Text>{sc?.negotiatingBank}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>INSURANCE : </Text>
          <Text>{sc?.insurance}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termKey}>SPECIAL CONDITION : </Text>
          <Text>{sc?.specialCondition}</Text>
        </View>
        <Text style={{ fontWeight: "bold", marginTop: 8, fontSize: 7 }}>
          DOCUMENTS REQUIRED:
        </Text>
        <Text style={{ fontSize: 7 }}>{sc?.docRequired}</Text>

        <Text style={{ fontWeight: "bold", marginTop: 8, fontSize: 7 }}>
          LATE DELIVERY CLAUSE:
        </Text>
        <Text style={styles.blockText}>{sc?.lateClause}</Text>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.sigBox}>
            <View style={styles.dottedLine}></View>
            <Text style={{ fontWeight: "bold" }}>{settings?.companyName}</Text>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.dottedLine}></View>
            <Text>SALES CONTRACT</Text>
            <Text>Purchase Order No.{sc?.scNumber}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
