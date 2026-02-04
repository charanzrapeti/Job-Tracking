
export enum JobStatus {
  APPLIED = 'Applied',
  REJECTED = 'Rejected',
  WATCHLIST = 'Watchlist',
  INTERVIEW = 'Interview scheduled',
  SUCCESS = 'Success'
}

export enum JobType {
  WERKSTUDENT = 'Werkstudent',
  PART_TIME = 'Part-time',
  FULL_TIME = 'Full-time',
  INTERNSHIP = 'Uni-internship'
}

export interface JobApplication {
  id: string;
  dateApplied: string;
  jobTitle: string;
  companyName: string;
  url: string;
  status: JobStatus;
  resumeName: string;
  hasCoverLetter: boolean;
  coverLetterName?: string;
  coverLetterContent?: string;
  type: JobType;
}

export interface AppStats {
  total: number;
  applied: number;
  rejected: number;
  interviewing: number;
  success: number;
}
