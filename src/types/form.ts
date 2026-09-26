export interface FormData {
  fullName: string;
  contactNumber: string;
  city: string;
  achieveSoonest: string[];
  otherAchieve: string;
  challenges: string;
  expectations: string;
  additionalInfo: string;
}

export interface SubmissionRecord extends FormData {
  id: string;
  submittedAt: string;
  syncedToSheet?: boolean;
}

export interface FormConfig {
  googleSheetWebhookUrl: string;
  syncToGoogleForm: boolean;
  headerImageUrl?: string;
  updatedAt?: string;
}
