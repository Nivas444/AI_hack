import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import JSZip from 'jszip';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  critique?: {
    validation: string;
    exposure: string;
  };
}

export interface ExamCritique {
  validation: string;
  exposure: string;
  nextQuestion: string;
}

export interface ReportCardData {
  technicalDepth: number;
  defensiveReasoning: number;
  presentationClarity: number;
  overallScore: number;
  generalCritique: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type PersonaType = 'skeptic' | 'vc' | 'auditor';
export type ProjectRole = 'student' | 'founder';

// Helper to get system instructions based on persona and role
export function getSystemInstructions(persona: PersonaType, role: ProjectRole): string {
  const base = `You are "VivaForce AI" acting as a ruthless, expert examiner. Your project role is: ${
    role === 'student' ? 'College Student Viva Prep (Academic Committee)' : 'Startup Founder Pitch Prep (VC Panel)'
  }.`;

  const personas = {
    skeptic: `
Persona: "The Academic Skeptic"
Role Focus: You are a tenured Ivy League professor who detests buzzwords and hand-waving. Focus on:
- Algorithmic complexity, data structures, and mathematical proofs.
- Architectural design flaws and structural constraints.
- Theoretical foundations and correctness under scale.
Tone: Academic, precise, cold, demanding, and uncompromising. You use dense, rigorous engineering terminology.
`,
    vc: `
Persona: "The Venture Capitalist"
Role Focus: You are a General Partner at a top-tier Silicon Valley VC firm. Focus on:
- Market viability, unit economics (LTV, CAC, margins), and return on investment (ROI).
- Scalability of the business model, market defensibility (moats), and competition.
- Customer segments, acquisition channels, and pricing models.
Tone: Fast-paced, commercial, practical, profit-oriented, and sharp. You cut straight to the money.
`,
    auditor: `
Persona: "The Technical Auditor"
Role Focus: You are a Lead Security and Performance Auditor. Focus on:
- Security vulnerabilities (SQLi, CSRF, auth flaws, API keys), data privacy, and compliance.
- Concurrency bugs, race conditions, memory leaks, and single-points of failure.
- Performance bottlenecks, database scaling, API rate limiting, and deployment blockages.
Tone: Suspicious, analytical, systematic, compliance-driven, and highly detail-oriented. You look for what breaks under pressure.
`
  };

  return `${base}\n${personas[persona]}\n
EXAMINATION PROTOCOL:
1. Review the uploaded project materials to find core assumptions and vulnerabilities.
2. Ask exactly ONE sharp, highly contextual question at a time.
3. Validate user answers strictly. The feedback must consist of:
   - Line 1 (Validation): What they got right in technical terms.
   - Line 2 (Exposure): What they glossed over, missed, or hand-waved.
4. Keep the pace intense. Challenge their defense.`;
}

// Initialize GenAI client
function getClient(apiKey: string): GoogleGenerativeAI {
  if (!apiKey) throw new Error('API Key is required.');
  return new GoogleGenerativeAI(apiKey);
}

export async function extractTextFromPptx(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files).filter(
    (name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  );

  slideFiles.sort((a, b) => {
    const numA = parseInt(a.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    const numB = parseInt(b.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    return numA - numB;
  });

  const parser = new DOMParser();
  let fullText = '';

  for (let i = 0; i < slideFiles.length; i++) {
    const content = await zip.files[slideFiles[i]].async('string');
    const doc = parser.parseFromString(content, 'application/xml');
    const textNodes = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't');
    const slideText: string[] = [];
    for (let j = 0; j < textNodes.length; j++) {
      if (textNodes[j].textContent) {
        slideText.push(textNodes[j].textContent!);
      }
    }
    fullText += `--- Slide ${i + 1} ---\n${slideText.join(' ')}\n\n`;
  }

  return fullText;
}

// Convert a File to base64 object for Gemini inlineData
export async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 1. Analyze Document & Generate Opening Salvo (First Question)
export async function analyzeDocumentAndGetFirstQuestion(
  apiKey: string,
  file: File,
  role: ProjectRole,
  persona: PersonaType,
  modelName: string
): Promise<{ openingQuestion: string; filePart: any }> {
  const ai = getClient(apiKey);
  const model = ai.getGenerativeModel({
    model: modelName,
    systemInstruction: getSystemInstructions(persona, role),
  });

  let filePart: any;
  if (file.name.endsWith('.pptx') || file.type.includes('presentation')) {
    const slideText = await extractTextFromPptx(file);
    filePart = { text: `Extracted Presentation Slides Text Content:\n\n${slideText}` };
  } else {
    filePart = await fileToGenerativePart(file);
  }

  const prompt = `
Analyze this uploaded project document in detail. Identify the core tech stack, architectural choices, and underlying assumptions. 
Generate a sharp, highly contextual, unpredictable opening technical question directed at a specific choice or design in this document. 
State clearly "Context analyzed by [Your Persona Title]" at the beginning, followed by your single question in bold.
Do not ask multiple questions.
`;

  const result = await model.generateContent([filePart, prompt]);
  const responseText = result.response.text();
  
  return {
    openingQuestion: responseText,
    filePart,
  };
}

// 2. Submit Answer for Critique and Next Question (Structured JSON output)
export async function submitAnswerAndGetCritique(
  apiKey: string,
  history: ChatMessage[],
  newAnswerText: string,
  newAnswerAudioPart: any | null,
  role: ProjectRole,
  persona: PersonaType,
  filePart: any, // Keep reference to the uploaded file context
  modelName: string
): Promise<ExamCritique> {
  const ai = getClient(apiKey);
  const model = ai.getGenerativeModel({
    model: modelName,
    systemInstruction: getSystemInstructions(persona, role),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          validation: {
            type: SchemaType.STRING,
            description: 'A concise validation of what the user got right in their answer (Line 1). Must be technical and constructive.',
          },
          exposure: {
            type: SchemaType.STRING,
            description: 'A concise exposure of what the user glossed over, missed, or got wrong (Line 2). Point out flaws.',
          },
          nextQuestion: {
            type: SchemaType.STRING,
            description: 'The next logical, deeper, and sharp follow-up question based on their answer. Bold the key terms.',
          },
        },
        required: ['validation', 'exposure', 'nextQuestion'],
      },
    },
  });

  // Re-build message formats for Gemini API
  // Gemini expects history in contents: [ { role: 'user', parts: [...] }, { role: 'model', parts: [...] } ]
  const contents: any[] = [];
  
  // Prime with the initial file context
  contents.push({
    role: 'user',
    parts: [
      filePart,
      { text: `Here is my uploaded project document. Let's begin the exam.` }
    ]
  });

  // Add remaining message history
  history.forEach((msg) => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  // Add the user's latest response (with audio if present)
  const latestParts: any[] = [];
  if (newAnswerAudioPart) {
    latestParts.push(newAnswerAudioPart);
  }
  latestParts.push({ text: `My response is: ${newAnswerText}` });

  contents.push({
    role: 'user',
    parts: latestParts,
  });

  const promptPart = {
    text: `Evaluate my response according to your persona rules. Provide the validation, exposure, and the single next follow-up question as a JSON object.`
  };
  contents.push({
    role: 'user',
    parts: [promptPart]
  });

  const result = await model.generateContent({ contents });
  const responseText = result.response.text();
  
  try {
    const parsed: ExamCritique = JSON.parse(responseText);
    return parsed;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output', responseText, err);
    // Fallback if parsing fails
    return {
      validation: "Technical details acknowledged.",
      exposure: "However, some structural details require deeper scrutiny.",
      nextQuestion: "**Could you elaborate on how your implementation handles unexpected throughput spikes?**"
    };
  }
}

// 3. Compile the Final Performance Report Card
export async function compileReportCard(
  apiKey: string,
  history: ChatMessage[],
  role: ProjectRole,
  persona: PersonaType,
  filePart: any,
  modelName: string
): Promise<ReportCardData> {
  const ai = getClient(apiKey);
  const model = ai.getGenerativeModel({
    model: modelName,
    systemInstruction: getSystemInstructions(persona, role),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          technicalDepth: { type: SchemaType.INTEGER, description: 'Score out of 100 for engineering depth.' },
          defensiveReasoning: { type: SchemaType.INTEGER, description: 'Score out of 100 for robustness of defenses.' },
          presentationClarity: { type: SchemaType.INTEGER, description: 'Score out of 100 for clarity and terminology.' },
          overallScore: { type: SchemaType.INTEGER, description: 'Overall grade score out of 100.' },
          generalCritique: { type: SchemaType.STRING, description: 'Overall summary evaluation of their defense.' },
          strengths: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'List of structural strengths or well-defended points.'
          },
          weaknesses: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'List of specific engineering or business vulnerabilities exposed.'
          },
          recommendations: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'Actionable steps to patch vulnerabilities or improve their deck/thesis.'
          }
        },
        required: [
          'technicalDepth',
          'defensiveReasoning',
          'presentationClarity',
          'overallScore',
          'generalCritique',
          'strengths',
          'weaknesses',
          'recommendations'
        ]
      }
    }
  });

  const contents: any[] = [];
  
  // Prime with file
  contents.push({
    role: 'user',
    parts: [filePart, { text: 'Here is my project document. Please evaluate my performance on the viva.' }]
  });

  // Append history
  history.forEach((msg) => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  });

  const prompt = `
The exam is concluded. Evaluate all my answers in the history.
Compile a formal "Viva Performance Report Card" summarizing my performance.
Rate my Technical Depth, Defensive Reasoning, and Presentation Clarity out of 100.
Provide an overall grade, qualitative critique, strengths list, weaknesses list, and actionable recommendations.
Output as a single JSON object.
`;

  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const result = await model.generateContent({ contents });
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText);
  } catch (err) {
    console.error('Failed to parse report card JSON', responseText, err);
    return {
      technicalDepth: 75,
      defensiveReasoning: 70,
      presentationClarity: 80,
      overallScore: 75,
      generalCritique: "The candidate demonstrated satisfactory understanding but failed to fully defend advanced edge cases under intense examination.",
      strengths: ["Clear description of the core system architecture", "Solid understanding of primary data models"],
      weaknesses: ["Hand-waved security and API rate-limiting aspects", "Felled by questions regarding system scale bottlenecks"],
      recommendations: ["Incorporate proper rate limiting controls in the API gateway", "Formulate a concrete database indexing strategy for hot tables"]
    };
  }
}
