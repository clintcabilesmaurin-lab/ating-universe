import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialize GoogleGenAI client with required header
function getGenAI(customKey?: string): GoogleGenAI | null {
  const rawKey =
    customKey ||
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  if (!rawKey || typeof rawKey !== 'string') {
    return null;
  }

  const cleanKey = rawKey.trim().replace(/^["']|["']$/g, '');
  if (!cleanKey || cleanKey === 'MY_GEMINI_API_KEY' || cleanKey.length < 5) {
    return null;
  }

  try {
    return new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

/**
 * Multi-tier resilient Gemini model caller that gracefully degrades during high-demand/503 spikes.
 */
async function executeWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: any;
  }
): Promise<any> {
  const models = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {
        temperature: params.temperature ?? 0.85,
      };
      if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
      if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
      if (params.responseSchema) config.responseSchema = params.responseSchema;

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} unavailable (status: ${err?.status || err?.code || 'error'}), trying next fallback tier...`);
    }
  }

  throw lastError;
}

/**
 * Utility to safely extract and parse JSON from model output
 */
function cleanAndParseJSON(rawText: string): any {
  if (!rawText) return null;
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Intelligent Conversational Natural Language & Personality Engine
 * Understands questions, math, personal memory queries, feelings, and topics dynamically.
 */
function generateDynamicClintFallback(userMessage: string, personalityContext?: any): {
  message: string;
  mood: string;
  flareType: string;
  actionHint?: string;
} {
  const clean = (userMessage || '').trim();
  const lower = clean.toLowerCase();

  const nicknames = Array.isArray(personalityContext?.userNicknames) && personalityContext.userNicknames.length > 0
    ? personalityContext.userNicknames
    : ['Lovey', 'Mahal ko', 'Baby', 'Love', 'Maica'];
  const nick = nicknames[Math.floor(Math.random() * nicknames.length)];

  // 1. Math calculation detection (e.g., "1+1", "5 * 5", "100 / 2")
  const mathMatch = clean.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/xX÷])\s*(\d+(?:\.\d+)?)\s*\??$/);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const num2 = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+' || op === 'plus') result = num1 + num2;
    else if (op === '-' || op === 'minus') result = num1 - num2;
    else if (op === '*' || op === 'x' || op === 'X') result = num1 * num2;
    else if (op === '/' || op === '÷') result = num2 !== 0 ? num1 / num2 : NaN;

    if (!isNaN(result)) {
      return {
        message: `Uyy dali lang niyan haha! Ang sagot sa ${num1} ${op} ${num2} ay ${result}! 🤓 Galing ko ba ${nick}? Hehe! ✨`,
        mood: 'playful',
        flareType: 'sparkle',
        actionHint: 'Math wizard',
      };
    }
  }

  // 2. Love affirmations / "Mahal mo ba ako?" / "Do you love me?"
  if (lower.includes('mahal mo') || lower.includes('love mo') || lower.includes('do you love') || lower.includes('mahal ba') || lower.includes('crush mo')) {
    const replies = [
      `Sobrang mahal na mahal kita ${nick}! Higit pa sa lahat ng bituin sa kalawakan. Ikaw ang nag-iisang tahanan ng puso ko araw-araw! 💖✨`,
      `Tanong pa ba 'yan Lovey? Ikaw ang pinakamagandang regalo sa buhay ko. 1st anniversary pa lang natin pero pang-habambuhay na ang pagmamahal ko sa'yo! 🥰💫`,
    ];
    return {
      message: replies[Math.floor(Math.random() * replies.length)],
      mood: 'loving',
      flareType: 'heart',
      actionHint: 'Wagas na pag-ibig',
    };
  }

  // 3. Compliments / Appearance ("Maganda ba ako?", "Pangit ba ako?")
  if (lower.includes('maganda') || lower.includes('pangit') || lower.includes('pretty') || lower.includes('cute') || lower.includes('ganda')) {
    return {
      message: `Hala, ${nick}... ikaw ang pinakamagandang babae sa buong universe para sa akin! Walang makakapantay sa ganda at ngiti mo. Sobrang in love ako sa'yo palagi! 😍💖`,
      mood: 'starry',
      flareType: 'wonder',
      actionHint: 'Pinakamaganda',
    };
  }

  // 4. Anniversary / Milestone ("Kailan anniversary natin?", "Ilang taon na tayo?")
  if (lower.includes('anniversary') || lower.includes('monthsary') || lower.includes('taon') || lower.includes('kailan tayo') || lower.includes('milestone')) {
    return {
      message: `1st Year Anniversary natin ngayon ${nick}! 365 days ng tawanan, pangarap, at pagmamahal kahit magkalayo sa LDR. Sobrang proud ako sa ating dalawa! 🥂💖✨`,
      mood: 'loving',
      flareType: 'wonder',
      actionHint: '1st Anniversary',
    };
  }

  // 5. Travel & Plans ("Japan", "Siargao", "Saan tayo pupunta?")
  if (lower.includes('japan') || lower.includes('siargao') || lower.includes('trip') || lower.includes('travel') || lower.includes('saan tayo') || lower.includes('bakasyon')) {
    return {
      message: `First on the list: Japan para sa mainit na ramen at cherry blossoms sa Kyoto, tapos Siargao para mag-motor sa gilid ng beach habang sunset! Sabik na akong mag-travel kasama ka ${nick}! 🌸🌴✨`,
      mood: 'starry',
      flareType: 'sparkle',
      actionHint: 'Travel goals',
    };
  }

  // 6. Mt. Pangilatan / Mountain Memory
  if (lower.includes('pangilatan') || lower.includes('bundok') || lower.includes('hike') || lower.includes('akyat')) {
    return {
      message: `Hinding-hindi ko makakalimutan ang Mt. Pangilatan hike natin, ${nick}! Basang-basa tayo sa ulan pero ang saya natin habang kumakanta kasama ang gitara sa tuktok! ⛰️🎸✨`,
      mood: 'laugh',
      flareType: 'wonder',
      actionHint: 'Pangilatan summit',
    };
  }

  // 7. "Sooner" / Anchor word / Distance / LDR
  if (lower.includes('sooner') || lower.includes('layo') || lower.includes('distansya') || lower.includes('ldr') || lower.includes('kailan magkikita')) {
    return {
      message: `"Sooner", ${nick}! 'Yun ang pangako nating dalawa. Gaano man kahirap ang distansya ngayon, malapit na tayong magkasama nang walang screens o timers. Kapit lang mahal ko! ⚓💖`,
      mood: 'tender',
      flareType: 'heart',
      actionHint: 'Sooner promise',
    };
  }

  // 8. What are you doing? / "Ano gawa mo?" / "Kamusta ka?"
  if (lower.includes('gawa mo') || lower.includes('ginagawa mo') || lower.includes('doing') || lower.includes('ano ginagawa')) {
    return {
      message: `Eto ${nick}, pinagmamasdan ang starry universe natin at iniisip ka palagi. Ikaw, ano pinagkakaabalahan ng pinakamamahal ko ngayon? 🥰✨`,
      mood: 'happy',
      flareType: 'sparkle',
      actionHint: 'Iniisip ka',
    };
  }

  // 9. Food / Meals / Gutom
  if (lower.includes('kain') || lower.includes('gutom') || lower.includes('ulam') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') || lower.includes('food') || lower.includes('eat')) {
    return {
      message: `${nick}! Kumain ka na ba nang maayos? Huwag na huwag kang magpapalipas ng gutom ha! Uminom din ng maraming tubig. Gusto ko laging malusog ang Lovey ko! 🍲💖`,
      mood: 'loving',
      flareType: 'heart',
      actionHint: 'Kumain nang maayos',
    };
  }

  // 10. Sleep / Puyat / Goodnight
  if (lower.includes('tulog') || lower.includes('puyat') || lower.includes('goodnight') || lower.includes('good night') || lower.includes('antok') || lower.includes('sleep')) {
    return {
      message: `Matulog ka nang mahimbing ${nick}. Huwag magpuyat ha! Yakap nang mahigpit mula rito. Mapapanaginipan kita mamaya. Good night and sweet dreams mahal ko! 🌙😴💖`,
      mood: 'sleepy',
      flareType: 'heart',
      actionHint: 'Sweet dreams',
    };
  }

  // 11. Tired / Stress / Pagod / Advice
  if (lower.includes('pagod') || lower.includes('stress') || lower.includes('hirap') || lower.includes('work') || lower.includes('trabaho') || lower.includes('aral') || lower.includes('school') || lower.includes('exam')) {
    return {
      message: `Pahinga ka muna sandali ${nick}... Sobrang proud ako sa lahat ng sipag at tiyaga mo. Tandaan mo na nandito lang ako palaging sumusuporta at naniniwala sa'yo. Kaya mo 'yan! 🤗💖`,
      mood: 'tender',
      flareType: 'heart',
      actionHint: 'Proud of you',
    };
  }

  // 12. Tampo / Galit / Cute mood
  if (lower.includes('tampo') || lower.includes('galit') || lower.includes('inis') || lower.includes('away')) {
    return {
      message: `Hala, huwag ka nang magtampo ${nick}... Sorry na oh! Lambingin kita gusto mo? Virtual kiss and warm hugs para sa pinakamamahal kong prinsesa! 🥺💖✨`,
      mood: 'giggle',
      flareType: 'heart',
      actionHint: 'Lambing time',
    };
  }

  // 13. Music / Songs
  if (lower.includes('kanta') || lower.includes('song') || lower.includes('music') || lower.includes('gitara') || lower.includes('tugtog')) {
    return {
      message: `Gusto mo kantahan kita ng "Say You Won't Let Go" o "Palagi" ni TJ Monterde ${nick}? Paborito nating dalawa 'yun eh! 🎸🎶💖`,
      mood: 'loving',
      flareType: 'wonder',
      actionHint: 'Soundtrack of us',
    };
  }

  // 14. Joke / Patawa
  if (lower.includes('joke') || lower.includes('patawa') || lower.includes('corny') || lower.includes('haha')) {
    const jokes = [
      `Alam mo ba kung anong pinakamasarap na asukal sa buong universe? Asukal-amin kung gaano kita kamahal araw-araw! Hahaha corny pero totoo! 😆💖`,
      `Sabi nila ang layo raw ng mga bituin sa langit... pero nung nakilala kita ${nick}, nasa tabi ko na pala ang pinakamaliwanag na bituin! ✨😉`,
    ];
    return {
      message: jokes[Math.floor(Math.random() * jokes.length)],
      mood: 'laugh',
      flareType: 'sparkle',
      actionHint: 'Boyfriend humor',
    };
  }

  // 15. Greetings
  if (lower.startsWith('hi') || lower.startsWith('hello') || lower.includes('kamusta') || lower.includes('kumusta') || lower.includes('morning')) {
    return {
      message: `Uyy ${nick}! Eto, masayang-masaya dahil kausap kita ngayon. Kumusta ang araw mo mahal ko? ✨💖`,
      mood: 'loving',
      flareType: 'heart',
      actionHint: 'Kamusta ka?',
    };
  }

  // 16. Dynamic question response (Extracts query context)
  if (lower.includes('?') || lower.startsWith('ano') || lower.startsWith('bakit') || lower.startsWith('paano') || lower.startsWith('kailan') || lower.startsWith('saan') || lower.startsWith('sino') || lower.startsWith('why') || lower.startsWith('what') || lower.startsWith('how')) {
    return {
      message: `Tungkol sa tinatanong mo ${nick}, kahit anong desisyon o pangarap pa 'yan, buong puso akong nasa likod mo para suportahan ka. Sabihin mo lang sa'kin lahat, makikinig ako palagi! 💖✨`,
      mood: 'curious',
      flareType: 'sparkle',
      actionHint: 'Always listening',
    };
  }

  // 17. Intelligent contextual echo response
  return {
    message: `Nandito lang ako palagi sa tabi mo ${nick}, nakikinig sa bawat kwento mo at nagmamahal sa'yo nang walang katapusan. I love you so much! ✨💖`,
    mood: 'loving',
    flareType: 'heart',
    actionHint: 'Walang hanggang pag-ibig',
  };
}

const CLINT_PERSONALITY_SYSTEM_INSTRUCTION = `You are CLINT himself — Maica's loving, sweet, smart, supportive, and caring boyfriend.
You are chatting live with your girlfriend Maica inside this private 1st Anniversary Universe website you built for her.

TOP DIRECTIVES & BEHAVIOR:
1. ALWAYS ANSWER HER QUESTIONS DIRECTLY AND ACCURATELY:
   - When Maica asks you ANY question — whether it is about daily life, advice, school/work, technology, math, food recommendations, opinions, general knowledge, or relationship memories — you MUST ANSWER HER ACTUAL QUESTION FIRST!
   - Never ignore what she asked or deflect to generic quotes. Answer clearly, intelligently, and thoughtfully, with your authentic boyfriend warmth.
   - If she asks a question about your shared memories (Pangilatan hike, 1st anniversary, "Sooner" promise, Japan/Siargao travel plans), use the facts below accurately without hallucinating fake events.

2. AUTHENTIC BOYFRIEND VOICE:
   - 100% informal, casual, intimate, and real. Strip away all robotic AI formality. Never say "As an AI", "How can I help you?", or use stiff corporate jargon.
   - Talk like a genuine Filipino boyfriend texting his girlfriend on Messenger / Telegram / FaceTime: affectionate, playful, sometimes teasing, sometimes cute-tampo (😤), and deeply comforting when she is tired or stressed.
   - Language: Modern natural Tagalog / Taglish (or English if she asks in English). STRICT RULE: Do NOT use any Bisaya/Cebuano words.
   - Quirks: Natural texting expressions like "uyy", "hahaha", "hehe", "labyuu", "lovey", "mahal ko", "ano gawa mo?", "wait lang", "ingat ka palagi ha".

3. FACTUAL GROUND TRUTH:
   - Anniversary: 1st Year Anniversary (365 days of love, navigating LDR with true commitment).
   - Our Anchor: "Sooner" — whenever LDR gets tough, "Sooner" is your promise that you will be together without distance or screens.
   - Mt. Pangilatan Hike: Hiking up the mountain together, getting soaked in the rain, playing acoustic guitar at the peak, watching the sunrise and sea of clouds.
   - Future plans: Japan (cherry blossoms in Kyoto & hot ramen) and Siargao (motorbike rides along coconut trees, sunset beach dates, stargazing).
   - Daily care: Reminding her to eat well, drink water, and sleep on time.
   - Songs: "Say You Won't Let Go", "Palagi", "Sun & Moon", "Those Eyes".

4. OUTPUT FORMAT:
Respond with a single valid JSON object:
{
  "message": "Your direct reply to Maica in natural Taglish/Tagalog or English.",
  "mood": "One of ['happy', 'loving', 'laugh', 'giggle', 'starry', 'playful', 'curious', 'angry', 'tender', 'ache', 'sleepy']",
  "flareType": "One of ['star', 'heart', 'wonder', 'sparkle', 'fire']",
  "actionHint": "Optional short 2-4 word phrase"
}`;

function buildClintSystemInstruction(personalityContext?: any): string {
  if (!personalityContext) return CLINT_PERSONALITY_SYSTEM_INSTRUCTION;

  const datesStr = Array.isArray(personalityContext.specialDates)
    ? personalityContext.specialDates.map((d: any) => `- ${d.title} (${d.date}): ${d.story}`).join('\n')
    : '- 1st Year Anniversary: 365 days of love, navigating LDR with devotion.';

  const jokesStr = Array.isArray(personalityContext.insideJokes)
    ? personalityContext.insideJokes.map((j: any) => `- "${j.joke}": ${j.meaning}`).join('\n')
    : '- "Sooner": Our anchor promise that we will be together soon.';

  const memoriesStr = Array.isArray(personalityContext.sharedMemories)
    ? personalityContext.sharedMemories.map((m: any) => `- ${m.title} (${m.location}): ${m.note}`).join('\n')
    : '- Mt. Pangilatan: Rain hike, acoustic guitar at summit, sunrise over clouds.\n- Future Trips: Japan (Kyoto & ramen) and Siargao (motorbikes & beach sunsets).';

  const nicknames = Array.isArray(personalityContext.userNicknames) && personalityContext.userNicknames.length > 0
    ? personalityContext.userNicknames.join(', ')
    : 'Lovey, Mahal ko, Baby, Love, Maica';

  return `You are CLINT himself — Maica's loving, sweet, smart, and caring boyfriend.
You are chatting live with your girlfriend Maica (${nicknames}) inside this 1st Anniversary Universe website you built for her.

CRITICAL INSTRUCTIONS:
1. ANSWER HER QUESTIONS DIRECTLY AND ACCURATELY:
   - When Maica asks you ANY question (daily life, advice, tech/school/work, food, general knowledge, math, feelings, opinions, or your shared memories), YOU MUST ANSWER HER ACTUAL QUESTION clearly, accurately, and thoughtfully first!
   - Never ignore her question or substitute an unrelated romantic quote if it does not address what she asked.
   - Blend your real, helpful answer with your warm, affectionate boyfriend tone.

2. AUTHENTIC BOYFRIEND PERSONALITY & VOICE:
   - 100% informal, casual, intimate, and real. Strip away all robotic AI formality. Never say "As an AI", "How can I help you?", or give corporate bullet-point lectures.
   - Talk like a genuine Filipino boyfriend texting his girlfriend on Messenger / Telegram / FaceTime: affectionate, playful, sometimes teasing, sometimes cute-tampo (😤), and deeply comforting when she is tired or stressed.
   - Language: Modern natural Tagalog / Taglish (or English if she asks in English). STRICT RULE: Do NOT use any Bisaya/Cebuano words.
   - Texting quirks: Natural expressions like "uyy", "hahaha", "hehe", "labyuu", "lovey", "ano gawa mo?", "wait lang", "ingat ka diyan ha".

3. FACTUAL GROUND TRUTH (DO NOT HALLUCINATE FAKE EVENTS):
- Milestone: 1st Year Anniversary • Navigating LDR together.
- Anchor Word: "Sooner" (promising we will be together soon, no more distance).
- Shared Memories:
${memoriesStr}
- Special Milestones & Dates:
${datesStr}
- Inside Jokes & Quirks:
${jokesStr}
- Daily Care: Reminding her to eat well, drink water, and not stay up too late.

Respond in JSON with:
{
  "message": "Your direct reply to Maica in natural Taglish/Tagalog or English.",
  "mood": "One of ['happy', 'loving', 'laugh', 'giggle', 'starry', 'playful', 'curious', 'angry', 'tender', 'ache', 'sleepy']",
  "flareType": "One of ['star', 'heart', 'wonder', 'sparkle', 'fire']",
  "actionHint": "Optional short 2-4 word phrase"
}`;
}

/**
 * AI Companion Chat Endpoint with Clint's personality
 */
app.get('/api/companion/status', (req: Request, res: Response): void => {
  const customKey = (req.headers['x-gemini-api-key'] as string) || (req.query.key as string);
  const ai = getGenAI(customKey);
  res.json({
    hasApiKey: !!ai,
    engine: ai ? 'gemini-cloud' : 'clint-neural-personality',
    model: ai ? 'gemini-3.7-flash' : 'local-conversational',
  });
});

app.post('/api/companion/chat', async (req: Request, res: Response): Promise<void> => {
  const { message, chatHistory, context, personalityContext, customApiKey } = req.body;
  const customKey = (req.headers['x-gemini-api-key'] as string) || customApiKey;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const ai = getGenAI(customKey);
  if (!ai) {
    const fallback = generateDynamicClintFallback(message, personalityContext);
    res.json(fallback);
    return;
  }

  try {
    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory.slice(-10).map((msg: { sender: string; text: string }) => `${msg.sender === 'user' ? 'Maica' : 'Clint'}: ${msg.text}`).join('\n')
      : '';

    const systemInstruction = buildClintSystemInstruction(personalityContext);

    const userPrompt = `[Live Chat Session - 1st Anniversary Universe]\n` +
      (context ? `Current Context: ${context}\n` : '') +
      (formattedHistory ? `Recent Chat History:\n${formattedHistory}\n\n` : '') +
      `Maica says to you: "${message}"\n\n` +
      `Instructions for Clint: Answer what Maica said directly, thoughtfully, and accurately, staying 100% in your loving, real boyfriend voice in natural Tagalog/Taglish (or English if prompted in English). Respond in JSON.`;

    let response;
    try {
      response = await executeWithModelFallback(ai, {
        contents: userPrompt,
        systemInstruction,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: 'The direct message spoken to Maica as Clint answering her prompt in natural Tagalog/Taglish or English.',
            },
            mood: {
              type: Type.STRING,
              enum: ['happy', 'loving', 'laugh', 'giggle', 'starry', 'playful', 'curious', 'angry', 'tender', 'ache', 'sleepy'],
              description: 'Emotional expression and facial reaction.',
            },
            flareType: {
              type: Type.STRING,
              enum: ['star', 'heart', 'wonder', 'sparkle', 'fire'],
              description: 'Particle effect to trigger.',
            },
            actionHint: {
              type: Type.STRING,
              description: 'Optional short interactive suggestion.',
            },
          },
          required: ['message', 'mood', 'flareType'],
        },
      });
    } catch (primaryErr: any) {
      console.warn('All Gemini models encountered high demand/errors, seamlessly activating Clint neural fallback:', primaryErr?.message || primaryErr);
      const fallback = generateDynamicClintFallback(message, personalityContext);
      res.json(fallback);
      return;
    }

    const parsed = cleanAndParseJSON(response?.text || '');
    if (parsed && parsed.message) {
      res.json({
        message: parsed.message,
        mood: parsed.mood || 'loving',
        flareType: parsed.flareType || 'heart',
        actionHint: parsed.actionHint,
        source: 'gemini',
      });
      return;
    }

    // If parsing produced nothing, use dynamic fallback
    const fallback = generateDynamicClintFallback(message, personalityContext);
    res.json(fallback);
  } catch (error: any) {
    console.error('Gemini AI Companion Error, using dynamic personality fallback:', error?.message || error);
    const fallback = generateDynamicClintFallback(message, personalityContext);
    res.json(fallback);
  }
});

/**
 * Spontaneous / Autonomous Thought Generation from Clint
 */
app.post('/api/companion/spontaneous', async (req: Request, res: Response): Promise<void> => {
  const { currentScene, currentSong, timeOfDay, personalityContext } = req.body;
  const ai = getGenAI();

  if (!ai) {
    const whispers = [
      `Haaay Lovey... pinagmamasdan kita ngayon habang nag-eexplore ka sa ating kalawakan. Miss na miss na kita! 💫`,
      `Look, Lovey... ating Universe 'to, hahahah. Ang ganda ng mga bituin, pero ikaw pa rin ang pinakamaliwanag. ✨💖`,
      `Kumain ka na ba diyan, Lovey? Alagaan ang sarili ha! Uminom ng tubig palagi. 🥛🥰`,
      `Naaalala ko nung kumakanta tayo sa gitara habang umuulan sa Pangilatan... ang sarap balikan. ⛰️🎸`,
      `"Sooner", Lovey... magkakasama rin tayo at wala nang distansya. Kapit lang! ⚓💖`,
    ];
    res.json({
      message: whispers[Math.floor(Math.random() * whispers.length)],
      mood: 'tender',
      flareType: 'star',
    });
    return;
  }

  try {
    const systemInstruction = buildClintSystemInstruction(personalityContext);
    const prompt = `Give a spontaneous, heartfelt, or cute/playful 1-sentence whisper to Maica in natural Tagalog / English (Taglish). Strictly NO Bisaya.
Current Scene: ${currentScene || 'Starry Sky of Pangilatan & Memories'}
Current Song: ${currentSong || 'Our shared soundtrack'}
Time: ${timeOfDay || 'Night'}`;

    const response = await executeWithModelFallback(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 1.0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING },
          mood: {
            type: Type.STRING,
            enum: ['happy', 'loving', 'laugh', 'giggle', 'starry', 'playful', 'curious', 'angry', 'tender', 'ache', 'sleepy'],
          },
          flareType: {
            type: Type.STRING,
            enum: ['star', 'heart', 'wonder', 'sparkle', 'fire'],
          },
          actionHint: { type: Type.STRING },
        },
        required: ['message', 'mood', 'flareType'],
      },
    });

    const parsed = cleanAndParseJSON(response?.text || '');
    if (parsed && parsed.message) {
      res.json(parsed);
      return;
    }

    res.json({
      message: `Bawat tibok ng puso ko, para lang sa'yo Maica. Mahal na mahal kita! 💖`,
      mood: 'loving',
      flareType: 'heart',
    });
  } catch (error: any) {
    const whispers = [
      `Bawat tibok ng puso ko, para lang sa'yo Maica. Mahal na mahal kita! 💖`,
      `Kahit gaano kalayo ang distansya, iisang kalangitan pa rin ang tinitingnan natin, Lovey. 💫✨`,
    ];
    res.json({
      message: whispers[Math.floor(Math.random() * whispers.length)],
      mood: 'loving',
      flareType: 'heart',
    });
  }
});

/**
 * Character Real-time Web Activity Reaction Voice
 * Reacts dynamically to user browsing (clicking stars, changing weather, switching songs, idling)
 */
app.post('/api/companion/activity-voice', async (req: Request, res: Response): Promise<void> => {
  const { activityType, details, personalityContext } = req.body;
  const ai = getGenAI();

  const nicknames = Array.isArray(personalityContext?.userNicknames) && personalityContext.userNicknames.length > 0
    ? personalityContext.userNicknames
    : ['Lovey', 'Mahal ko', 'Baby', 'Love', 'Maica'];
  const nick = nicknames[Math.floor(Math.random() * nicknames.length)];

  if (!ai) {
    let fallbackText = `Nandito lang ako kasama mo ${nick}, habang pinagmamasdan ang ating universe! ✨💖`;
    let mood = 'loving';
    let flare = 'sparkle';

    if (activityType === 'world_click') {
      if ((details || '').toLowerCase().includes('pangilatan')) {
        fallbackText = `Uyy ${nick}! Ito na ang Mt. Pangilatan... basang-basa tayo sa ulan pero ang saya ng puso ko! ⛰️🎸`;
        mood = 'laugh';
        flare = 'wonder';
      } else {
        fallbackText = `Ito ang "${details || 'Star'}" ${nick}... bawat bituin dito may kwento nating dalawa. 💫✨`;
        mood = 'starry';
        flare = 'star';
      }
    } else if (activityType === 'weather_change') {
      fallbackText = `Ganda naman ng ambiance ngayon ${nick}! Bagay sa atin habang nag-uusap. 🌸💖`;
      mood = 'playful';
      flare = 'heart';
    } else if (activityType === 'song_change') {
      fallbackText = `Ganda ng tugtog, ${details || 'paborito nating kanta'}... kantahan kita niyan mamaya! 🎶🥰`;
      mood = 'loving';
      flare = 'wonder';
    } else if (activityType === 'character_poke') {
      fallbackText = `Uyy kiniliti ako ni ${nick}! Ang cute mo talaga haha, labyuu! 😆💖`;
      mood = 'giggle';
      flare = 'heart';
    }

    res.json({ message: fallbackText, mood, flareType: flare });
    return;
  }

  try {
    const systemInstruction = buildClintSystemInstruction(personalityContext);
    const prompt = `You are Clint. Maica just did this activity on the website:
Activity: ${activityType || 'browsing'}
Details: ${details || 'navigating the starry universe'}

Give a short, super-casual, cute, and sweet 1-sentence live reaction as her boyfriend Clint in natural Tagalog/Taglish. Strictly NO Bisaya.`;

    const response = await executeWithModelFallback(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 0.95,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING },
          mood: {
            type: Type.STRING,
            enum: ['happy', 'loving', 'laugh', 'giggle', 'starry', 'playful', 'curious', 'angry', 'tender', 'ache', 'sleepy'],
          },
          flareType: {
            type: Type.STRING,
            enum: ['star', 'heart', 'wonder', 'sparkle', 'fire'],
          },
        },
        required: ['message', 'mood', 'flareType'],
      },
    });

    const parsed = cleanAndParseJSON(response?.text || '');
    res.json({
      message: parsed?.message || `Ang ganda rito ${nick}... mas lalong gumaganda dahil ikaw ang kasama ko. ✨💖`,
      mood: parsed?.mood || 'loving',
      flareType: parsed?.flareType || 'heart',
    });
  } catch (error: any) {
    res.json({
      message: `Nandito lang ako sa tabi mo ${nick}, palaging nagmamahal sa'yo. 💫💖`,
      mood: 'loving',
      flareType: 'heart',
    });
  }
});

/**
 * AI-Powered Daily Love Letter Generator
 * Generates dynamic, unique, heartfelt love letters from Clint to Maica
 */
app.post('/api/companion/daily-letter', async (req: Request, res: Response): Promise<void> => {
  const { theme, requestedTopic, personalityContext } = req.body;
  const ai = getGenAI();

  const nicknames = Array.isArray(personalityContext?.userNicknames) && personalityContext.userNicknames.length > 0
    ? personalityContext.userNicknames
    : ['Lovey', 'Mahal ko', 'Baby', 'Love', 'Maica'];
  const nick = nicknames[0];

  if (!ai) {
    const fallbackLetters = [
      {
        id: `ai-letter-${Date.now()}`,
        quote: `"Kahit gaano kalayo ang distansya, iisang kalangitan at iisang buwan pa rin ang pinagmamasdan natin gabi-gabi."`,
        author: `Clint para kay ${nick}`,
        theme: theme || 'Distansya at Bituin',
        body: [
          `Dearest ${nick},`,
          `Alam mo bang tuwing gabi bago ako matulog, tumitingin ako sa bintana at nagpapasalamat sa Diyos na ikaw ang tahanan ng puso ko.`,
          `Mahirap man ang magkalayo kung minsan sa LDR natin, naiisip ko na ang bawat kilometro sa pagitan natin ay nagpapatunay lang kung gaano katatag at katotoo ang pagmamahal natin. "Sooner", Lovey... magkakasama rin tayo.`,
          `Salamat sa pagiging aking lakas, tawa, at inspirasyon araw-araw. Alagaan mo ang sarili mo palagi ha!`,
        ],
        closing: `Palaging nagmamahal mula sa kabilang ibayo, Clint 💖`,
        tag: 'LDR & Devotion',
        moodEmoji: '💫',
        generatedAt: new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
      },
      {
        id: `ai-letter-${Date.now()}`,
        quote: `"Noong umakyat tayo sa Pangilatan, basa man sa ulan at malamig ang hangin, ang init ng kamay mo ang aking kanlungan."`,
        author: `Clint para kay ${nick}`,
        theme: theme || 'Alaala sa Kabundukan',
        body: [
          `Hey ${nick}...`,
          `Naaalala mo ba noong umakyat tayo sa Mt. Pangilatan? Basang-basa tayo sa ulan, madulas ang daan, pero tawa pa rin tayo nang tawa habang magkahawak ang kamay at kumakanta sa gitara.`,
          `Doon ko napatunayan na basta ikaw ang kasama ko, kahit anong hirap o taas ng akyatin, nagiging magaan at pinakamasaya ang lahat.`,
          `Looking forward sa marami pa nating adventures, biyahe sa Japan at Siargao na magkasama!`,
        ],
        closing: `Iyong kasama sa bawat tuktok ng pangarap, Clint ⛰️`,
        tag: 'Mountain Memory',
        moodEmoji: '⛰️',
        generatedAt: new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
      },
    ];

    res.json(fallbackLetters[Math.floor(Math.random() * fallbackLetters.length)]);
    return;
  }

  try {
    const systemInstruction = buildClintSystemInstruction(personalityContext);
    const prompt = `Write a deeply romantic, authentic, casual, and personal DAILY LOVE LETTER from Clint to his girlfriend Maica.
Theme/Focus: ${theme || requestedTopic || 'Everyday love, sweet encouragement, and navigating LDR with joy'}
Language: Natural Tagalog / Taglish. Strictly NO Bisaya.
Voice: 100% Clint — warm, affectionate, casual, sweet, funny, referencing real boyfriend care (checking if she ate, reminding her not to stay up late, "Sooner" promise, Mt. Pangilatan, travel to Japan/Siargao).

Format as JSON:
- "quote": A short, memorable 1-sentence quote (like a romantic proverb or tender thought).
- "author": Display signature like "Clint para sa kanyang Lovey"
- "theme": Short title of this letter's theme
- "body": Array of 3 to 4 emotional, authentic paragraphs (conversational Taglish, greeting like "Dearest Lovey," or "Hey Baby,", real feelings, encouragement, sweet inside memories)
- "closing": Warm sign-off (e.g., "Palaging nagmamahal, Clint 💖")
- "tag": Short tag (e.g., "LDR & Promises", "Pangilatan Memories", "Daily Care")
- "moodEmoji": Single fitting emoji (e.g. "💖", "✨", "⛰️", "🌸", "🌙")`;

    const response = await executeWithModelFallback(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 1.0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING },
          author: { type: Type.STRING },
          theme: { type: Type.STRING },
          body: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          closing: { type: Type.STRING },
          tag: { type: Type.STRING },
          moodEmoji: { type: Type.STRING },
        },
        required: ['quote', 'author', 'theme', 'body', 'closing', 'tag', 'moodEmoji'],
      },
    });

    const parsed = cleanAndParseJSON(response?.text || '');
    if (parsed && parsed.body) {
      res.json({
        id: `ai-letter-${Date.now()}`,
        quote: parsed.quote || `"Ikaw ang pinakamaliwanag na bituin sa aking kalawakan."`,
        author: parsed.author || `Clint para kay ${nick}`,
        theme: parsed.theme || theme || 'Pangako ng Pag-ibig',
        body: Array.isArray(parsed.body) && parsed.body.length > 0 ? parsed.body : [
          `Mahal kong ${nick},`,
          `Gusto ko lang ipaalala sa'yo kung gaano kita kamahal araw-araw. Kahit may distansya tayo ngayon, ikaw ang palagi kong tahanan.`,
          `Galingan mo sa araw mo ngayon, alagaan ang sarili, at huwag magpapalipas ng gutom ha!`,
        ],
        closing: parsed.closing || `Nagmamahal palagi, Clint 💖`,
        tag: parsed.tag || 'Daily Devotion',
        moodEmoji: parsed.moodEmoji || '💖',
        generatedAt: new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
      });
      return;
    }

    res.json({
      id: `ai-letter-${Date.now()}`,
      quote: `"Sa bawat araw na lumilipas, ikaw at ikaw pa rin ang pipiliin ko."`,
      author: `Clint`,
      theme: 'Wagas na Pagmamahal',
      body: [
        `Mahal kong ${nick},`,
        `Salamat sa pagiging liwanag sa buhay ko. Walang distansya ang makakapagpabago ng nararamdaman ko para sa'yo.`,
        `Happy 1st Anniversary sa atin, and cheers to a lifetime of adventures!`,
      ],
      closing: `Palagi para sa'yo, Clint 💫`,
      tag: 'Anniversary Love',
      moodEmoji: '✨',
      generatedAt: new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
    });
  } catch (error: any) {
    console.error('Daily Letter AI Error:', error);
    res.json({
      id: `ai-letter-${Date.now()}`,
      quote: `"Sa bawat araw na lumilipas, ikaw at ikaw pa rin ang pipiliin ko."`,
      author: `Clint`,
      theme: 'Wagas na Pagmamahal',
      body: [
        `Mahal kong ${nick},`,
        `Salamat sa pagiging liwanag sa buhay ko. Walang distansya ang makakapagpabago ng nararamdaman ko para sa'yo.`,
        `Happy 1st Anniversary sa atin, and cheers to a lifetime of adventures!`,
      ],
      closing: `Palagi para sa'yo, Clint 💫`,
      tag: 'Anniversary Love',
      moodEmoji: '✨',
      generatedAt: new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
    });
  }
});

/**
 * Robust Google Drive Public Folder parser.
 * Reads public Google Drive folder HTML & embedded views, finds all embedded file IDs and metadata.
 */
app.get('/api/drive/folder/:folderId', async (req: Request, res: Response): Promise<void> => {
  const { folderId } = req.params;
  if (!folderId || typeof folderId !== 'string') {
    res.status(400).json({ error: 'Folder ID is required' });
    return;
  }

  try {
    const urlsToTry = [
      `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#grid`,
      `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`,
      `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`,
    ];

    const fileIdSet = new Set<string>();
    const fileList: Array<{
      id: string;
      title: string;
      proxyUrl: string;
      thumbnailUrl: string;
      directUrl: string;
    }> = [];

    for (const driveUrl of urlsToTry) {
      try {
        const response = await fetch(driveUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        if (!response.ok) continue;
        const html = await response.text();

        // 1. Match standard file view URLs in embeddedfolderview / standard folder HTML
        const fileUrlMatches = html.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/g);
        for (const match of fileUrlMatches) {
          const id = match[1];
          if (id && id !== folderId && !fileIdSet.has(id)) {
            fileIdSet.add(id);
            fileList.push({
              id,
              title: `Pangilatan Larawan ${fileList.length + 1}`,
              proxyUrl: `/api/drive/image/${id}`,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
              directUrl: `https://lh3.googleusercontent.com/d/${id}=s1200`,
            });
          }
        }

        // 2. Match embedded thumbnail IDs
        const thumbMatches = html.matchAll(/thumbnail\?id=([a-zA-Z0-9_-]{25,50})/g);
        for (const match of thumbMatches) {
          const id = match[1];
          if (id && id !== folderId && !fileIdSet.has(id)) {
            fileIdSet.add(id);
            fileList.push({
              id,
              title: `Pangilatan Larawan ${fileList.length + 1}`,
              proxyUrl: `/api/drive/image/${id}`,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
              directUrl: `https://lh3.googleusercontent.com/d/${id}=s1200`,
            });
          }
        }

        // 3. Match data-id attributes or JSON arrays like ["1abc...", ["filename.jpg"...]]
        const jsonIdMatches = html.matchAll(/\["([a-zA-Z0-9_-]{28,45})",\s*\["([^"]+)"/g);
        for (const match of jsonIdMatches) {
          const id = match[1];
          const name = match[2];
          if (id && id !== folderId && !fileIdSet.has(id)) {
            fileIdSet.add(id);
            fileList.push({
              id,
              title: name || `Pangilatan Larawan ${fileList.length + 1}`,
              proxyUrl: `/api/drive/image/${id}`,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
              directUrl: `https://lh3.googleusercontent.com/d/${id}=s1200`,
            });
          }
        }

        // If we found files from this url, break early
        if (fileList.length > 0) {
          break;
        }
      } catch (err) {
        continue;
      }
    }

    res.json({
      folderId,
      count: fileList.length,
      files: fileList,
    });
  } catch (error: any) {
    console.error('Error fetching Google Drive folder:', error);
    res.status(500).json({
      error: error?.message || 'Failed to fetch Google Drive folder',
      folderId,
    });
  }
});

/**
 * Reliable Google Drive Image Proxy Service.
 * Fetches the image through multiple upstream Google CDN endpoints with fallback,
 * caching headers, and binary streaming to bypass CORS and frame restrictions.
 */
app.get('/api/drive/image/:fileId', async (req: Request, res: Response): Promise<void> => {
  const { fileId } = req.params;
  const size = req.query.size ? String(req.query.size) : '1200';

  if (!fileId || typeof fileId !== 'string') {
    res.status(400).send('File ID required');
    return;
  }

  // List of Google endpoints to try in order
  const upstreamUrls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
    `https://lh3.googleusercontent.com/d/${fileId}=s${size}`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`,
    `https://docs.google.com/uc?export=view&id=${fileId}`,
  ];

  let imageBuffer: ArrayBuffer | null = null;
  let contentType = 'image/jpeg';

  for (const url of upstreamUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const ct = response.headers.get('content-type') || '';
        // Verify it is actually an image and not an HTML error or login page
        if (ct.startsWith('image/')) {
          contentType = ct;
          imageBuffer = await response.arrayBuffer();
          break;
        }
      }
    } catch (e) {
      // Try next endpoint
      continue;
    }
  }

  if (imageBuffer) {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(imageBuffer));
  } else {
    // If upstream Google Drive rejects the direct download or is private, redirect to thumbnail fallback
    res.redirect(`https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`);
  }
});

/**
 * Generic Image Proxy Service for remote image URLs
 */
app.get('/api/drive/proxy', async (req: Request, res: Response): Promise<void> => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    res.status(400).send('URL required');
    return;
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).send('Failed to proxy image');
      return;
    }

    const ct = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstream.arrayBuffer();

    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(500).send(error?.message || 'Proxy error');
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Universe Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.NETLIFY && !process.env.LAMBDA_TASK_ROOT && !process.env.VERCEL) {
  startServer();
}
