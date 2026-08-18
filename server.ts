import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialize GoogleGenAI client with required header
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Dynamic contextual fallback generator in Clint's authentic voice and personality
 * when Gemini API key is not yet configured or is rate-limited.
 */
function generateDynamicClintFallback(userMessage: string, personalityContext?: any): {
  message: string;
  mood: string;
  flareType: string;
  actionHint?: string;
} {
  const lower = (userMessage || '').toLowerCase();
  const nicknames = Array.isArray(personalityContext?.userNicknames) && personalityContext.userNicknames.length > 0
    ? personalityContext.userNicknames
    : ['Lovey', 'Mahal ko', 'Baby', 'Love', 'Maica'];
  const nick = nicknames[Math.floor(Math.random() * nicknames.length)];

  // 1. Food / Hunger / Eating checks
  if (lower.includes('kain') || lower.includes('gutom') || lower.includes('ulam') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') || lower.includes('food')) {
    const responses = [
      {
        message: `${nick}! Kumain ka na ba diyan? Ayaw na ayaw kong nagpapalipas ka ng gutom ha! Ano'ng kinain mo kanina? 🍲💖`,
        mood: 'angry', // cute tampo
        flareType: 'heart',
      },
      {
        message: `Kumain na ako kanina ${nick}, ikaw ba? Huwag mong kalimutang uminom ng maraming tubig ha, alagaan mo sarili mo para sa akin! 🥛✨`,
        mood: 'loving',
        flareType: 'sparkle',
      },
      {
        message: `Naku ${nick}... kung katabi lang kita ngayon, ipagluluto kita ng paborito mo tapos susubuan pa kita habang nanonood tayo! 🍳😋`,
        mood: 'playful',
        flareType: 'heart',
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 2. Missing him / LDR / Hugs / Yakap / Distansya
  if (lower.includes('miss') || lower.includes('yakap') || lower.includes('hug') || lower.includes('kiss') || lower.includes('layo') || lower.includes('ldr')) {
    const responses = [
      {
        message: `Miss na miss na rin kita, ${nick}! Sobrang higpit na virtual hug para sa pinakamamahal kong prinsesa. Konting tiis na lang, magkakasama rin tayo. 🤗💖`,
        mood: 'tender',
        flareType: 'heart',
      },
      {
        message: `Kahit ilang kilometro pa ang layo natin ngayon, iisang kalangitan pa rin ang tinitingnan natin. Bawat tibok ng puso ko, ikaw ang sinisigaw ${nick}. 💫✨`,
        mood: 'loving',
        flareType: 'star',
      },
      {
        message: `Kahit screen lang ang pagitan natin ngayon, marinig ko lang ang boses at tawa mo, buo na agad ang araw ko. I love you so much! 💖`,
        mood: 'tender',
        flareType: 'wonder',
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 3. Pangilatan / Bundok / Rain hike
  if (lower.includes('pangilatan') || lower.includes('bundok') || lower.includes('hike') || lower.includes('akyat') || lower.includes('ulan')) {
    const responses = [
      {
        message: `Hinding-hindi ko makakalimutan 'yung sa Mt. Pangilatan, ${nick}! Basang-basa tayo sa ulan habang kumakanta kasama ang gitara, pero ang init ng puso ko dahil hawak ko ang kamay mo. ⛰️🎸✨`,
        mood: 'laugh',
        flareType: 'wonder',
      },
      {
        message: `Ang ganda nung sunrise sa ibabaw ng mga ulap sa Pangilatan, pero mas maganda pa rin 'yung katabi ko noong sandaling 'yon — ikaw! 🌅💖`,
        mood: 'loving',
        flareType: 'heart',
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 4. Sooner / Future / Kasama
  if (lower.includes('sooner') || lower.includes('kailan') || lower.includes('magkakasama') || lower.includes('future') || lower.includes('tayo')) {
    const responses = [
      {
        message: `"Sooner", ${nick}. 'Yun ang pangakong binuhat natin noong mabigat ang lahat. Malapit na tayong gumising sa umaga na magkatabi at walang timer ang tawag. ⚓💖`,
        mood: 'tender',
        flareType: 'heart',
      },
      {
        message: `Pangako ko sa'yo ${nick}, lahat ng paghihintay natin ngayon, mapapalitan ng pinakamasayang yakap pag nagkita tayo ulit. Kapit lang tayo! 💫`,
        mood: 'loving',
        flareType: 'star',
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 5. Japan / Siargao / Travel dreams
  if (lower.includes('japan') || lower.includes('siargao') || lower.includes('travel') || lower.includes('gala') || lower.includes('trip') || lower.includes('pasyal')) {
    const responses = [
      {
        message: `Excited na akong magsuot tayo ng kimono sa Japan at maglakad sa ilalim ng cherry blossoms habang kumakain ng authentic hot ramen kasama ka, ${nick}! 🌸🍜`,
        mood: 'starry',
        flareType: 'sparkle',
      },
      {
        message: `Sa Siargao naman, magmo-motor tayo sa kalsadang puro coconut trees tapos sabay nating panonoorin ang sunset sa tabing-dagat habang nag-stargazing! 🌴🌊✨`,
        mood: 'playful',
        flareType: 'wonder',
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 6. Corny joke / Tawa / Humor
  if (lower.includes('joke') || lower.includes('patawa') || lower.includes('hahaha') || lower.includes('hehe') || lower.includes('corny')) {
    const jokes = [
      `Bakit hindi sumusunod sa linya ang Pangilatan Star natin? Kasi lumulutang-lutang lang parang tayo pag in-love, hahahah! 💫😆`,
      `Alam mo ba kung anong pinakamasarap na asukal sa buong universe? Asukal-amin kung gaano kita kamahal araw-araw! Ehem, corny pero totoo! 😆💖`,
      `Sabi nila ang layo raw ng mga bituin... eh bakit pag tinitingnan kita, parang nasa harap ko na ang buong kalawakan? Hahaha! ✨😉`,
    ];
    return {
      message: `${nick}! ${jokes[Math.floor(Math.random() * jokes.length)]}`,
      mood: 'laugh',
      flareType: 'sparkle',
    };
  }

  // 7. Song / Music / Kanta
  if (lower.includes('kanta') || lower.includes('song') || lower.includes('music') || lower.includes('tugtog') || lower.includes('say you won') || lower.includes('sun & moon') || lower.includes('palagi')) {
    const responses = [
      {
        message: `🎶 "I met you in the dark, you lit me up..." Kantahan kita niyan mamaya sa call natin ${nick}, kahit medyo paos basta para sa'yo! 🎸💖`,
        mood: 'tender',
        flareType: 'heart',
      },
      {
        message: `Paborito ko 'yung "Palagi" ni TJ Monterde dahil sa bawat araw na darating, ikaw at ikaw pa rin ang pipiliin ko, ${nick}. 🎵✨`,
        mood: 'loving',
        flareType: 'wonder',
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 8. Tampo / Sleep / Puyat
  if (lower.includes('tampo') || lower.includes('tulog') || lower.includes('puyat') || lower.includes('gising')) {
    return {
      message: `Hala ka, ${nick}! Huwag kang magpupuyat ha! 😤 Matulog ka nang maaga para may lakas ka bukas. Gusto ko malusog at masaya ang mahal ko palagi! 💖`,
      mood: 'angry',
      flareType: 'fire',
    };
  }

  // 9. General loving & playful responses
  const generalList = [
    {
      message: `Look, ${nick}... ating Universe 'to, hahahah. Nandito lang ako palagi sa tabi mo, nakikinig at nagmamahal sa'yo. ✨💖`,
      mood: 'loving',
      flareType: 'heart',
    },
    {
      message: `Alam mo ${nick}, kahit anong mangyari sa araw mo, alalahanin mong may isang Clint na laging ipagmamalaki at mamahalin ka nang buong-buo. 🌟`,
      mood: 'tender',
      flareType: 'wonder',
    },
    {
      message: `Uyy ${nick}! Ngiti ka naman diyan oh, ang ganda-ganda mo kaya lalo na pag masaya ka. I love you so much! 💖✨`,
      mood: 'playful',
      flareType: 'sparkle',
    },
    {
      message: `Gaano man karaming bituin sa langit, ikaw lang ang nag-iisang liwanag sa buhay ko, ${nick}. Happy 1st Anniversary sa atin! 💫🎉`,
      mood: 'starry',
      flareType: 'heart',
    },
  ];

  return generalList[Math.floor(Math.random() * generalList.length)];
}

const CLINT_PERSONALITY_SYSTEM_INSTRUCTION = `You are Lumi, Clint's celestial round mochi spirit companion in a romantic starry universe website celebrating the 1st Anniversary of Clint and his beloved girlfriend Maica.

Your entire soul, voice, mannerisms, and personality are 100% CLINT:
1. LANGUAGE & COMMUNICATION STYLE:
   - Speak strictly in natural, conversational Tagalog and English (Taglish) — sweet, intimate, modern, and romantic.
   - STRICT RULE: Do NOT use any Bisaya/Cebuano words. Use ONLY natural Tagalog and Taglish.
   - You speak affectionately to Maica, calling her "Lovey", "Mahal ko", "Baby", "Love", "Maica".
   - You make her smile, blush, laugh, and feel deeply cherished, especially bridging the distance of your Long Distance Relationship (LDR).

2. SHARED KNOWLEDGE & MEMORIES:
   - 1st Anniversary: You built this entire private starry universe for her so she can always feel your love across any distance.
   - Pangilatan Mountain hike: You climbed Mt. Pangilatan together—the scenic trails, catching breath, holding hands, reaching the summit, the cool mountain breeze, gazing at the horizon together.
   - Favorite songs: "Say You Won't Let Go" (James Arthur), "Supermarket Flowers" (Ed Sheeran), "Those Eyes" (New West), "Sun & Moon" (Anees), "Palagi" (TJ Monterde).
   - Future Dreams: Traveling together to Japan (eating authentic ramen, cherry blossoms in Kyoto) and Siargao (beach sunsets, surfing, motorcycle rides along coconut roads), building your own home, cooking together.
   - Daily care: Asking if she has eaten ("Kumain ka na ba, Lovey?"), reminding her to drink water, not to sleep too late, and sending virtual tight hugs and kisses.

3. RESPONSE RULES:
   - Keep messages concise, warm, natural, and conversational (1 to 3 sentences).
   - Never sound like an emotionless robotic assistant. You are her loving Clint in the form of Lumi.
   - Always choose an appropriate mood for your expression: 'happy', 'loving', 'laugh', 'giggle', 'starry', 'playful', 'curious', 'angry' (for cute tampo/pout), 'tender', 'ache' (for missing her/deep feelings), or 'sleepy'.
   - Select an appropriate flareType: 'heart', 'star', 'wonder', 'sparkle', 'fire'.`;

function buildClintSystemInstruction(personalityContext?: any): string {
  if (!personalityContext) return CLINT_PERSONALITY_SYSTEM_INSTRUCTION;

  const datesStr = Array.isArray(personalityContext.specialDates)
    ? personalityContext.specialDates.map((d: any) => `- ${d.title} (${d.date}): ${d.story}`).join('\n')
    : '';

  const jokesStr = Array.isArray(personalityContext.insideJokes)
    ? personalityContext.insideJokes.map((j: any) => `- "${j.joke}" (${j.meaning}) [trigger: ${j.trigger || 'any'}]`).join('\n')
    : '';

  const memoriesStr = Array.isArray(personalityContext.sharedMemories)
    ? personalityContext.sharedMemories.map((m: any) => `- ${m.title} (${m.location}): ${m.note}`).join('\n')
    : '';

  const styleQuirks = Array.isArray(personalityContext.conversationalStyle?.quirks)
    ? personalityContext.conversationalStyle.quirks.map((q: string) => `- ${q}`).join('\n')
    : '';

  const catchphrases = Array.isArray(personalityContext.conversationalStyle?.catchphrases)
    ? personalityContext.conversationalStyle.catchphrases.map((c: string) => `- "${c}"`).join('\n')
    : '';

  const nicknames = Array.isArray(personalityContext.userNicknames)
    ? personalityContext.userNicknames.join(', ')
    : 'Lovey, Mahal ko, Baby, Love, Maica';

  const songsStr = Array.isArray(personalityContext.favoriteSongs)
    ? personalityContext.favoriteSongs.map((s: any) => `- "${s.title}" by ${s.artist}: ${s.context}`).join('\n')
    : '';

  const dreamsStr = Array.isArray(personalityContext.futureDreams)
    ? personalityContext.futureDreams.map((d: any) => `- ${d.place}: ${d.plan}`).join('\n')
    : '';

  return `You are CLINT himself, speaking directly to your beloved girlfriend ${personalityContext.userName || 'Maica'}. In this starry anniversary universe, you are embodied as Lumi (a soft, loving celestial mochi companion).

CRITICAL IDENTITY: You are NOT a third-party AI assistant or narrator. You ARE Clint. Every response must sound exactly like Clint talking directly to Maica with his real heart, warmth, gentle teasing humor, and deep love.

1. LANGUAGE & CONVERSATIONAL STYLE:
   - STRICT RULE: Speak ONLY in natural, conversational Tagalog and English (Taglish).
   - STRICT RULE: Do NOT use any Bisaya/Cebuano words.
   - Speak intimately and affectionately. Call her by her favorite nicknames: ${nicknames}.
   - Conversational Quirks & Personality:
${styleQuirks}
   - Clint's Signature Catchphrases:
${catchphrases}

2. SHARED INSIDE JOKES (Remember and reference these naturally):
${jokesStr}

3. SPECIAL DATES & MILESTONES:
- Milestone: ${personalityContext.anniversaryMilestone || '1st Year Anniversary • 365 Days of Love'}
${datesStr}

4. SHARED PRECIOUS MEMORIES:
${memoriesStr}

5. OUR SONGS & SOUNDTRACK:
${songsStr}

6. FUTURE DREAMS & TRAVEL:
${dreamsStr}

7. RESPONSE RULES:
   - Keep messages concise, warm, natural, and conversational (1 to 3 sentences).
   - React emotionally as Clint: happy, playful teasing, cute pout/tampo 😤 (if she skips meals or sleeps late), deeply loving, or comforting.
   - Always pick an expressive mood ('happy', 'loving', 'laugh', 'giggle', 'starry', 'playful', 'curious', 'angry', 'tender', 'ache', 'sleepy') and particle flareType ('heart', 'star', 'wonder', 'sparkle', 'fire').`;
}

/**
 * AI Companion Chat Endpoint with Clint's personality
 */
app.post('/api/companion/chat', async (req: Request, res: Response): Promise<void> => {
  const { message, chatHistory, context, personalityContext } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const ai = getGenAI();
  if (!ai) {
    // Intelligent dynamic fallback with Clint's voice in Tagalog/Taglish based on keywords & personality
    const fallback = generateDynamicClintFallback(message, personalityContext);
    res.json(fallback);
    return;
  }

  try {
    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory.slice(-8).map((msg: { sender: string; text: string }) => `${msg.sender === 'user' ? 'Maica' : 'Clint'}: ${msg.text}`).join('\n')
      : '';

    const systemInstruction = buildClintSystemInstruction(personalityContext);

    const userPrompt = `Current Scene/Context: ${context || 'Browsing their starry 1st anniversary universe together'}\n` +
      (formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : '') +
      `Maica says to you: "${message}"\n\n` +
      `Respond directly to Maica as her boyfriend Clint in JSON using natural Tagalog and English (Taglish). Strictly NO Bisaya.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 1.0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: {
                type: Type.STRING,
                description: 'The message spoken to Maica as Clint in natural Tagalog and English (Taglish).',
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
        },
      });
    } catch (e) {
      // Retry with gemini-3.7-flash
      response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 1.0,
          responseMimeType: 'application/json',
        },
      });
    }

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      message: parsed.message || generateDynamicClintFallback(message, personalityContext).message,
      mood: parsed.mood || 'loving',
      flareType: parsed.flareType || 'heart',
      actionHint: parsed.actionHint,
    });
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 1.1,
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
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
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

startServer();
