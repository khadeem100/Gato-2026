export const frameworks = [
  { label: "Zeefdruk", badge: "Zeefdruk" },
  { label: "Borduren", badge: "Borduren" },
  { label: "DTG Print", badge: "DTGPrint" },
  { label: "Flex Print", badge: "FlexPrint" },
  { label: "Flock Print", badge: "FlockPrint" },
  { label: "Sublimatie", badge: "Sublimatie" },
  { label: "Transfer", badge: "Transfer" },
  { label: "Laser Graveren", badge: "LaserGraveren" },
  { label: "UV Print", badge: "UVPrint" },
  { label: "Textiel", badge: "Textiel" },
  { label: "Promotie", badge: "Promotie" },
] satisfies {
  label: string;
  badge: string;
  badgeDark?: string;
}[];
