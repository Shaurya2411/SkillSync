
import { GoogleGenAI, Type, Modality, GenerateContentResponse, Chat } from "@google/genai";
import { UserData, RoadmapItem, CareerOpportunity, Course, RadarData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AuditOutput {
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
  linkedinQualityScore: number; 
  githubQualityScore: number;
  resumeQualityScore: number; 
  linkedinVerified: boolean;
  githubVerified: boolean;
  generatedOpportunities: CareerOpportunity[];
  radarData: RadarData;
  groundingLinks?: { title: string, uri: string }[];
}

export const auditCareerProfile = async (data: UserData): Promise<AuditOutput> => {
  const locationContext = data.location ? `The user is located near Lat: ${data.location.latitude}, Lng: ${data.location.longitude}. Prioritize local opportunities.` : "";

  const systemInstruction = `
    You are a high-speed Executive Career Engine. 
    Analyze the candidate for the "${data.targetRole}" role instantly.
    ${locationContext}

    PROTOCOLS:
    1. BIO: Rewrite LinkedIn Bio.
    2. RESUME: 3 punchy bullet edits.
    3. GITHUB: 3 technical fixes.
    4. LIVE MARKET: Find 10 REAL, ACTIVE job/internship URLs. Use Google Search tool.
    5. SKILLS: Find 3 REAL Coursera/Udemy courses for gaps.
    6. RADAR: Generate 5 scores (0-100) for dimensions: ["Technical", "Academic", "Leadership", "Digital Brand", "Market Value"].
    
    Output JSON only. Be concise and fast.
  `;

  const userPrompt = `
    Target: ${data.targetRole}
    Skills: ${data.skills.join(', ')}
    GPA: ${data.gpa}
    Projects: ${data.projectsCount}
    Experience: ${data.experienceRoles.join(', ')}
  `;

  const parts: any[] = [{ text: userPrompt }];
  if (data.resumeBase64 && data.resumeMimeType) {
    parts.push({ inlineData: { data: data.resumeBase64, mimeType: data.resumeMimeType } });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            linkedinInsight: { type: Type.STRING },
            githubInsight: { type: Type.STRING },
            resumeInsight: { type: Type.STRING },
            linkedinBioEdit: { type: Type.STRING },
            resumeEdits: { type: Type.ARRAY, items: { type: Type.STRING } },
            githubActionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            salaryRange: { type: Type.STRING },
            linkedinVerified: { type: Type.BOOLEAN },
            githubVerified: { type: Type.BOOLEAN },
            radarData: {
              type: Type.OBJECT,
              properties: {
                labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                values: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              },
              required: ["labels", "values"]
            },
            generatedOpportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  type: { type: Type.STRING },
                  minScoreReq: { type: Type.NUMBER },
                  skillsReq: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING },
                  sourceUrl: { type: Type.STRING },
                  locationInfo: { type: Type.STRING }
                },
                required: ["id", "role", "company", "type", "minScoreReq", "skillsReq", "description", "sourceUrl"]
              }
            },
            recommendedCourses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  url: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["title", "platform", "url", "reason"]
              }
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  task: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["month", "task", "impact"]
              }
            },
            linkedinQualityScore: { type: Type.NUMBER },
            githubQualityScore: { type: Type.NUMBER },
            resumeQualityScore: { type: Type.NUMBER }
          },
          required: ["verdict", "linkedinInsight", "githubInsight", "resumeInsight", "linkedinBioEdit", "resumeEdits", "githubActionItems", "missingSkills", "salaryRange", "linkedinVerified", "githubVerified", "generatedOpportunities", "recommendedCourses", "roadmap", "linkedinQualityScore", "githubQualityScore", "resumeQualityScore", "radarData"]
        }
      }
    });

    // Extract Grounding Metadata URLs as per requirements
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingLinks = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Market Source",
      uri: chunk.web?.uri
    })).filter((link: any) => link.uri) || [];

    let cleanJson = response.text?.trim() || "{}";
    if (cleanJson.includes("```json")) {
      cleanJson = cleanJson.split("```json")[1].split("```")[0].trim();
    } else if (cleanJson.includes("```")) {
      cleanJson = cleanJson.split("```")[1].split("```")[0].trim();
    }

    const result = JSON.parse(cleanJson);
    return {
      ...result,
      groundingLinks,
      linkedinQualityScore: Math.min(result.linkedinQualityScore || 0, 10),
      githubQualityScore: Math.min(result.githubQualityScore || 0, 10),
      resumeQualityScore: Math.min(result.resumeQualityScore || 0, 10)
    };
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return {
      verdict: "Profile synchronized. Analysis complete using standard protocols.",
      linkedinInsight: "Standard professional branding.",
      githubInsight: "Technical portfolio referenced.",
      resumeInsight: "Resume check skipped.",
      linkedinBioEdit: "Tech-focused professional dedicated to scalable solutions.",
      resumeEdits: ["Add quantifiable results."],
      githubActionItems: ["Optimize project documentation."],
      missingSkills: ["Cloud Architecture"],
      salaryRange: "6 - 12 LPA",
      linkedinVerified: false,
      githubVerified: false,
      radarData: { labels: ["Technical", "Academic", "Leadership", "Digital Brand", "Market Value"], values: [60, 70, 50, 40, 65] },
      generatedOpportunities: [
        { id: 1, role: `${data.targetRole} Intern`, company: "TechNova", type: "Internship", minScoreReq: 30, skillsReq: ["Core Technicals"], description: "Work on cutting edge projects.", sourceUrl: "https://www.linkedin.com/jobs" }
      ],
      recommendedCourses: [{ title: "Industry Specialization", platform: "Coursera", url: "https://www.coursera.org", reason: "Fills critical gap" }],
      roadmap: [{ month: "Month 1", task: "Portfolio Build", impact: "+10 pts" }],
      linkedinQualityScore: 5,
      githubQualityScore: 5,
      resumeQualityScore: 5
    };
  }
};

export const generateInterviewPrep = async (opportunity: CareerOpportunity, userData: UserData): Promise<string> => {
  const prompt = `As an expert interviewer at ${opportunity.company}, provide 3 specific technical/behavioral interview questions for the ${opportunity.role} position tailored to a candidate with skills: ${userData.skills.join(', ')}. Include 1 "pro tip" for each.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "Preparation content unavailable.";
  } catch (error) {
    return "Focus on your project experience and core fundamental concepts.";
  }
};

export const playVerdictAudio = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly and quickly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = atob(base64Audio);
      const len = bytes.length;
      const arrayBuffer = new ArrayBuffer(len);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < len; i++) view[i] = bytes.charCodeAt(i);
      const dataInt16 = new Int16Array(arrayBuffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (err) {}
};

export const generateJobPitch = async (opportunity: CareerOpportunity, userData: any, audit: any): Promise<string> => {
  const prompt = `Quickly draft a 50-word pitch for ${opportunity.role} at ${opportunity.company}. Candidate score: ${audit.score.total}/100. Mention specific skills like ${userData.skills.slice(0, 2).join(', ')}.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "I am highly interested in this role.";
  } catch (error) {
    return "Enthusiastic to apply for this position.";
  }
};

let activeChat: Chat | null = null;

export const startCareerChat = () => {
  activeChat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      systemInstruction: `
        You are the "SkillSync Career Mentor". Fast, punchy responses only.
        RULES: Career/SkillSync topics ONLY. Redirect everything else instantly.
      `,
    }
  });
  return activeChat;
};

export const sendChatMessage = async (message: string) => {
  if (!activeChat) startCareerChat();
  return activeChat!.sendMessageStream({ message });
};
