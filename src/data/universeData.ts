import { WorldStar, AudioTrack, Letter, MemoryItem, RandomPhotoMemory, TimelineMilestone, TravelDream } from '../types';
import { PANGILATAN_FOLDER_URL, RANDOM_MEMORIES_FOLDER_URL, getDriveThumbnailUrl } from '../utils/driveHelper';

export const MEMORY_GALLERY_WALK_URL = 'https://memory-gallary-walk.vercel.app/';

export { PANGILATAN_FOLDER_URL, RANDOM_MEMORIES_FOLDER_URL };

export const WORLDS: WorldStar[] = [
  {
    id: 'our-first-year',
    name: 'Our First Year',
    url: '#first-year',
    active: true,
    order: 1,
    previewLine: 'Look, Lovey... our first year, hahahah.',
    starColor: '#f4d58d',
    unlockedDate: '2025-11-12',
    tagline: 'Diri Nagsugod ang Tanan',
    description: 'Bawat late-night call, mga katawa-tawa nga moments, ug mga gagmay nga butang nga nagpatig-a sa atong pagsalig.',
    iconName: 'Sparkles',
  },
  {
    id: 'memory-gallery',
    name: 'Memory Gallery',
    url: 'https://memory-gallary-walk.vercel.app/',
    active: true,
    order: 2,
    previewLine: 'Grabe, diri puno ug memories... ikaw na tan-aw, hahahah.',
    acheLine: '...alam mo, naa jud toy time nga halos di na ta magka-storya sa una... pero andito pa rin tayo. "Sooner", ana ka ato. Tapos look at us now.',
    starColor: '#c9a7eb',
    unlockedDate: '2026-01-10',
    tagline: 'Mga Tagpong Di Jud Malimtan',
    description: 'Mga litrato ug handumanan — gikan sa tugnaw nga bukid sa Pangilatan hantod sa 3D interactive virtual gallery walk sa memory-gallary-walk.vercel.app.',
    iconName: 'Image',
  },
  {
    id: 'letters',
    name: 'Letters',
    url: '#letters',
    active: true,
    order: 3,
    previewLine: 'Naa koy gipang-sulat diri para sa\'yo... basaha lang, hehe.',
    acheLine: 'Actually, diri nako gibutang ang mga butang nga lisod usahay isulti ug diretso... basaha lang, Lovey. Na appreciate jud nako tanan imoha gibuhat.',
    starColor: '#f7b2ad',
    unlockedDate: '2026-03-01',
    tagline: 'Liham sa Pikas nga Dapit',
    description: 'Mga kinasingkasing nga sulat para sa mga gabii nga mingaw ug sa mga adlaw nga ikaw akong kusog.',
    iconName: 'Mail',
  },
  {
    id: 'travel-world',
    name: 'Travel World',
    url: '#travel',
    active: false,
    order: 4,
    previewLine: 'Fast forward ta gamay... lakaw-lakaw ta diri puhon.',
    starColor: '#9ecae1',
    unlockedDate: null,
    tagline: 'Mga Dalan nga Atong Pagalaktan',
    description: 'Mga lugar nga sabay natong adtoan puhon human sa distansya. Step by step, maabot ra na nato.',
    iconName: 'Compass',
  },
];

export const PANGILATAN_LINES = [
  "Uyy, look... si Pangilatan. Di ba funny, wala siya gasunod sa linya? Galakaw-lakaw ra — murag kita sa una. Umiikot, pero nagkita ra gihapon.",
  "Hahahah remember diri? Basa kaayo ta sa ulan ato. Pero tan-awa, andito pa rin tayo ngayon, mas lig-on pa.",
  "Diri pud ta nag-guitar ug nikanta, no? Dili kaayo nindot akong tingog pero — hahahah — gipaminaw gihapon nimo.",
  "Actually, looking back sa Pangilatan... dira nako na-realize nga basta ikaw akong tupad, bisan asa nga lugar mahimong panimalay.",
  "Uyy, nakit-an nimo siya. Special jud ni nga bituin para nato. Alam mo na 'yan, Lovey.",
];

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'track-01',
    title: "Say You Won't Let Go",
    artist: 'James Arthur',
    ambientVibe: 'Acoustic Warmth & Gentle Melodies',
    tempo: 85,
    src: '/music/say-you-wont-let-go.mp3',
  },
  {
    id: 'track-02',
    title: 'Supermarket Flowers',
    artist: 'Ed Sheeran',
    ambientVibe: 'Soft Piano Serenade & Heartfelt Peace',
    tempo: 78,
    src: '/music/supermarket-flowers.mp3',
  },
  {
    id: 'track-03',
    title: 'Those Eyes',
    artist: 'New West',
    ambientVibe: 'Dreamy Twilight Reverb & Cosmic Harmony',
    tempo: 90,
    src: '/music/those-eyes.mp3',
  },
];

export const MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Tuktok sa Pangilatan',
    location: 'Pangilatan Viewdeck',
    date: 'Hulyo 2026 • Araw ng Pagtatagpo',
    description: 'Nung umakyat tayo, basa man sa ulan ug tugnaw ang hangin, nag-gunitay ta sa kamot samtang gatan-aw sa clouds. Ka-nice sa pamati nga ikaw akong tupad.',
    quote: '"Bisan unsa kalayo atong gilakaw, basta ikaw akong kauban, worth it jud pirmi."',
    imageType: 'selfie',
    imageSrc: 'https://drive.google.com/file/d/10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_/view?usp=drive_link',
  },
  {
    id: 'mem-2',
    title: 'Gatan-aw sa Bukid',
    location: 'Pangilatan Hills Grassland',
    date: 'Matahimik na Hapon',
    description: 'Nakatutok ra ka sa layo samtang gihuyop sa hangin imong buhok. Dira nako na-realize kung unsa ka bililhon nga ampingan tika.',
    quote: '"Sa kahilom sa bukid, ikaw ra jud akong kalinaw."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB/view?usp=drive_link',
  },
  {
    id: 'mem-3',
    title: 'Unang Silip sa Liwayway',
    location: 'Pangilatan Peak Ridge',
    date: 'Hulyo 4, 2026 • Dapit-Umaga',
    description: 'Ang unang silaw sa adlaw nga misulod sa panganod samtang dungan natong gisugat ang bag-ong kabuntagon.',
    quote: '"Sa kada pagsubang sa adlaw, ikaw akong unang ipasalamat sa Ginoo."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz/view?usp=drive_link',
  },
  {
    id: 'mem-4',
    title: 'Dapit-Umaga sa Pangilatan',
    location: 'Pangilatan Horizon',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    description: 'Bugnaw kaayo ang simoy sa bukid pero init atong kasingkasing kay magka-holding hands ta.',
    quote: '"Walay kabugnaw nga dili mawa basta ikaw akong gakos."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ/view?usp=drive_link',
  },
];

export const RANDOM_MEMORY_PHOTOS: RandomPhotoMemory[] = [
  {
    id: 'photo-pangilatan-1',
    src: 'https://drive.google.com/file/d/10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_/view?usp=drive_link',
    title: 'Tuktok sa Pangilatan',
    caption: 'Bisan unsa pa kataas ang tungason, basta ikaw akong kauban, sayon ra kaayo ang dalan.',
    location: 'Pangilatan Mountain',
    date: 'Araw ng Pagtatagpo',
    glowColor: '#9dbf9a',
  },
  {
    id: 'photo-pangilatan-2',
    src: 'https://drive.google.com/file/d/1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB/view?usp=drive_link',
    title: 'Ang Paborito Nakong Smile',
    caption: 'Sa kada tan-aw nimo nako, murag niana jud akong panimalay.',
    location: 'Pangilatan Trails',
    date: 'Matahimik na Hapon',
    glowColor: '#fb7185',
  },
  {
    id: 'photo-pangilatan-3',
    src: 'https://drive.google.com/file/d/1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz/view?usp=drive_link',
    title: 'Unang Silip sa Liwayway',
    caption: 'Kauban kang misugat sa unang sinag sa adlaw sa tumoy sa bukid.',
    location: 'Pangilatan Ridge',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    glowColor: '#f4d58d',
  },
  {
    id: 'photo-pangilatan-4',
    src: 'https://drive.google.com/file/d/16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ/view?usp=drive_link',
    title: 'Kabuntagon sa Panganod',
    caption: 'Tugnaw man ang hangin, ang kainit sa imong kamot akong dangpanan.',
    location: 'Pangilatan Overlook',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    glowColor: '#38bdf8',
  },
];

export const LETTERS: Letter[] = [
  {
    id: 'letter-1',
    title: 'Para sa Aking Lovey, Bisag Unsa Kalayo',
    date: 'Mahalagang Araw',
    excerpt: 'Dili lalim ang LDR, pero whenever I think of you, mawa tanan kakapoy...',
    content: [
      'Dearest Maica, aking Lovey,',
      'Alam mo bang sa bawat gabing hilom ang palibot ug naghigda ko, ikaw dayon akong mahinumdoman? Lisod usahay ang magkalayo — kanang mga adlaw nga gusto tika gakson pag kapoy ka, o magkuyog ta sa motor bisan walay klarong adtoan.',
      'Pero kahibalo ka kung unsa ang mas lig-on kaysa sa distansya? The certainty nga ikaw ang tawo nga gusto nako kauban sa tanang yugto sa akong kinabuhi.',
      'Salamat kaayo sa imong pasensya, sa pagpabati nako nga safe ko bisan sa screen ra ta mag-talk, ug sa imong kasingkasing nga kanunay tinuod.',
      'Hinding-hindi ako mapapagod maghintay ug magpaningkamot para sa adlaw nga wala na tay airport goodbyes or mag-ihap ug mga buwan bago magkita.',
    ],
    signature: 'Na appreciate jud nako tanan, Clint',
    tag: 'Kinasingkasing nga Liham',
    sealColor: '#e07a5f',
  },
  {
    id: 'letter-2',
    title: 'Nung Halos Di Ta Magka-storya ("Sooner")',
    date: 'Panahon ng Pagtibay',
    excerpt: 'Remember katong mga panahong bug-at ang tanan? Pero look at us now...',
    content: [
      'Lovey... bitaw no.',
      'Dili perpekto atong agi. Naay mga panahon sa una nga murag kapoy kaayo, nga lisod abuton ang usag-usa tungod sa layo ug sa kadaghan sa gihuna-huna.',
      'Pero naa kay usa ka word nga pirmi isulti nako: "Sooner."',
      'Simple ra kaayo siya, pero I swear, mao to akong gikuptan. Sabi mo, moabot ra ang panahon nga mahimong sayon ang tanan. Ug tinuod jud — bawat unos nga miagi, imbes nga magpalayo nato, mas gipalig-on ta.',
      'Salamat kay wala ka nibitaw. Salamat sa pagpili nako adlaw-adlaw.',
    ],
    signature: 'Kanunay naga-paluyo nimo, Clint',
    tag: 'Alaala ug Pagtibay',
    sealColor: '#81b29a',
  },
  {
    id: 'letter-3',
    title: 'Atong Saad sa Umaabot',
    date: 'Pangarap Nating Dalawa',
    excerpt: 'Dili ra ni handumanan sa nilabay — pundasyon ni sa atong ugma...',
    content: [
      'Maica ko,',
      'Gihimo nako kining Ating Universe dili lang para balikan ang niaging tuig, kundi para ipahinumdom nimo nga tibuok kalawakan pa atong tukuron nga magkauban.',
      'Moabot ra ang adlaw nga momata ta sa buntag nga walay timer ang call, walay flight nga kinahanglan apason — kape ra ug ikaw sa akong kilid.',
      'Daghan pa tang adtoan nga mga dalan, Lovey. Ug sa kada dalan, ikaw ug ikaw ra jud akong pilion.',
      'Mahal kaayo tika, more than all the stars in the night sky.',
    ],
    signature: 'Imong katuwang hangtod sa kahangturan, Clint',
    tag: 'Pangako sa Hinaharap',
    sealColor: '#3d405b',
  },
];

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    month: 'Unang Yugto',
    title: 'Ang Unang "Uyy" ug Tawanan',
    story: 'Kung paano nagsugod sa simpleng chat hangtod naging 4am calls nga dili na ganahan mag-end sa phone.',
    highlight: 'Dili mamalayan ang oras basta ikaw ang ka-istorya.',
    emoji: '🌙',
  },
  {
    month: 'Araw ng Pagtatapat',
    title: 'Nung Naging "Tayo"',
    story: 'Ang pinakamasayang desisyon sa akong kinabuhi — ang piliin ka nga maging panimalay sa akong kasingkasing.',
    highlight: 'Official na aking Lovey.',
    emoji: '✨',
  },
  {
    month: 'Araw sa Pangilatan',
    title: 'Kanta ug Ulan sa Bukid',
    story: 'Misaka ta sa Pangilatan, nag-guitar ug nikanta bisan nag-ulan. Walay paki sa lapok o tugnaw basta magkuyog.',
    highlight: 'Basta ikaw akong kauban, nindot bisan asang dapita.',
    emoji: '⛰️',
  },
  {
    month: 'Mga Gabi ng LDR',
    title: 'Nakatulog sa Call',
    story: 'Bisan screen ra ang tunga, madungog lang imong ginhawa ug tingog, payapa na kaayo akong gabii.',
    highlight: 'Distansya can\'t stop genuine soul connection.',
    emoji: '💫',
  },
  {
    month: 'Anniversary Milestone',
    title: 'Usa ka Tuig nga Paghigugma',
    story: '365 ka adlaw nga pagpili sa usag-usa. Patunay nga ang tinuod nga pagbati dili masukod sa kilometro.',
    highlight: 'First year down, lifetime to go.',
    emoji: '💖',
  },
];

export const TRAVEL_DREAMS: TravelDream[] = [
  {
    destination: 'Japan Cherry Blossom Season',
    tagline: 'Lakaw sa ilalom sa Sakura ug gabi sa Kyoto',
    activities: ['Mag-rent og kimono', 'Mokaon og authentic matcha ug ramen', 'Mag-night stroll sa Dotonbori'],
    status: 'sooner',
    note: 'Gusto tika picturan samtang gakatagak ang sakura petals sa imong buhok.',
  },
  {
    destination: 'Siargao Island Getaway',
    tagline: 'Motorbike rides ilalom sa palm trees ug sunset surf',
    activities: ['Mag-motor sa palm tree road', 'Sugba Lagoon floating', 'Magtan-aw og stars sa baybayon'],
    status: 'planned',
    note: 'Kanang ikaw ang naggakos sa akong likod samtang nagmotor ta sa kilid sa dagat.',
  },
  {
    destination: 'Baguio & Sagada Foggy Mornings',
    tagline: 'Init nga kape, baga nga jacket, ug gakos sa tugnaw',
    activities: ['Moinom og strawberry taho', 'Magkape sa overlooking cloud cafe', 'Stargazing sa bugnaw nga bukid'],
    status: 'dreaming',
    note: 'Walay mas lami kaysa sa imong gakos samtang bugnaw kaayo ang simoy sa bukid.',
  },
];

export const WISH_QUOTES = [
  "Wish granted: Mas lalo kitang aalagaan at mamahalin araw-araw.",
  "Pangako, magkikita ra ta sooner, Lovey.",
  "Salamat sa pananatili sa akong kilid sa bawat unos ug ulan.",
  "Bisag unsa kalayo, iisang kalawakan ang panimalay natong duha.",
  "Ikaw ang pinakanindot nga pag-ampo nga gitubag sa Ginoo.",
  "Sa kada pagtan-aw nimo sa mga bituin, hinumdumi nga naay Clint nga nagmahal sa'yo pirmi.",
];

export interface GuideLine {
  text: string;
  mood: 'happy' | 'loving' | 'starry' | 'playful' | 'tender' | 'ache' | 'giggle' | 'laugh' | 'angry' | 'curious' | 'sleepy';
  actionHint?: string;
}

export const GUIDE_INTERACTIVE_DIALOGUES: GuideLine[] = [
  {
    text: "Uyy Maica! Hahahah, tan-awa akong nagdilaab nga kalayo! Diri ra ko sa imong kilid samtang nagtan-aw ta sa atong kalangitan. ✨🔥",
    mood: 'laugh',
    actionHint: 'I-scroll paubos para masilip ang mga mundo',
  },
  {
    text: "Heheheh! Nag-flare up akong mga embers kay perti nakong lipaya nga kauban tika karon! 😆✨",
    mood: 'giggle',
  },
  {
    text: "Ehem! Ayaw ko'g binuangi ha, kay mu-blaze ko diri parehas ni Ember sa Elemental! Grrr... pero sweet man ko sa'yo pirmi hehe. 🔥😤",
    mood: 'angry',
  },
  {
    text: "Tan-awa gud... kada bituin diri, naay gamay nga memory ninyo ni Clint. Bisan layo, hayag kaayo tan-awon no? 💫",
    mood: 'loving',
  },
  {
    text: "Psst! Nakabantay ka sa mga naglutaw-lutaw nga litrato sa kilid? I-tap to sila, cute kaayo to nga mga kuha sa Pangilatan! 📸",
    mood: 'playful',
    actionHint: 'Sulayi pag-tap ang naglutaw nga litrato',
  },
  {
    text: "Hmmm? Unsa kaha'ng sunod natong pangarap nga adtoon puhon? Japan o Siargao? Tan-awon nato! 🧐🗺️",
    mood: 'curious',
  },
  {
    text: "Ka-nice sa music no? Relax lang ka diha samtang nagbasa. Pwede nimo i-pause or ilisdan sa music player ubos. 🎶",
    mood: 'tender',
  },
  {
    text: "Kahit LDR ta karon, look up usahay ha... iisang langit ug iisang buwan ra gihapon atong ginatan-aw gabi-gabi. 🌙",
    mood: 'loving',
  },
  {
    text: "Heheh! Cute kaayo ka tan-awon samtang nag-smile ka sa screen karon. Na-appreciate jud nako na. 🙈💕",
    mood: 'playful',
  },
  {
    text: "Haaaaay... katugon naman ko gamay, pero bantayan gihapon tika samtang nag-basa ka diri. 😴🌙",
    mood: 'sleepy',
  },
  {
    text: "Tan-awa tong Pangilatan nga bituin sa kilid! Nag-orbit siya sa iyang kaugalingon kay special kaayo tong bukid sa inyong duha. ⛰️",
    mood: 'starry',
    actionHint: 'I-tap ang Pangilatan Star para mag-explore',
  },
  {
    text: "Remember katong halos mawad-an ta ug gana tungod sa layo? Pero you said 'Sooner'. Kupti jud to pirmi ha. 💖",
    mood: 'tender',
  },
  {
    text: "Ay hala, naay shooting star o! I-tap dayon aron makahimo kag hiling sa uniberso. 🌠",
    mood: 'starry',
    actionHint: 'Paghulat og molabay nga bulalakaw',
  },
  {
    text: "Naka-open na ba ka sa Letters World? Naa koy mga sinulat didto gikan sa akong kasingkasing. 💌",
    mood: 'loving',
    actionHint: 'Buksi ang Letters World',
  },
  {
    text: "Salamat sa pag-exist, Maica. You make ordinary days feel so special and meaningful. ✨",
    mood: 'tender',
  },
  {
    text: "Bisan unsa pay mahitabo, remember that we're walking the same direction together. 🤝",
    mood: 'happy',
  },
];

export const GUIDE_EXPLORATION_TIPS: GuideLine[] = [
  {
    text: "💡 Tip: I-tap ang matag konstelasyon (World 1, 2, ug 3) para makita ang mga kwento, milestones, ug gallery!",
    mood: 'starry',
  },
  {
    text: "💡 Tip: Gamita ang 'Alaala sa Bituin' button sa ubos para magpalupad og mga random nga litrato ninyo sa Pangilatan!",
    mood: 'happy',
  },
  {
    text: "💡 Tip: Sa Pangilatan modal, pwede nimo i-click ang mga arrows para tan-awon ang 8 ka tinuod nga litrato sa inyong pagsaka!",
    mood: 'starry',
  },
  {
    text: "💡 Tip: Pwede nimo i-tap si Lumi anytime kung gusto ka og munting kwento, lambing, or kalingawan!",
    mood: 'playful',
  },
  {
    text: "💡 Tip: Sa World 4 (Travel World), makita nimo ang mga pangarap nga destinasyon sama sa Japan, Siargao, ug Baguio!",
    mood: 'loving',
  },
];

export const GUIDE_IDLE_CHIRPS: GuideLine[] = [
  {
    text: "Nandito lang ko, hilom nga nagtan-aw sa atong universe uban nimo... ✨",
    mood: 'tender',
  },
  {
    text: "Basta naay pagsalig ug pag-amuma, kaya ra kaayo bisan unsa kalayo. 💖",
    mood: 'loving',
  },
  {
    text: "Kumusta imong adlaw diha, Lovey? Ayaw kalimot ug inom ug tubig ug pahuway ha. 😊",
    mood: 'happy',
  },
  {
    text: "Ka-fresh jud sa hangin sa Pangilatan sa una no? Basa sa ulan pero perti natong ngisi. ⛰️🌧️",
    mood: 'tender',
  },
  {
    text: "Fast forward ta gamay... puhon dungan na jud ta magtan-aw sa tinud-anay nga mga bituin sa gawas. 🌌",
    mood: 'starry',
  },
];
