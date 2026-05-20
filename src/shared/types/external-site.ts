export const SERVICE_TYPES = [
  "X",
  "Instagram",
  "Zenn",
  "SpeakerDeck",
  "GitHub",
  "YouTube",
  "image",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export type ExternalSite = {
  id: string;
  name: string;
  accountName: string;
  url: string;
  type: ServiceType;
  iconFile?: string;
  showOnTop: boolean;
};
