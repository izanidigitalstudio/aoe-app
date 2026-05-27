type Conference = {
  name?: string;
  date?: string;
  country?: string;
  location?: string;
  focus?: string;
  icon?: string;
  description?: string;
  website?: string;
  attendees?: string;
  passed?: boolean;
  isLive?: boolean;
  originalDate?: string;
  contactEmail?: string;
  speakerEmail?: string;
  speakerContact?: string;
  delegateInfo?: {
    delegateFee?: string;
    earlyBirdDeadline?: string;
    delegateTypes?: string[];
    includes?: string[];
  };
};

export type ProcessedConference = Conference;

export const COUNTRIES: string[] = ['All'];
export const CONFERENCES: ProcessedConference[] = [];

const conferences: ProcessedConference[] = [];
export default conferences;