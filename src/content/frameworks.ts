export const frameworks = [
  { label: "Zeefdruk", badge: "SOC2_TYPE1" },
  { label: "Borduren", badge: "SOC2_TYPE2" },
  { label: "DTG Print", badge: "SOC3" },
  { label: "Flex Print", badge: "ISO27001", badgeDark: "ISO27001_dark" },
  { label: "Flock Print", badge: "ISO27701", badgeDark: "ISO27701_dark" },
  { label: "Sublimatie", badge: "ISO42001", badgeDark: "ISO42001_dark" },
  { label: "Transfer", badge: "JetDePierre" },
  { label: "Laser Graveren", badge: "CCPA" },
  { label: "UV Print", badge: "HIPAA" },
  { label: "Textiel", badge: "FERPA" },
  { label: "Promotie", badge: "CASA" },
] satisfies {
  label: string;
  badge: string;
  badgeDark?: string;
}[];
