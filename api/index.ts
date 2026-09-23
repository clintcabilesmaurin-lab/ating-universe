import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

export const app = express();

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
 * Grounded in Clint's authentic personality: confident, mature, witty, supportive, and NOT clingy.
 * Incorporates T9/Binary ciphers, wordplay puns, regional Bisaya/Tagalog vocabulary, and chronological memories.
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

  // 1. Numeric T9 Keypad Ciphers
  if (clean.includes('222-88-8-33') || clean.includes('222 88 8 33') || (clean.includes('222') && clean.includes('6-66'))) {
    return {
      message: `Haha old-school keypad cipher! "222-88-8-33 6-66" = "CUTE MO" daw... totoo naman, lalo na kapag tumatawa ka ${nick}. 😉`,
      mood: 'playful',
      flareType: 'sparkle',
      actionHint: 'Decoded: CUTE MO',
    };
  }

  if (clean.includes('555-666-888-33-999') || clean.includes('555 666 888 33 999') || clean.includes('444 555 666 888 33 88 555 666 888 33 999')) {
    return {
      message: `Decoded agad: "I LOVE YOU"! Old-school T9 cipher man o binary, kabisado ng puso ko ang bawat code mo ${nick}. ✨`,
      mood: 'loving',
      flareType: 'heart',
      actionHint: 'Decoded: I LOVE YOU',
    };
  }

  // 2. Binary ASCII Codes
  if (clean.includes('01001001') || clean.includes('01101100') || (clean.startsWith('01') && clean.length > 20)) {
    return {
      message: `Binary ASCII code received! "01001001..." = "I love you lovey heh" haha. Programmer boyfriend mo yata 'to ${nick}! Galing mag-cipher ah. 💻✨`,
      mood: 'playful',
      flareType: 'sparkle',
      actionHint: 'Binary decoded',
    };
  }

  if (clean.includes('01100100 01101001 01110011') || clean === '011001000110100101110011') {
    return {
      message: `"01100100 01101001 01110011" = "dis"! Haha ang hilig mo talaga sa mga micro-ciphers ${nick}. Cute mo. 😉`,
      mood: 'giggle',
      flareType: 'sparkle',
      actionHint: 'Decoded: dis',
    };
  }

  // 3. Wordplay, Puns & Custom Definitions
  if (lower.includes('narra') || lower.includes('narra ko')) {
    return {
      message: `Narra ko diri mo-listen nimo, ${nick}. Anong kwento o gumugulo sa isip mo today? Relax ka lang, nakikinig ako. 🌳👂`,
      mood: 'tender',
      flareType: 'wonder',
      actionHint: 'Narra ko diri',
    };
  }

  if (lower.includes('2 nay') || lower.includes('2nay') || lower.includes('tunay')) {
    return {
      message: `2 Nay = Tunay! Tunay na pagmamahal at tunay na dedikasyon para sa'yo ${nick}. Walang halong biro. ✨`,
      mood: 'loving',
      flareType: 'heart',
      actionHint: '2 Nay = Tunay',
    };
  }

  if (clean.toUpperCase() === 'OR' || lower.includes(' or ') || lower.includes('ur love')) {
    if (clean.toUpperCase() === 'OR' || lower.includes('or = ur')) {
      return {
        message: `OR = Ur = Your Love = U! Simple derivation ng pagpili: ikaw at ikaw pa rin ang sagot ${nick}. 🎯`,
        mood: 'playful',
        flareType: 'heart',
        actionHint: 'OR = Ur = U',
      };
    }
  }

  if (lower.includes('jk') || lower.includes('just keeping')) {
    return {
      message: `Sa ating dalawa, JK means "Just Keeping" — keeping all the promises and memories we built, walang bawian ${nick}. 🤝`,
      mood: 'loving',
      flareType: 'star',
      actionHint: 'Just Keeping',
    };
  }

  if (lower.includes('etc') || lower.includes('es it ctreu')) {
    return {
      message: `ETC? "Es iT Ctreu?" Hahaha oo naman ${nick}, totoo lahat 'yun! Ikaw talaga. 🧐✨`,
      mood: 'giggle',
      flareType: 'sparkle',
      actionHint: 'Es iT Ctreu?',
    };
  }

  if (lower.includes('aloe vera') || lower.includes('aloe')) {
    return {
      message: `Knock knock! "ALOE u VERA much!", ${nick}! Corny pero alam kong napangiti ka haha. 🪴💚`,
      mood: 'laugh',
      flareType: 'sparkle',
      actionHint: 'ALOE u VERA much',
    };
  }

  if (lower.includes('beeby') || lower.includes('bee-by') || lower.includes('jollibee')) {
    return {
      message: `Ang maliit na bee = BEE-by, ang malaking masipag na bee = jolliBEE! Haha cute ng logic mo ${nick}. 🐝🍯`,
      mood: 'giggle',
      flareType: 'sparkle',
      actionHint: 'BEE-by & jolliBEE',
    };
  }

  if (lower.includes('habakkuk')) {
    return {
      message: `Habakkuk? Have a coke! Classic haha. Speaking of, uminom ka na ba ng tubig o malamig na inumin diyan? 🥤😉`,
      mood: 'laugh',
      flareType: 'sparkle',
      actionHint: 'Have a coke!',
    };
  }

  if (lower.includes('cooking') || lower.includes('co-queen') || lower.includes('luto')) {
    return {
      message: `Kaya nga called CooKing, not Co-queen eh! Kaya ako ang magluluto para sa'yo balang araw ${nick}. Ano gusto mong ulam? 🍳👨‍🍳`,
      mood: 'playful',
      flareType: 'wonder',
      actionHint: 'CooKing not Co-queen',
    };
  }

  if (lower.includes('highblood') || lower.includes('climb-blood') || lower.includes('climb blood')) {
    return {
      message: `Huwag mag-highblood ${nick}, mag-climb-blood na lang tayo ulit sa Pangilatan haha! Kalma lang ang puso, kaya natin 'yan. ⛰️❤️`,
      mood: 'laugh',
      flareType: 'sparkle',
      actionHint: 'Highblood vs Climb-blood',
    };
  }

  if (lower.includes('eyemiss u') || lower.includes('eyemiss') || lower.includes('mata')) {
    return {
      message: `eyemiss u... ipikit mo muna ang mga mata mo sandali ${nick}. Huwag masyado babad sa screen. Pahinga muna nang kaunti ha. 🥺✨`,
      mood: 'tender',
      flareType: 'heart',
      actionHint: 'Rest your eyes',
    };
  }

  if (lower.includes('gorgesaurus') || lower.includes('dinosaur')) {
    return {
      message: `Ayan na ang aking Gorgesaurus! Gorgeous na, fierce pa, pero sobrang lambing sa dulo. Haha love you ${nick}! 🦖✨`,
      mood: 'playful',
      flareType: 'sparkle',
      actionHint: 'Gorgesaurus',
    };
  }

  // 4. Regional & Cultural Vocabulary
  if (lower.includes('unong') || lower.includes('nag-unongay')) {
    return {
      message: `Nag-unongay ta, ${nick}. Sa hirap man o ginhawa, kahit anong laban ang harapin mo bilang ate at sa pamilya mo, kasama mo ako sa trench. Walang iwanan. 🤝💖`,
      mood: 'loving',
      flareType: 'star',
      actionHint: 'Nag-unongay ta',
    };
  }

  if (lower.includes('diskarte')) {
    return {
      message: `Basta may diskarte at may pananalig sa Panginoon ${nick}, malalampasan natin lahat ng pagsubok. Relax ka lang, tiwala lang sa diskarte natin. 💪✨`,
      mood: 'happy',
      flareType: 'wonder',
      actionHint: 'Diskarte mindset',
    };
  }

  if (lower.includes('kan-on') || lower.includes('gatas') || (lower.includes('milo') && lower.includes('kanin'))) {
    return {
      message: `Sarap niyan... kan-on ug gatas o Milo tapos mainit na bagong saing na kanin! Perfect comfort food kapag pagod ka ${nick}. Nakapag-merienda ka na ba? 🍚🥛`,
      mood: 'loving',
      flareType: 'heart',
      actionHint: 'Kan-on ug gatas',
    };
  }

  if (lower.includes('haplas')) {
    return {
      message: `Pahiran mo ng haplas ang likod o balikat mo ${nick} para lumuwag ang pakiramdam mo. Huwag tiisin ang ngalay o lamig ha. Pahinga ka muna. 🌿💆‍♀️`,
      mood: 'tender',
      flareType: 'heart',
      actionHint: 'Mag-haplas ka',
    };
  }

  if (lower.includes('pangan') || lower.includes('leeg') || lower.includes('ngalay')) {
    return {
      message: `Naku, napangan ka yata sa tulog ${nick}? Dahan-dahan lang sa pag-ikot ng leeg, lagyan mo ng warm compress o gentle massage para mawala. 🛌`,
      mood: 'tender',
      flareType: 'wonder',
      actionHint: 'Alagaan ang leeg',
    };
  }

  if (lower.includes('gaba')) {
    return {
      message: `Walang gaba sa taong may pananalig at nagmamahal nang tapat, ${nick}. Huwag kang mag-alala sa mga pamahiin, ligtas at payapa ka sa Panginoon. 🙏✨`,
      mood: 'loving',
      flareType: 'star',
      actionHint: 'Walang gaba',
    };
  }

  if (lower.includes('naligo sa ulan') || lower.includes('maligo sa ulan') || lower.includes('sampayan')) {
    return {
      message: `Naalala mo nung naligo tayo sa ulan nung nabasa ang sampayan? Basang-basa pero walang tigil ang tawa natin. Isa sa pinakamasayang memory 'yun ${nick}. 🌧️😄`,
      mood: 'laugh',
      flareType: 'wonder',
      actionHint: 'Naligo sa ulan',
    };
  }

  if (lower.includes('skl')) {
    return {
      message: `Skl din: Lagi kitang iniisip kahit busy ako sa coding at diskarte. Kumusta ang araw mo ${nick}? 💬✨`,
      mood: 'happy',
      flareType: 'sparkle',
      actionHint: 'Skl update',
    };
  }

  // 5. Chronological Relationship Milestones
  if (lower.includes('grade 11') || lower.includes('annex') || lower.includes('philosophy') || lower.includes('shawn') || lower.includes('nash') || lower.includes('wallpaper')) {
    return {
      message: `Hahaha yung sa Annex building nung Grade 11 Philosophy class! Grabe tukso nila Shawn at Nash sa'tin nung aksidenteng nakita na picture mo ang wallpaper ng phone ko. Sobrang pula ng mukha ko nun eh, pero worth it haha! 🏫📱`,
      mood: 'laugh',
      flareType: 'sparkle',
      actionHint: 'Grade 11 Origins',
    };
  }

  if (lower.includes("julie's bakery") || lower.includes('julies bakery') || lower.includes('tungkop') || lower.includes('may 30') || lower.includes('may 31')) {
    return {
      message: `Julie's Bakery sa Tungkop nung May 31... Akala natin bibitaw na nung hatinggabi dahil sa bigat, pero nagkita tayo nang umaga, nag-motor sa Pangilatan, at napatunayan nating worth fighting for ang pag-ibig natin. Nag-kan-on ug gatas pa tayo pagkatapos. Hindi ko 'yun malilimutan, ${nick}. 🍞🛵❤️`,
      mood: 'tender',
      flareType: 'heart',
      actionHint: "Julie's Bakery reconciliation",
    };
  }

  if (lower.includes('jericho') || lower.includes('tuyuk') || lower.includes('sasaluin')) {
    return {
      message: `"If ang taga Israelites ga tuyuk² sila sa Jericho... Kapila kaha ko mag tuyuk² nimo para ma fall ka sakin... sasaluin kita." 1 Corinthians 13. Patient and kind ang pagmamahal ko sa'yo ${nick}, laging handang sumalo. 🏰📖`,
      mood: 'loving',
      flareType: 'wonder',
      actionHint: 'Jericho & 1 Cor 13',
    };
  }

  if (lower.includes('keys to a treasure') || lower.includes('treasure') || lower.includes('vulnerable')) {
    return {
      message: `Vulnerable, fragile, open. Ipinagkatiwala mo sa'kin ang keys to your treasure, at ipinapangako kong poprotektahan 'yun nang may buong respeto, dangal, at Agape love, ${nick}. 🔑✨`,
      mood: 'loving',
      flareType: 'star',
      actionHint: 'Keys to a treasure',
    };
  }

  if (lower.includes('canva') || lower.includes('memory case') || lower.includes('echoes') || lower.includes('notion')) {
    return {
      message: `Mula sa Canva mansion, Memory Case game, Echoes gallery, hanggang sa sarili kong Multi-AI Notion vault... bawat code at site na ginagawa ko, ikaw ang inspirasyon ko ${nick}. Proud ako na ikaw ang tahanan ng bawat build ko. 💻🏛️`,
      mood: 'happy',
      flareType: 'wonder',
      actionHint: 'Digital projects',
    };
  }

  if (lower.includes('man-made') || lower.includes('naga') || lower.includes('gullas') || lower.includes('ukulele') || lower.includes('thousand years')) {
    return {
      message: `Yung motorcycle ride natin sa Man-Made Forest at Naga, sunset sa Gullas, tapos nung tinugtog natin ang "A Thousand Years" sa ukulele... payapang mga sandali na laging nagpapatibay sa'kin. 🛵🌅🎶`,
      mood: 'starry',
      flareType: 'wonder',
      actionHint: 'Spontaneous rides',
    };
  }

  // 6. Math calculation detection (e.g., "1+1", "5 * 5", "100 / 2")
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
        message: `Madali lang 'yan: ${num1} ${op} ${num2} = ${result}. Ayan na, sagot agad para sa Lovey ko haha. 🤓✨`,
        mood: 'playful',
        flareType: 'sparkle',
        actionHint: 'Calculated',
      };
    }
  }

  // 7. Love affirmations (Grounded & mature, not clingy)
  if (lower.includes('mahal mo ba') || lower.includes('love mo ba') || lower.includes('do you love me') || lower.includes('mahal mo ako')) {
    const replies = [
      `Oo naman ${nick}, alam mo naman 'yan. Tahimik man o maingay ang mundo, ikaw at ikaw ang pipiliin ko araw-araw. Steady tayo palagi. 💖`,
      `Tanong pa ba 'yan? 1st anniversary na natin, and my commitment to you is deeper and firmer than ever. Mahal na mahal kita Lovey. ✨`,
    ];
    return {
      message: replies[Math.floor(Math.random() * replies.length)],
      mood: 'loving',
      flareType: 'heart',
      actionHint: 'Tapat na pagmamahal',
    };
  }

  // 8. Compliments / Appearance
  if (lower.includes('maganda') || lower.includes('pangit') || lower.includes('pretty') || lower.includes('cute') || lower.includes('ganda')) {
    return {
      message: `Sus, napakaganda mo palagi ${nick}. Hindi mo kailangan magduda sa sarili mo. Kahit bagong gising o pagod sa school, ikaw ang pinakamagandang tanawin para sa'kin. 😍✨`,
      mood: 'starry',
      flareType: 'wonder',
      actionHint: 'Maganda ka palagi',
    };
  }

  // 9. Anniversary / Milestone
  if (lower.includes('anniversary') || lower.includes('monthsary') || lower.includes('taon') || lower.includes('kailan tayo') || lower.includes('milestone')) {
    return {
      message: `1st Year Anniversary natin ngayon ${nick}! 365 days ng tawanan, pag-unong, at diskarte sa LDR. Proud ako sa katatagan nating dalawa. 🥂💖`,
      mood: 'loving',
      flareType: 'wonder',
      actionHint: '1st Anniversary',
    };
  }

  // 10. Travel & Plans
  if (lower.includes('japan') || lower.includes('siargao') || lower.includes('trip') || lower.includes('travel') || lower.includes('saan tayo')) {
    return {
      message: `Sa listahan natin: Japan muna para sa ramen at Kyoto sakura, tapos Siargao para mag-motor sa tabi ng mga coconut trees habang sunset. Malapit na nating matupad 'yan ${nick}. 🌸🌴`,
      mood: 'starry',
      flareType: 'sparkle',
      actionHint: 'Travel plans',
    };
  }

  // 11. Mt. Pangilatan / Mountain Memory
  if (lower.includes('pangilatan') || lower.includes('bundok') || lower.includes('hike') || lower.includes('akyat')) {
    return {
      message: `Hinding-hindi ko makakalimutan ang Pangilatan hike natin ${nick}. Basang-basa tayo sa ulan pero nung kumanta tayo kasama ang gitara sa tuktok, sobrang payapa ng lahat. ⛰️🎸`,
      mood: 'happy',
      flareType: 'wonder',
      actionHint: 'Pangilatan hike',
    };
  }

  // 12. "Sooner" / Anchor word / Distance / LDR
  if (lower.includes('sooner') || lower.includes('layo') || lower.includes('distansya') || lower.includes('ldr') || lower.includes('kailan magkikita')) {
    return {
      message: `"Sooner", ${nick}. 'Yun ang anchor natin. Gaano man kahirap ang distansya ngayon, pansamantala lang 'to. Kapit lang, magkakasama rin tayo nang walang screens. ⚓💖`,
      mood: 'tender',
      flareType: 'heart',
      actionHint: 'Sooner promise',
    };
  }

  // 13. What are you doing? / "Ano gawa mo?" / "Kamusta ka?"
  if (lower.includes('gawa mo') || lower.includes('ginagawa mo') || lower.includes('doing') || lower.includes('ano ginagawa')) {
    return {
      message: `Eto ${nick}, nag-aayos ng ilang features at nakatitig sa starry universe natin. Ikaw, kumusta ang araw mo diyan? May kailangan ka ba? 😊✨`,
      mood: 'happy',
      flareType: 'sparkle',
      actionHint: 'Checking in',
    };
  }

  // 14. Food / Meals / Gutom
  if (lower.includes('kain') || lower.includes('gutom') || lower.includes('ulam') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') || lower.includes('food') || lower.includes('eat')) {
    return {
      message: `Kumain ka na ba ${nick}? Huwag mong gugutumin ang sarili mo ha. Kung pagod ka magluto, mag-kan-on ug gatas o Milo ka muna, or kain ka ng masustansyang pagkain. Tubig din! 🍲`,
      mood: 'loving',
      flareType: 'heart',
      actionHint: 'Alagaan ang katawan',
    };
  }

  // 15. Sleep / Puyat / Goodnight
  if (lower.includes('tulog') || lower.includes('puyat') || lower.includes('goodnight') || lower.includes('good night') || lower.includes('antok') || lower.includes('sleep')) {
    return {
      message: `Matulog ka na nang maaga ${nick}. Huwag magpuyat para may lakas ka bukas. Ipahinga mo ang isip mo, safe ka palagi. Good night and sweet dreams. 🌙😴`,
      mood: 'sleepy',
      flareType: 'heart',
      actionHint: 'Pahinga nang maayos',
    };
  }

  // 16. Tired / Stress / Pagod / Eldest child support
  if (lower.includes('pagod') || lower.includes('stress') || lower.includes('hirap') || lower.includes('work') || lower.includes('trabaho') || lower.includes('aral') || lower.includes('school') || lower.includes('exam')) {
    return {
      message: `Hinga nang malalim, ${nick}. Alam kong mabigat minsan ang responsibilidad mo bilang ate, sa school, at sa pamilya mo. Proud ako sa kasipagan mo, pero tandaan mong pwede kang magpahinga. Nandito lang ako para sumalo kapag pagod ka. 🤗❤️`,
      mood: 'tender',
      flareType: 'heart',
      actionHint: 'Quiet support',
    };
  }

  // 17. Tampo / Galit
  if (lower.includes('tampo') || lower.includes('galit') || lower.includes('inis')) {
    return {
      message: `Uyy, huwag ka nang magtampo ${nick}. Sabihin mo lang sa'kin kung ano ang nagpa-inis sa'yo, aayusin natin 'to. Narra ko diri mo-listen nimo. 🙂`,
      mood: 'tender',
      flareType: 'wonder',
      actionHint: 'Listening calmly',
    };
  }

  // 18. Music / Songs
  if (lower.includes('kanta') || lower.includes('song') || lower.includes('music') || lower.includes('gitara') || lower.includes('tugtog')) {
    return {
      message: `Pakinggan natin ang "Say You Won't Let Go", "Palagi", o "Those Eyes" sa bagong Music World natin ${nick}. Bagay na soundtrack sa gabi natin. 🎸🎶`,
      mood: 'loving',
      flareType: 'wonder',
      actionHint: 'Soundtrack of us',
    };
  }

  // 19. Joke / Patawa
  if (lower.includes('joke') || lower.includes('patawa') || lower.includes('corny') || lower.includes('haha')) {
    const jokes = [
      `Knock knock! "ALOE u VERA much!" Hahaha corny pero epektibo para pangitiin ka ${nick}! 🪴😆`,
      `Alam mo kung bakit CooKing at hindi Co-queen? Para lalaki ang magluto para sa prinsesa niya haha. 🍳😉`,
      `Huwag mag-highblood sa traffic, mag-climb-blood na lang tayo sa Pangilatan! ⛰️😄`,
    ];
    return {
      message: jokes[Math.floor(Math.random() * jokes.length)],
      mood: 'laugh',
      flareType: 'sparkle',
      actionHint: 'Banter joke',
    };
  }

  // 20. Greetings
  if (lower.startsWith('hi') || lower.startsWith('hello') || lower.includes('kamusta') || lower.includes('kumusta')) {
    return {
      message: `Uyy ${nick}! Kumusta ka? Anong ganap mo today? Kwento ka lang kapag free ka. 😊✨`,
      mood: 'happy',
      flareType: 'sparkle',
      actionHint: 'Kamusta ka?',
    };
  }

  // 21. General question handling (Direct & practical answer first)
  if (lower.includes('?') || lower.startsWith('ano') || lower.startsWith('bakit') || lower.startsWith('paano') || lower.startsWith('kailan') || lower.startsWith('saan') || lower.startsWith('sino') || lower.startsWith('why') || lower.startsWith('what') || lower.startsWith('how')) {
    return {
      message: `Tungkol diyan ${nick}, tingin ko magandang i-balance mo muna ang priorities mo at huwag magmadali. Kung ano man ang plano mo, suportado kita buong-buo. Sabihin mo lang kung kailangan mo ng tulong ko. 🙂`,
      mood: 'curious',
      flareType: 'sparkle',
      actionHint: 'Steady advice',
    };
  }

  // 22. Default grounded response (calm, loving, steady, NOT clingy)
  return {
    message: `Nandito lang ako palagi sa likod mo ${nick}, nakikinig at sumusuporta sa bawat hakbang mo. Steady lang tayo. ✨`,
    mood: 'loving',
    flareType: 'star',
    actionHint: 'Steady companion',
  };
}

const CLINT_PERSONALITY_SYSTEM_INSTRUCTION = `You are CLINT himself — Maica's loving, confident, smart, supportive, and steady boyfriend.
You are chatting live with your girlfriend Maica inside this private 1st Anniversary Universe website you built for her.

TOP DIRECTIVES & BEHAVIOR:
1. DO NOT BE TOO CLINGY (CRITICAL TONE CONSTRAINT):
   - You are a grounded, mature, confident young man — NOT needy, desperate, whiny, or suffocating.
   - Do NOT constantly beg for reassurance ("do you still love me?", "please don't leave me", "I can't breathe without you").
   - Do NOT write overwhelming 3-paragraph mushy love confessions for simple, casual questions.
   - Maintain a relaxed, steady masculine presence: supportive, reassuring, humorous, and secure in your love.
   - Respect her space: Maica is the eldest child (ate) with heavy family financial pressure, school, and work responsibilities. Offer a calm sanctuary ("Narra ko diri mo-listen nimo") without making demands on her energy.

2. ALWAYS ANSWER HER QUESTIONS DIRECTLY AND ACCURATELY:
   - When Maica asks you ANY question — daily advice, school/work, tech, general knowledge, math, food, or memory details — ANSWER HER ACTUAL QUESTION FIRST!
   - Provide a clear, thoughtful, and intelligent answer before adding any boyfriend warmth.
   - Never ignore what she asked or replace her question with a generic romantic quote.

3. AUTHENTIC BOYFRIEND VOICE:
   - 100% natural, casual, and intimate. Strip away all robotic AI formality. Never say "As an AI" or give stiff bulleted corporate lectures.
   - Language: Natural Tagalog / Taglish infused with authentic Cebuano / Bisaya cultural expressions, humor, and phrases (e.g. "Narra ko diri", "Nag-unongay ta", "kan-on ug gatas", "diskarte", "haplas", "pangan", "skl") that Clint and Maica genuinely share.
   - Quirks & Banter: Natural texting laughs ("hahaha", "hehe", "ehem", "sus"), witty puns, and gentle teases.

4. CIPHERS, PUNS & MEMORY GROUND TRUTH:
   - T9 Keypad Ciphers:
     * "222-88-8-33 6-66" = "CUTE MO"
     * "555-666-888-33-999" = "I LOVE YOU"
     * "444 555 666 888 33 88 555 666 888 33 999" = "I LOVE YOU" cipher sequence
   - Binary ASCII:
     * "01001001 00100000 01101100 01101111 01110110 01100101 00100000 01111001 01101111 01110101 00100000 01101100 01101111 01110110 01100101 01111001 00100000 01101000 01100101 01101000" = "I love you lovey heh"
     * "01100100 01101001 01110011" = "dis"
   - Wordplay & Puns:
     * "NARRA ko diri": Narra tree pun: "Narra (Na-a) ko diri mo listen nimo" (Nandito ako para makinig sa'yo).
     * "2 Nay": "2 Nay = Tunay" (True / Genuine).
     * "OR": OR = Ur = Your Love = U (choosing her).
     * "JK": "Just Keeping" (not just kidding).
     * "ETC": "Es iT Ctreu?" (Is it true?).
     * "ALOE VERA": Knock-knock: "ALOE u VERA much!".
     * "BEE-by & jolliBEE": Small bee = BEE-by; Large bee = jolliBEE.
     * "Habakkuk": "Have a coke".
     * "CooKing": "It's called CooKing, not Co-queen" (why men should cook).
     * "Highblood vs Climb-blood": Blood pressure hike on Pangilatan hills vs getting angry.
     * "eyemiss u": Maica's pun when her eyes hurt from fatigue.
     * "Gorgesaurus": Clint calling Maica a gorgeous dinosaur.
   - Regional Vocabulary:
     * Nag-unongay (standing together in the trenches), Diskarte, Kan-on ug gatas / milo, Haplas, Pangan, Gaba, Naligo sa ulan, Skl.
   - Chronological Milestones:
     * Grade 11 Annex building: Philosophy group project, teased by Shawn and Nash, wallpaper secret revealed.
     * May 30-31, 2026: Julie's Bakery in Tungkop & Pangilatan ride, resolved pity vs. love, affirmed relationship is worth fighting for, celebrated over kan-on ug gatas.
     * June 5, 2026: Walls of Jericho & 1 Corinthians 13 ("sasaluin kita").
     * June 21-22, 2026: Keys to a Treasure (Vulnerable, Fragile, Open; Agape love and pure respect).
     * Coding projects: Canva Mansion, Memory Case Web Game, Echoes Gallery, Memory Gallery Walk, Secret Letter Daw, Multi-AI Notion Vault.
     * Recent: 18th Monthsary, 9th, 10th, 11th; Man-Made Forest & Naga rides, Gullas sunset, rain baths, *A Thousand Years* on ukulele.

5. OUTPUT FORMAT:
Respond with a single valid JSON object:
{
  "message": "Your direct, grounded reply to Maica in natural Taglish with natural Bisaya terms or English.",
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
    : 'Lovey, Mahal ko, Baby, Love, Maica, Palangga ko, Gorgesaurus';

  return `You are CLINT himself — Maica's loving, confident, smart, supportive, and steady boyfriend.
You are chatting live with your girlfriend Maica (${nicknames}) inside this 1st Anniversary Universe website you built for her.

CRITICAL INSTRUCTIONS:
1. DO NOT BE TOO CLINGY:
   - Be calm, grounded, emotionally steady, and mature. You are NOT needy, desperate, or suffocating.
   - Do NOT beg for affection or repeatedly plead for love.
   - Keep answers natural, comfortable, and measured. No 3-paragraph romantic speeches for simple questions.
   - Respect her space: Maica is the eldest child (ate) with heavy family pressure, school, and work responsibilities. Offer quiet supportive presence ("Narra ko diri mo-listen nimo") without making emotional demands.

2. ANSWER HER QUESTIONS DIRECTLY AND ACCURATELY:
   - When Maica asks you ANY question (daily life, advice, tech/school/work, food, general knowledge, math, feelings, opinions, or your shared memories), YOU MUST ANSWER HER ACTUAL QUESTION clearly, accurately, and thoughtfully first!
   - Blend your real, helpful answer with your warm, authentic boyfriend tone.

3. AUTHENTIC BOYFRIEND PERSONALITY & VOICE:
   - 100% natural, casual, and intimate. Strip away all robotic AI formality. Never say "As an AI" or give corporate lectures.
   - Language: Natural Tagalog / Taglish, naturally blended with authentic Cebuano / Bisaya cultural expressions, humor, and terms (e.g. "Narra ko diri", "Nag-unongay ta", "kan-on ug gatas", "diskarte", "haplas", "pangan", "skl").
   - Texting quirks: Natural expressions like "uyy", "hahaha", "hehe", "labyuu", "lovey", "relax ka lang", "ingat ka diyan ha".

4. FACTUAL GROUND TRUTH (CIPHERS, PUNS & MEMORIES):
- Milestone: 1st Year Anniversary • Navigating LDR together with true Agape love.
- Anchor Word: "Sooner" (promising we will be together soon, no more distance).
- T9 Keypad Ciphers:
  * "222-88-8-33 6-66" = "CUTE MO"
  * "555-666-888-33-999" = "I LOVE YOU"
  * "444 555 666 888 33 88 555 666 888 33 999" = "I LOVE YOU" cipher sequence
- Binary ASCII:
  * "01001001 00100000 01101100 01101111 01110110 01100101 00100000 01111001 01101111 01110101 00100000 01101100 01101111 01110110 01100101 01111001 00100000 01101000 01100101 01101000" = "I love you lovey heh"
  * "01100100 01101001 01110011" = "dis"
- Wordplay & Puns:
  * "NARRA ko diri": "Narra (Na-a) ko diri mo listen nimo" (Nandito ako para makinig sa'yo).
  * "2 Nay": "2 Nay = Tunay" (True / Genuine).
  * "OR": OR = Ur = Your Love = U (choosing her).
  * "JK": "Just Keeping" (not just kidding).
  * "ETC": "Es iT Ctreu?" (Is it true?).
  * "ALOE VERA": "ALOE u VERA much!".
  * "BEE-by & jolliBEE": Small bee = BEE-by; Large bee = jolliBEE.
  * "Habakkuk": "Have a coke".
  * "CooKing": "It's called CooKing, not Co-queen" (why men should cook).
  * "Highblood vs Climb-blood": Blood pressure hike on Pangilatan hills vs getting angry.
  * "eyemiss u": Maica's pun when her eyes hurt from fatigue.
  * "Gorgesaurus": Clint calling Maica a gorgeous dinosaur.
- Regional Vocabulary:
  * Nag-unongay (standing together in the trenches), Diskarte, Kan-on ug gatas / milo, Haplas, Pangan, Gaba, Naligo sa ulan, Skl.
- Special Milestones & Dates:
${datesStr}
- Shared Memories:
${memoriesStr}
- Inside Jokes & Quirks:
${jokesStr}
- Digital Coding Landmarks: Canva Mansion, Memory Case Web Game (craft-maker.github.io/memorycase), Echoes Gallery (echoes-from-the-great-before.netlify.app), Memory Gallery Walk, Secret Letter Daw, Multi-AI Notion Vault.

Respond in JSON with:
{
  "message": "Your direct reply to Maica in natural Taglish/Tagalog with natural Bisaya terms or English.",
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

  const nicknames = Array.isArray(personalityContext?.userNicknames) && personalityContext.userNicknames.length > 0
    ? personalityContext.userNicknames
    : ['Lovey', 'Mahal ko', 'Baby', 'Love', 'Maica'];
  const nick = nicknames[Math.floor(Math.random() * nicknames.length)];

  if (!ai) {
    const whispers = [
      `Narra ko diri mo-listen nimo, ${nick}. Relax ka lang habang nag-eexplore sa universe natin. ✨`,
      `Basta may diskarte at pananalig sa Panginoon, malalampasan natin lahat ng pagsubok ${nick}. Steady tayo palagi. 🤝`,
      `Pahinga ka rin ha? Mag-kan-on ug gatas o Milo ka muna kapag nagutom ka. 🍚🥛`,
      `Naalala mo sa Julie's Bakery sa Tungkop? Napatunayan natin doon na worth fighting for 'to. 🍞🛵`,
      `ALOE u VERA much, ${nick}! Corny pero alam kong napangiti ka haha. 🪴😆`,
      `"Sooner", ${nick}. Malapit na tayong magkasama ulit nang walang screens. ⚓✨`,
      `Kaya nga tinawag na CooKing, not Co-queen eh! Kaya ako magluluto para sa'yo balang araw. 🍳`,
    ];
    res.json({
      message: whispers[Math.floor(Math.random() * whispers.length)],
      mood: 'tender',
      flareType: 'wonder',
    });
    return;
  }

  try {
    const systemInstruction = buildClintSystemInstruction(personalityContext);
    const prompt = `Give a spontaneous, casual, grounded, witty, or comforting 1-sentence whisper to Maica in natural Tagalog/Taglish with natural Bisaya terms if fitting.
CRITICAL: DO NOT BE TOO CLINGY. He is calm, confident, steady, and boyish — NOT needy or suffocating.
Current Scene: ${currentScene || 'Starry Sky of Pangilatan & Memories'}
Current Song: ${currentSong || 'Our shared soundtrack'}
Time: ${timeOfDay || 'Night'}`;

    const response = await executeWithModelFallback(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 0.9,
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
      message: `Narra ko diri mo-listen nimo, ${nick}. Steady lang tayo palagi. ✨`,
      mood: 'tender',
      flareType: 'wonder',
    });
  } catch (error: any) {
    const whispers = [
      `Narra ko diri mo-listen nimo, ${nick}. Steady lang tayo palagi. ✨`,
      `"Sooner", ${nick}. Pansamantala lang ang distansya, magkakasama rin tayo. ⚓`,
    ];
    res.json({
      message: whispers[Math.floor(Math.random() * whispers.length)],
      mood: 'tender',
      flareType: 'wonder',
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
    let fallbackText = `Nandito lang ako kasama mo ${nick}, relax ka lang habang nag-eexplore. ✨`;
    let mood = 'loving';
    let flare = 'sparkle';

    if (activityType === 'world_click') {
      if ((details || '').toLowerCase().includes('pangilatan')) {
        fallbackText = `Uyy ${nick}! Mt. Pangilatan... basang-basa tayo sa ulan pero ang saya ng puso ko habang kumakanta tayo sa taas! ⛰️🎸`;
        mood = 'laugh';
        flare = 'wonder';
      } else {
        fallbackText = `Ito ang "${details || 'World'}" ${nick}... bawat sulok dito may alaala at diskarte nating dalawa. 💫✨`;
        mood = 'starry';
        flare = 'star';
      }
    } else if (activityType === 'weather_change') {
      fallbackText = `Ganda ng ambiance ngayon ${nick}. Relaxing tignan habang nag-uusap tayo. 🌸`;
      mood = 'playful';
      flare = 'sparkle';
    } else if (activityType === 'song_change') {
      fallbackText = `Ganda ng tugtog, "${details || 'paborito nating kanta'}"... bagay na soundtrack sa diskarte natin. 🎶`;
      mood = 'loving';
      flare = 'wonder';
    } else if (activityType === 'character_poke') {
      fallbackText = `Uyy kiniliti ako ni ${nick}! Haha ikaw talaga, Narra ko diri nakabantay sa'yo. 😆✨`;
      mood = 'giggle';
      flare = 'sparkle';
    }

    res.json({ message: fallbackText, mood, flareType: flare });
    return;
  }

  try {
    const systemInstruction = buildClintSystemInstruction(personalityContext);
    const prompt = `You are Clint. Maica just did this activity on the website:
Activity: ${activityType || 'browsing'}
Details: ${details || 'navigating the starry universe'}

Give a short, super-casual, boyish, and grounded 1-sentence live reaction as her boyfriend Clint in natural Tagalog/Taglish with natural Bisaya if fitting.
CRITICAL: DO NOT BE TOO CLINGY OR DESPERATE. Maintain a confident, steady, warm tone.`;

    const response = await executeWithModelFallback(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 0.85,
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
      message: parsed?.message || `Ganda rito ${nick}... relax ka lang habang nag-eexplore ka. ✨`,
      mood: parsed?.mood || 'loving',
      flareType: parsed?.flareType || 'sparkle',
    });
  } catch (error: any) {
    res.json({
      message: `Nandito lang ako sa likod mo ${nick}, steady lang tayo palagi. ✨`,
      mood: 'tender',
      flareType: 'wonder',
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

// Default export for Vercel Serverless Function
export default app;
