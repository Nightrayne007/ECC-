import { COLORS } from "../constants/theme.js";

export const INTEL_ITEMS = [
  {
    id: 5, date: "26 Mar 2026", source: "TGA",
    title: "TGA confirms quarterly compliance reviews for medicinal cannabis from FY2026-27",
    summary: "Medicinal cannabis has been named a top-tier focus area in the TGA's 2026-27 Compliance Priorities. Cultivation and manufacturing licence holders will move from annual assessments to quarterly desk audits from 1 July 2026 — the most intense review cadence since legalisation in 2016.",
    tag: "Deadline", tagColor: COLORS.danger,
  },
  {
    id: 6, date: "20 Mar 2026", source: "TGA",
    title: "TGO 93 rewrite progresses: GMP-equivalent imports, child-resistant packaging proposed",
    summary: "Consultation on reforms to medicinal cannabis manufacturing, labelling and packaging requirements has closed. TGA is drafting an updated Therapeutic Goods Order No. 93 introducing GMP-equivalence for imported products and mandatory child-resistant closures; transition periods are still being finalised.",
    tag: "Regulatory", tagColor: COLORS.warning,
  },
  {
    id: 1, date: "25 Mar 2026", source: "Office of Drug Control",
    title: "ODC confirms 32 active cultivation facilities across Australia",
    summary: "Queensland leads with 11 permits, Victoria follows with 10. 39 licenced holders remain without a cultivation permit. 12 applications under active consideration.",
    tag: "Market Data", tagColor: COLORS.purple,
  },
  {
    id: 2, date: "18 Mar 2026", source: "TGA",
    title: "Updated GMP guidelines for medicinal cannabis manufacturers",
    summary: "TGA has released updated manufacturing guidance affecting record-keeping obligations for cultivation-to-manufacture supply chains.",
    tag: "Regulatory", tagColor: COLORS.warning,
  },
  {
    id: 3, date: "12 Mar 2026", source: "Narcotic Drugs Act",
    title: "Reminder: Quarterly adverse event reporting windows",
    summary: "Q2 2026 adverse event reports due by 15 July. Ensure all cultivation incidents logged in your QMS are included.",
    tag: "Deadline", tagColor: COLORS.danger,
  },
  {
    id: 4, date: "5 Mar 2026", source: "Dept. of Health",
    title: "Fiji sugar industry cross-border supply chain opportunity",
    summary: "Pacific region regulatory harmonisation discussions continuing. AU cultivators exploring export pathways to Pacific markets.",
    tag: "Opportunity", tagColor: COLORS.success,
  },
];
