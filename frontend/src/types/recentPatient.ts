export interface RecentlyViewedPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  sex: string;
  date?: string;
  classLabel?: string;
  biologicalNature?: string;
  diagnosis: string;
  whoGrade?: string;
  confidence?: number;
  tumorDetected?: boolean;
  imageSrc?: string;
  indication?: string;
  timestamp: number;
}
