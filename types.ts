
export interface RoadmapItem {
  month: string;
  task: string;
  impact: string;
}

export interface Course {
  title: string;
  platform: string;
  url: string;
  reason: string;
}

export interface RadarData {
  labels: string[];
  values: number[];
}

export interface UserData {
  skills: string[];
  projectsCount: number;
  internshipsCount: number;
  certificationsCount: number; 
  courseraCourses: string[]; 
  linkedinUrl: string;
  linkedinSummary: string;
  githubUrl: string;
  gpa: number;
  leadershipTypes: string[]; 
  experienceRoles: string[]; 
  resumeUploaded: boolean;
  resumeBase64?: string; 
  resumeMimeType?: string; 
  targetRole: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

export interface ScoreBreakdown {
  total: number;
  skills: number;
  projects: number;
  internships: number;
  coursera: number;
  linkedin: number;
  github: number;
  resume: number; 
  academics: number; 
}

export interface CareerOpportunity {
  id: number;
  role: string;
  company: string;
  type: 'Internship' | 'Full-time' | 'Contract';
  minScoreReq: number;
  skillsReq: string[];
  description: string;
  sourceUrl: string;
  locationInfo?: string;
}

export interface AnalysisResult {
  score: ScoreBreakdown;
  radarData: RadarData;
  verdict: string;
  linkedinInsight: string;
  githubInsight: string;
  resumeInsight: string;
  linkedinBioEdit: string;
  resumeEdits: string[];
  githubActionItems: string[];
  missingSkills: string[];
  salaryRange: string;
  roadmap: RoadmapItem[];
  recommendedCourses: Course[];
  linkedinVerified: boolean;
  githubVerified: boolean;
  generatedOpportunities: CareerOpportunity[]; 
  groundingLinks?: { title: string, uri: string }[];
}

export interface UserAccount {
  email: string;
  password?: string;
  profile: UserData | null;
  analysis: AnalysisResult | null;
  savedOpportunities?: CareerOpportunity[];
  appliedOpportunities?: CareerOpportunity[];
}
