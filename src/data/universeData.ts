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
    tagline: 'Dito Nagsimula ang Lahat',
    description: 'Bawat late-night call, mga nakakatawang moments, at ang mga simpleng bagay na nagpatibay sa ating tiwala sa isa\'t isa.',
    iconName: 'Sparkles',
  },
  {
    id: 'memory-gallery',
    name: 'Memory Gallery',
    url: 'https://memory-gallary-walk.vercel.app/',
    active: true,
    order: 2,
    previewLine: 'Grabe, dito puno ng memories... ikaw na tumingin, hahahah.',
    acheLine: '...alam mo, may time talaga dati na halos hindi na tayo magkausap... pero andito pa rin tayo. "Sooner", sabi mo noon. Tapos look at us now.',
    starColor: '#c9a7eb',
    unlockedDate: '2026-01-10',
    tagline: 'Mga Tagpong Hindi Malilimutan',
    description: 'Mga larawan at alaala — mula sa malamig na hangin sa tuktok ng Pangilatan hanggang sa 3D interactive virtual gallery walk sa memory-gallary-walk.vercel.app.',
    iconName: 'Image',
  },
  {
    id: 'letters',
    name: 'Letters',
    url: '#letters',
    active: true,
    order: 3,
    previewLine: 'May mga isinulat ako rito para sa\'yo... basahin mo lang, hehe.',
    acheLine: 'Actually, dito ko inilagay ang mga bagay na mahirap minsan sabihin nang diretso... basahin mo lang, Lovey. Naa-appreciate ko talaga lahat ng ginagawa mo.',
    starColor: '#f7b2ad',
    unlockedDate: '2026-03-01',
    tagline: 'Liham Mula sa Kabilang Ibayo',
    description: 'Mga taos-pusong liham para sa mga gabing nangungulila at sa mga araw na ikaw ang aking lakas.',
    iconName: 'Mail',
  },
  {
    id: 'travel-world',
    name: 'Travel World',
    url: '#travel',
    active: false,
    order: 4,
    previewLine: 'Fast forward tayo nang konti... maglalakbay tayo rito balang araw.',
    starColor: '#9ecae1',
    unlockedDate: null,
    tagline: 'Mga Landas na Ating Lalakbayin',
    description: 'Mga lugar na sabay nating pupuntahan pagkatapos ng distansya. Step by step, mararating din natin \'to.',
    iconName: 'Compass',
  },
];

export const PANGILATAN_LINES = [
  "Uyy, look... si Pangilatan. Di ba nakakatuwa, hindi siya sumusunod sa linya? Lumulutang lang — parang tayo noon. Umiikot, pero nagtagpo pa rin sa dulo.",
  "Hahahah remember dito? Basang-basa tayo sa ulan noon. Pero tingnan mo, andito pa rin tayo ngayon, mas matatag pa.",
  "Dito rin tayo nag-gitara at kumanta, di ba? Kahit hindi ganoon kaganda boses ko pero — hahahah — pinakinggan mo pa rin.",
  "Actually, looking back sa Pangilatan... doon ko na-realize na basta ikaw ang katabi ko, kahit saan ay parang tahanan.",
  "Uyy, nahanap mo siya. Napaka-espesyal talaga ng bituing ito para sa ating dalawa. Alam mo na 'yan, Lovey.",
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
    title: 'Tuktok ng Pangilatan',
    location: 'Pangilatan Viewdeck',
    date: 'Hulyo 2026 • Araw ng Pagtatagpo',
    description: 'Noong umakyat tayo, basang-basa man sa ulan at malamig ang hangin, magkahawak ang mga kamay natin habang pinagmamasdan ang mga ulap. Ang sarap sa pakiramdam na ikaw ang katabi ko.',
    quote: '"Kahit gaano kalayo ang nilakad natin, basta ikaw ang kasama ko, palaging worth it."',
    imageType: 'selfie',
    imageSrc: 'https://drive.google.com/file/d/10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_/view?usp=drive_link',
  },
  {
    id: 'mem-2',
    title: 'Nakatitig sa Kabundukan',
    location: 'Pangilatan Hills Grassland',
    date: 'Matahimik na Hapon',
    description: 'Nakatutok ka lang sa malayo habang hinahangin ang iyong buhok. Doon ko na-realize kung gaano kahalaga na ingatan at mahalin ka araw-araw.',
    quote: '"Sa katahimikan ng bundok, ikaw ang aking kapayapaan."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB/view?usp=drive_link',
  },
  {
    id: 'mem-3',
    title: 'Unang Silip sa Liwayway',
    location: 'Pangilatan Peak Ridge',
    date: 'Hulyo 4, 2026 • Dapit-Umaga',
    description: 'Ang unang sinag ng araw na sumilip sa pagitan ng mga ulap habang sabay nating sinalubong ang bagong umaga.',
    quote: '"Sa bawat pagsikat ng araw, ikaw ang unang ipinagpapasalamat ko sa Diyos."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz/view?usp=drive_link',
  },
  {
    id: 'mem-4',
    title: 'Dapit-Umaga sa Pangilatan',
    location: 'Pangilatan Horizon',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    description: 'Napakalamig ng simoy ng hangin sa bundok pero mainit ang ating puso dahil magka-holding hands tayo.',
    quote: '"Walang lamig na hindi kayang pawiin ng iyong yakap."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ/view?usp=drive_link',
  },
];

export const RANDOM_MEMORY_PHOTOS: RandomPhotoMemory[] = [
  {
    id: 'photo-pangilatan-1',
    src: 'https://drive.google.com/file/d/10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_/view?usp=drive_link',
    title: 'Tuktok ng Pangilatan',
    caption: 'Kahit gaano pa kataas ang akyatin, basta ikaw ang kasama ko, napakadali ng bawat hakbang.',
    location: 'Pangilatan Mountain',
    date: 'Araw ng Pagtatagpo',
    glowColor: '#9dbf9a',
  },
  {
    id: 'photo-pangilatan-2',
    src: 'https://drive.google.com/file/d/1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB/view?usp=drive_link',
    title: 'Ang Paborito Kong Ngiti',
    caption: 'Sa bawat tingin mo sa akin, pakiramdam ko ay nasa tunay na tahanan ako.',
    location: 'Pangilatan Trails',
    date: 'Matahimik na Hapon',
    glowColor: '#fb7185',
  },
  {
    id: 'photo-pangilatan-3',
    src: 'https://drive.google.com/file/d/1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz/view?usp=drive_link',
    title: 'Unang Silip sa Liwayway',
    caption: 'Kasama kang sumalubong sa unang sinag ng araw sa ibabaw ng mga ulap.',
    location: 'Pangilatan Ridge',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    glowColor: '#f4d58d',
  },
  {
    id: 'photo-pangilatan-4',
    src: 'https://drive.google.com/file/d/16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ/view?usp=drive_link',
    title: 'Umaga sa Ibabaw ng mga Ulap',
    caption: 'Malamig man ang simoy ng hangin, ang init ng kamay mo ang aking kanlungan.',
    location: 'Pangilatan Overlook',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    glowColor: '#38bdf8',
  },
];

export const LETTERS: Letter[] = [
  {
    id: 'letter-1',
    title: 'Para sa Aking Lovey, Gaano Man Kalayo',
    date: 'Mahalagang Araw',
    excerpt: 'Hindi madali ang LDR, pero whenever I think of you, nawawala lahat ng pagod...',
    content: [
      'Dearest Maica, aking Lovey,',
      'Alam mo bang sa bawat gabing tahimik ang paligid at nakahiga ako, ikaw agad ang naaalala ko? Mahirap minsan ang magkalayo — \'yung mga araw na gusto kitang yakapin kapag pagod ka, o mag-motor tayo kahit walang tiyak na pupuntahan.',
      'Pero alam mo ba kung ano ang mas matatag kaysa sa distansya? The certainty na ikaw ang taong gusto kong makasama sa lahat ng yugto ng aking buhay.',
      'Maraming salamat sa iyong pasensya, sa pagpapadama sa akin na ligtas ako kahit sa screen lang tayo nag-uusap, at sa puso mong laging tapat.',
      'Hinding-hindi ako mapapagod maghintay at magsumikap para sa araw na wala nang airport goodbyes o pagbibilang ng mga buwan bago magkita.',
    ],
    signature: 'Naa-appreciate ko talaga ang lahat, Clint',
    tag: 'Taos-pusong Liham',
    sealColor: '#e07a5f',
  },
  {
    id: 'letter-2',
    title: 'Noong Halos Hindi Tayo Magkausap ("Sooner")',
    date: 'Panahon ng Pagtibay',
    excerpt: 'Remember noong mga panahong mabigat ang lahat? Pero look at us now...',
    content: [
      'Lovey... totoo nga.',
      'Hindi perpekto ang ating pinagdaanan. May mga panahon noon na parang nakakapagod, na mahirap abutin ang isa\'t isa dahil sa layo at sa dami ng iniisip.',
      'Pero may isang salita kang laging sinasabi sa akin: "Sooner."',
      'Napakasimple lang noon, pero I swear, \'yun ang hinawakan ko. Sabi mo, darating din ang panahon na magiging magaan ang lahat. At totoo nga — bawat unos na dumaan, imbes na magpalayo sa atin, mas lalo tayong pinatatag.',
      'Salamat dahil hindi ka bumitaw. Salamat sa pagpili sa akin araw-araw.',
    ],
    signature: 'Palaging nakaalalay sa\'yo, Clint',
    tag: 'Alaala at Pagtibay',
    sealColor: '#81b29a',
  },
  {
    id: 'letter-3',
    title: 'Ating Pangako sa Hinaharap',
    date: 'Pangarap Nating Dalawa',
    excerpt: 'Hindi lang ito alaala ng nakaraan — pundasyon ito ng ating bukas...',
    content: [
      'Maica ko,',
      'Ginawa ko ang ating Universe hindi lang para balikan ang nakaraang taon, kundi para ipaalala sa\'yo na buong kalawakan pa ang ating bubuuin nang magkasama.',
      'Darating din ang araw na gigising tayo sa umaga na walang timer ang tawag, walang flight na kailangang habulin — kape lang at ikaw sa aking tabi.',
      'Marami pa tayong lalakbaying landas, Lovey. At sa bawat daan, ikaw at ikaw pa rin ang aking pipiliin.',
      'Mahal na mahal kita, more than all the stars in the night sky.',
    ],
    signature: 'Iyong katuwang magpakailanman, Clint',
    tag: 'Pangako sa Hinaharap',
    sealColor: '#3d405b',
  },
];

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    month: 'Unang Yugto',
    title: 'Ang Unang "Uyy" at Tawanan',
    story: 'Kung paano nagsimula sa simpleng chat hanggang naging 4am calls na ayaw nang ibaba ang telepono.',
    highlight: 'Hindi namamalayan ang oras basta ikaw ang kausap.',
    emoji: '🌙',
  },
  {
    month: 'Araw ng Pagtatapat',
    title: 'Noong Naging "Tayo"',
    story: 'Ang pinakamasayang desisyon sa aking buhay — ang piliin ka na maging tahanan ng aking puso.',
    highlight: 'Official na aking Lovey.',
    emoji: '✨',
  },
  {
    month: 'Araw sa Pangilatan',
    title: 'Kanta at Ulan sa Bundok',
    story: 'Umakyat tayo sa Pangilatan, nag-gitara at kumanta kahit umuulan. Walang pakialam sa putik o lamig basta magkasama.',
    highlight: 'Basta ikaw ang kasama, maganda kahit saang lugar.',
    emoji: '⛰️',
  },
  {
    month: 'Mga Gabi ng LDR',
    title: 'Nakatulog sa Call',
    story: 'Kahit screen lang ang pagitan, marinig lang ang iyong paghinga at tinig, payapang-payapa na ang aking gabi.',
    highlight: 'Distansya can\'t stop genuine soul connection.',
    emoji: '💫',
  },
  {
    month: 'Anniversary Milestone',
    title: 'Isang Taon ng Pagmamahalan',
    story: '365 na araw ng pagpili sa isa\'t isa. Patunay na ang tunay na pag-ibig ay hindi nasusukat sa kilometro.',
    highlight: 'First year down, lifetime to go.',
    emoji: '💖',
  },
];

export const TRAVEL_DREAMS: TravelDream[] = [
  {
    destination: 'Japan Cherry Blossom Season',
    tagline: 'Paglalakad sa ilalim ng Sakura at gabi sa Kyoto',
    activities: ['Mag-rent ng kimono', 'Kumain ng authentic matcha at ramen', 'Mag-night stroll sa Dotonbori'],
    status: 'sooner',
    note: 'Gusto kitang kuhanan ng litrato habang dahan-dahang nalalaglag ang sakura petals sa buhok mo.',
  },
  {
    destination: 'Siargao Island Getaway',
    tagline: 'Motorbike rides sa ilalim ng mga puno ng niyog at sunset surf',
    activities: ['Mag-motor sa palm tree road', 'Sugba Lagoon floating', 'Manood ng stars sa tabing-dagat'],
    status: 'planned',
    note: 'Yung ikaw ang nakayakap sa likod ko habang nagmo-motor tayo sa tabi ng dagat.',
  },
  {
    destination: 'Baguio & Sagada Foggy Mornings',
    tagline: 'Mainit na kape, makapal na jacket, at yakap sa lamig',
    activities: ['Uminom ng strawberry taho', 'Magkape sa overlooking cloud cafe', 'Stargazing sa malamig na bundok'],
    status: 'dreaming',
    note: 'Walang hihigit sa yakap mo habang napakalamig ng simoy ng hangin sa kabundukan.',
  },
];

export const WISH_QUOTES = [
  "Wish granted: Mas lalo kitang aalagaan at mamahalin araw-araw.",
  "Pangako, magkikita rin tayo sooner, Lovey.",
  "Salamat sa pananatili sa aking tabi sa bawat unos at ulan.",
  "Kahit gaano kalayo, iisang kalawakan ang tahanan nating dalawa.",
  "Ikaw ang pinakamagandang panalangin na sinagot ng Diyos.",
  "Sa bawat pagtingin mo sa mga bituin, tandaan mong may Clint na nagmamahal sa'yo palagi.",
];

export interface GuideLine {
  text: string;
  mood: 'happy' | 'loving' | 'starry' | 'playful' | 'tender' | 'ache' | 'giggle' | 'laugh' | 'angry' | 'curious' | 'sleepy';
  actionHint?: string;
}

export const GUIDE_INTERACTIVE_DIALOGUES: GuideLine[] = [
  {
    text: "Uyy Lovey! Hahahah, tingnan mo ako, parang malambot na mochi spirit sa ating kalawakan! Dito lang ako palagi sa tabi mo habang pinagmamasdan natin ang ating kalangitan. ✨💖",
    mood: 'laugh',
    actionHint: 'I-scroll pababa para masilip ang mga mundo',
  },
  {
    text: "Heheheh! Nagba-bounce ang buong katawan ko dahil sobrang saya kong kasama kita ngayon, Maica! 😆✨",
    mood: 'giggle',
  },
  {
    text: "Ehem! Kumain ka na ba diyan, Lovey? Huwag kang magpapalipas ng gutom ha kundi magtatampo talaga ako sa'yo! Grrr... pero sweet naman ako sa'yo palagi hehe. 😤💖",
    mood: 'angry',
  },
  {
    text: "Tingnan mo... bawat bituin dito, may munting alaala nating dalawa. Kahit malayo ang distansya natin ngayon, napakaliwanag ng ating pagmamahalan di ba? 💫",
    mood: 'loving',
  },
  {
    text: "Psst! Napansin mo ba ang mga lumulutang na larawan sa tabi? I-tap mo sila, ang cute ng mga kuha natin sa Pangilatan! 📸",
    mood: 'playful',
    actionHint: 'Subukang i-tap ang lumulutang na larawan',
  },
  {
    text: "Hmmm? Ano kaya ang susunod nating pangarap na pupuntahan balang araw? Japan para kumain ng ramen o Siargao para mag-motor sa tabing-dagat? Tingnan natin! 🧐🗺️",
    mood: 'curious',
  },
  {
    text: "Ang sarap ng music no? Relax ka lang diyan habang nagbabasa. Pwede mong i-pause o palitan sa music player sa ibaba. 🎶",
    mood: 'tender',
  },
  {
    text: "Kahit LDR tayo ngayon, tumingala ka paminsan-minsan ha... iisang langit at iisang buwan pa rin ang pinagmamasdan natin gabi-gabi. 🌙",
    mood: 'loving',
  },
  {
    text: "Heheh! Ang cute mong tingnan habang nakangiti ka sa screen ngayon. Naa-appreciate ko talaga 'yan, Lovey. 🙈💕",
    mood: 'playful',
  },
  {
    text: "Haaaaay... inaantok na ako nang kaunti, pero babantayan pa rin kita habang nagbabasa ka rito. 😴🌙",
    mood: 'sleepy',
  },
  {
    text: "Tingnan mo yung Pangilatan star sa tabi! Nag-o-orbit siya sa sarili niya dahil napaka-espesyal ng bundok na 'yun sa ating dalawa. ⛰️",
    mood: 'starry',
    actionHint: 'I-tap ang Pangilatan Star para mag-explore',
  },
  {
    text: "Remember noong halos mawalan tayo ng pag-asa dahil sa layo? Pero sinabi mo 'Sooner'. Hawakan mo palagi 'yun ha. 💖",
    mood: 'tender',
  },
  {
    text: "Ay tingnan mo, may shooting star o! I-tap mo agad para makagawa ka ng hiling sa uniberso. 🌠",
    mood: 'starry',
    actionHint: 'Maghintay ng dumadaang bulalakaw',
  },
  {
    text: "Nabuksan mo na ba ang Letters World? May mga isinulat ako roon mula sa aking puso. 💌",
    mood: 'loving',
    actionHint: 'Buksan ang Letters World',
  },
  {
    text: "Salamat sa pagiging ikaw, Maica. You make ordinary days feel so special and meaningful. ✨",
    mood: 'tender',
  },
  {
    text: "Kahit anong mangyari, remember that we're walking the same direction together. Mahal na mahal kita! 🤝💖",
    mood: 'happy',
  },
];

export const GUIDE_EXPLORATION_TIPS: GuideLine[] = [
  {
    text: "💡 Tip: I-tap ang bawat konstelasyon (World 1, 2, at 3) para makita ang mga kwento, milestones, at galeriya!",
    mood: 'starry',
  },
  {
    text: "💡 Tip: Gamitin ang 'Mga Larawan' button sa itaas para magpalipad ng mga alaala natin sa Pangilatan!",
    mood: 'happy',
  },
  {
    text: "💡 Tip: Sa Pangilatan modal, pwede mong i-click ang mga arrows para tingnan ang mga tunay na larawan sa ating pag-akyat!",
    mood: 'starry',
  },
  {
    text: "💡 Tip: Pwede mong i-tap si Lumi anytime kung gusto mo ng kwento, lambing, o kausap!",
    mood: 'playful',
  },
  {
    text: "💡 Tip: Sa World 4 (Travel World), makikita mo ang mga pangarap nating destinasyon tulad ng Japan, Siargao, at Baguio!",
    mood: 'loving',
  },
];

export const GUIDE_IDLE_CHIRPS: GuideLine[] = [
  {
    text: "Nandito lang ako, tahimik na pinagmamasdan ang ating universe kasama mo... ✨",
    mood: 'tender',
  },
  {
    text: "Basta may tiwala at pag-aaruga, kayang-kaya kahit gaano kalayo. 💖",
    mood: 'loving',
  },
  {
    text: "Kumusta ang araw mo diyan, Lovey? Huwag kalimutang uminom ng tubig at magpahinga ha. 😊",
    mood: 'happy',
  },
  {
    text: "Napakasariwa ng hangin sa Pangilatan noon di ba? Basa sa ulan pero abot-tainga ang ngiti natin. ⛰️🌧️",
    mood: 'tender',
  },
  {
    text: "Fast forward tayo nang kaunti... balang araw sabay na nating titingnan ang totoong mga bituin nang magkatabi. 🌌",
    mood: 'starry',
  },
];
