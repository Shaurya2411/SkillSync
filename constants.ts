
export const CAREER_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Mobile App Developer",
  "Data Scientist",
  "AI/ML Engineer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Cloud Architect",
  "Product Manager",
  "UX/UI Designer",
  "Data Engineer",
  "QA Automation Engineer",
  "Embedded Systems Engineer",
  "Blockchain Developer",
  "Game Developer",
  "AR/VR Developer",
  "Site Reliability Engineer (SRE)",
  "Business Analyst",
  "Solutions Architect",
  "Technical Writer",
  "Digital Marketer",
  "Financial Analyst"
];

export interface Milestone {
  id: string;
  label: string;
  icon: string;
  category: 'Professional' | 'Leadership' | 'Academic';
}

export const MILESTONE_LIBRARY: Milestone[] = [
  // Professional
  { id: 'freelance', label: 'Freelance Developer', icon: 'code', category: 'Professional' },
  { id: 'intern', label: 'Corporate Intern', icon: 'corporate_fare', category: 'Professional' },
  { id: 'hackathon', label: 'Hackathon Finalist', icon: 'emoji_events', category: 'Professional' },
  { id: 'opensource', label: 'Open Source Contributor', icon: 'hub', category: 'Professional' },
  { id: 'parttime', label: 'Part-time Employee', icon: 'work', category: 'Professional' },
  { id: 'workshop', label: 'Workshop Facilitator', icon: 'groups', category: 'Professional' },
  
  // Leadership
  { id: 'founder', label: 'Entrepreneurial Founder', icon: 'rocket_launch', category: 'Leadership' },
  { id: 'club', label: 'Academic Club Lead', icon: 'leaderboard', category: 'Leadership' },
  { id: 'volunteer', label: 'Volunteer Coordinator', icon: 'volunteer_activism', category: 'Leadership' },
  { id: 'sports', label: 'Sports Team Captain', icon: 'sports_soccer', category: 'Leadership' },
  { id: 'pro_org', label: 'Professional Org Chair', icon: 'account_balance', category: 'Leadership' },
  { id: 'community', label: 'Community Organizer', icon: 'public', category: 'Leadership' },

  // Academic
  { id: 'research', label: 'Research Assistant', icon: 'science', category: 'Academic' },
  { id: 'teaching', label: 'Teaching Assistant', icon: 'school', category: 'Academic' },
  { id: 'tutor', label: 'Tech Tutor', icon: 'menu_book', category: 'Academic' },
  { id: 'fellow', label: 'Academic Fellow', icon: 'workspace_premium', category: 'Academic' },
];

export const PRIMARY_COLOR = "#0df259";
export const BACKGROUND_DARK = "#102216";
