import { WorldStar, AudioTrack, Letter, MemoryItem, RandomPhotoMemory, TimelineMilestone, TravelDream } from '../types';
import { PANGILATAN_FOLDER_URL, RANDOM_MEMORIES_FOLDER_URL, getDriveThumbnailUrl } from '../utils/driveHelper';

export { PANGILATAN_FOLDER_URL, RANDOM_MEMORIES_FOLDER_URL };

export const WORLDS: WorldStar[] = [
  {
    id: 'our-first-year',
    name: 'Our First Year',
    url: '#first-year',
    active: true,
    order: 1,
    previewLine: 'Maica! Ito, first year niyo, hehe.',
    starColor: '#f4d58d',
    unlockedDate: '2025-11-12',
    tagline: 'Ang Simula ng Lahat',
    description: 'Bawat araw, bawat tawag sa gabi, bawat tawanan at munting tampuhan na nauwi sa mas malalim na pagmamahal.',
    iconName: 'Sparkles',
  },
  {
    id: 'memory-gallery',
    name: 'Memory Gallery',
    url: '#gallery',
    active: true,
    order: 2,
    previewLine: 'Grabe, dito puno ng — hmm, ikaw na magdiskubre, hahahah.',
    acheLine: '...alam mo, may mga panahon na halos di na tayo nag-usap dati... pero andito pa rin tayo. Sooner, sabi mo noon. Tapos dumating na.',
    starColor: '#c9a7eb',
    unlockedDate: '2026-01-10',
    tagline: 'Mga Tagpong Hindi Kumukupas',
    description: 'Mga litrato at alaalang nakatatak sa puso — mula sa bundok ng Pangilatan hanggang sa bawat tanawin sa ilalim ng parehong langit.',
    iconName: 'Image',
  },
  {
    id: 'letters',
    name: 'Letters',
    url: '#letters',
    active: true,
    order: 3,
    previewLine: 'May mga sinulat siya dito para sa\'yo... basahin mo, hehe.',
    acheLine: 'Grabe, dito ko nilagay yung mga bagay na mahirap sabihin ng harapan... basahin mo lang, sige, tapos alam mo na — mahal na mahal kita, kahit anong layo.',
    starColor: '#f7b2ad',
    unlockedDate: '2026-03-01',
    tagline: 'Mga Liham sa Pagitan ng Distansya',
    description: 'Mga sulat-kamay at taimtim na salita para sa mga gabing magkalayo at mga umagang ikaw ang unang naiisip.',
    iconName: 'Mail',
  },
  {
    id: 'travel-world',
    name: 'Travel World',
    url: '#travel',
    active: false,
    order: 4,
    previewLine: 'Lakad-lakad tayo dito...',
    starColor: '#9ecae1',
    unlockedDate: null,
    tagline: 'Mga Susunod Nating Pupuntahan',
    description: 'Mga pangarap na lugar na sabay nating tatapakan pagkatapos ng distansya. Malapit na, sooner.',
    iconName: 'Compass',
  },
];

export const PANGILATAN_LINES = [
  "Uyy, ito na siya... Pangilatan. Hindi siya parang ibang bituin, 'no? Gumagala lang — parang tayo dati. Umiikot, tapos... nagkita rin ulit.",
  "Naaalala mo pa dito? Basang-basa tayo noon. Pero heheh — andito pa rin tayo ngayon.",
  "Dito rin tayo kumanta, 'no? Di maganda boses ko pero — hahaha — pinakinggan mo pa rin.",
  "Ito si Pangilatan... hindi ko na kailangang ipaliwanag, 'no? Alam mo na.",
  "Uyy, nadiskubre mo siya. Gumagala lang 'yan — ayaw sumunod sa linya. Minsan tayo rin naman, 'di ba? 'Di sumusunod sa plano, pero nagkita pa rin.",
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
    title: 'Tayo sa Tuktok ng Pangilatan',
    location: 'Pangilatan Mountain Viewdeck',
    date: 'Hulyo 2026 • Araw ng Pagtatagpo',
    description: 'Nung umakyat tayo, kahit maulap at mahangin, hawak-kamay nating tinanaw ang buong kabundukan. Ang sarap sa pakiramdam na katabi kita.',
    quote: '"Kahit gaano kalayo ang tinahak, basta kasama ka, laging worth it."',
    imageType: 'selfie',
    imageSrc: 'https://drive.google.com/file/d/10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_/view?usp=drive_link',
  },
  {
    id: 'mem-2',
    title: 'Tinging Malaya sa Kabundukan',
    location: 'Pangilatan Hills Grassland',
    date: 'Matahimik na Hapon',
    description: 'Nakatitig ka lang sa malayo habang sumasayaw ang hangin sa buhok mo. Dun ko napagtanto kung gaano kita gustong alagaan at mahalin habangbuhay.',
    quote: '"Sa katahimikan ng bundok, ikaw lang ang naririnig ng puso ko."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB/view?usp=drive_link',
  },
  {
    id: 'mem-3',
    title: 'Unang Silip ng Liwayway',
    location: 'Pangilatan Peak Ridge',
    date: 'Hulyo 4, 2026 • Dapit-Umaga',
    description: 'Ang unang liwanag ng araw na sumisilip sa likod ng mga ulap habang magkasama nating sinasalubong ang bagong umaga.',
    quote: '"Sa bawat pagsikat ng araw, ikaw ang unang pasasalamatan."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz/view?usp=drive_link',
  },
  {
    id: 'mem-4',
    title: 'Dapit-Umaga sa Kabundukan',
    location: 'Pangilatan Horizon',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    description: 'Malamig ang hangin pero mainit ang puso dahil magkahawak ang ating mga kamay.',
    quote: '"Walang hamog o lamig na hindi kayang pawiin ng iyong yakap."',
    imageType: 'scenic',
    imageSrc: 'https://drive.google.com/file/d/16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ/view?usp=drive_link',
  },
];

/**
 * RANDOM FLOATING MEMORY PHOTOS POOL
 * Direct Google Drive links for floating celestial memory shards in the sky
 */
export const RANDOM_MEMORY_PHOTOS: RandomPhotoMemory[] = [
  {
    id: 'photo-pangilatan-1',
    src: 'https://drive.google.com/file/d/10Vv9RMxrD42ZHfnfC5xvw7o-34IXNcb_/view?usp=drive_link',
    title: 'Tuktok ng Pangilatan',
    caption: 'Kahit gaano kataas ang akyatin, basta ikaw ang kasama ko, parang nasa ulap lang tayo.',
    location: 'Pangilatan Mountain',
    date: 'Araw ng Pagtatagpo',
    glowColor: '#9dbf9a',
  },
  {
    id: 'photo-pangilatan-2',
    src: 'https://drive.google.com/file/d/1smj64ajtPckAIyyWY5oqHY8RkzgKl7pB/view?usp=drive_link',
    title: 'Ang Paborito Kong Ngiti',
    caption: 'Sa bawat tingin mo, ramdam ko ang tahanan na matagal ko nang hinahanap.',
    location: 'Pangilatan Trails',
    date: 'Matahimik na Hapon',
    glowColor: '#fb7185',
  },
  {
    id: 'photo-pangilatan-3',
    src: 'https://drive.google.com/file/d/1e9tm3i8Ay1Mtog8BQ9F4gucB08rFCGzz/view?usp=drive_link',
    title: 'Unang Silip ng Liwayway',
    caption: 'Kasama kang sumalubong sa unang sinag ng araw sa tuktok ng kabundukan.',
    location: 'Pangilatan Ridge',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    glowColor: '#f4d58d',
  },
  {
    id: 'photo-pangilatan-4',
    src: 'https://drive.google.com/file/d/16Y45AClQV-QPJFJopdeHItKZjuIiWhyQ/view?usp=drive_link',
    title: 'Dapit-Umaga sa Ulap',
    caption: 'Malamig man ang simoy ng hangin, ang init ng kamay mo ang aking sandigan.',
    location: 'Pangilatan Overlook',
    date: 'Hulyo 4, 2026 • 5:47 AM',
    glowColor: '#38bdf8',
  },
];

export const LETTERS: Letter[] = [
  {
    id: 'letter-1',
    title: 'Para sa Aking Lovey, Kahit Anong Layo',
    date: 'Mahalagang Araw',
    excerpt: 'Hindi madali ang LDR, pero tuwing naaalala kita, nawawala lahat ng pagod...',
    content: [
      'Dearest Maica, aking Lovey,',
      'Alam mo bang sa bawat gabing tahimik ang paligid at nakatitig ako sa kisame, ikaw agad ang pumapasok sa isip ko? Ang hirap minsan ng magkalayo — yung mga araw na gusto kitang yakapin pag pagod ka, o hawakan ang kamay mo habang naglalakad tayo nang walang patutunguhan.',
      'Pero alam mo kung anong mas malakas kaysa sa distansya? Yung katiyakan na ikaw ang taong gusto kong makasama sa bawat yugto ng buhay ko.',
      'Salamat sa pagtitiyaga, sa pagiging sandigan ko kahit sa screen lang tayo nagkikita, at sa pagmamahal mong kailanman ay hindi nagbago.',
      'Hinding-hindi ako mapapagod maghintay at magsikap para sa araw na hindi na natin kailangang magpaalam sa airport o magbilang ng mga buwan bago magkita.',
    ],
    signature: 'Nagmamahal nang walang hanggan, Clint',
    tag: 'Taimtim na Liham',
    sealColor: '#e07a5f',
  },
  {
    id: 'letter-2',
    title: 'Nung Halos Mawalan Tayo ng Kausap ("Sooner")',
    date: 'Panahon ng Pagtibay',
    excerpt: 'Naaalala mo yung mga panahong parang ang bigat ng lahat? Pero look at us now...',
    content: [
      'Lovey,',
      'Hindi perpekto ang kwento natin. May mga panahon noon na halos mawalan tayo ng lakas, na parang ang hirap abutin ng isa\'t isa dahil sa layo at sa dami ng iniisip.',
      'Pero may isang salita kang laging sinasabi na naging angkla ko: "Sooner."',
      'Simple lang pero puno ng pag-asa. Sabi mo, darating din ang araw na magiging madali ang lahat. At totoo nga — bawat unos na dumaan, imbes na maglayo sa atin, mas lalong nagpatibay sa kung sino tayo ngayon.',
      'Salamat at hindi ka bumitaw. Salamat dahil pinili mo akong mahalin araw-araw.',
    ],
    signature: 'Palaging para sa\'yo, Clint',
    tag: 'Alaala at Pagtibay',
    sealColor: '#81b29a',
  },
  {
    id: 'letter-3',
    title: 'Pangako sa Ating Kinabukasan',
    date: 'Pangarap Nating Dalawa',
    excerpt: 'Hindi lang ito alaala ng nakaraan — ito ang pundasyon ng ating bukas...',
    content: [
      'Maica ko,',
      'Ginawa ko itong Ating Universe hindi lang para balikan ang mga nakaraang buwan, kundi para ipaalala sa\'yo na may buong kalawakan pa tayong bubuuin nang magkasama.',
      'Darating ang araw na gigising tayo sa umaga na walang timer ang tawag, walang flight ticket na kailangang habulin, kundi kape at ikaw lang sa tabi ko.',
      'Marami pang mundo ang malilikha, Lovey. At sa bawat mundong iyon, ikaw at ikaw lang ang pipiliin ko.',
      'Mahal na mahal kita, higit pa sa kayang bilangin ng mga bituin sa langit.',
    ],
    signature: 'Ang iyong kakampi habangbuhay, Clint',
    tag: 'Pangako sa Hinaharap',
    sealColor: '#3d405b',
  },
];

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    month: 'Unang Yugto',
    title: 'Ang Unang "Uyy" at Tawanan',
    story: 'Kung paano nagsimula sa simpleng chat hanggang sa naging 4am calls na ayaw nang magbabaan ng phone.',
    highlight: 'Hindi namamalayan ang oras basta ikaw ang kausap.',
    emoji: '🌙',
  },
  {
    month: 'Araw ng Pagtatapat',
    title: 'Nung Naging "Tayo"',
    story: 'Ang pinakamasayang desisyon sa buhay ko — ang piliin kang maging tahanan ng puso ko.',
    highlight: 'Official na aking Lovey.',
    emoji: '✨',
  },
  {
    month: 'Araw sa Pangilatan',
    title: 'Kanta at Ulan sa Bundok',
    story: 'Umakyat tayo sa Pangilatan, nagpatugtog ng gitara at kumanta kahit maulan. Walang paki sa dumi o lamig.',
    highlight: 'Basta ikaw ang kasama, paraiso ang kahit saang lugar.',
    emoji: '⛰️',
  },
  {
    month: 'Mga Gabi ng LDR',
    title: 'Pagtulog nang Magkasama sa Call',
    story: 'Kahit screen lang ang pagitan, marinig lang ang hininga at boses mo, payapa na ang buong gabi.',
    highlight: 'LDR can\'t stop genuine soul connection.',
    emoji: '💫',
  },
  {
    month: 'Anniversary Milestone',
    title: 'Isang Taon ng Pagmamahal',
    story: '365 na araw ng pagpili sa isa\'t isa. Patunay na ang tunay na pag-ibig ay hindi nasusukat sa distansya.',
    highlight: 'First year down, lifetime to go.',
    emoji: '💖',
  },
];

export const TRAVEL_DREAMS: TravelDream[] = [
  {
    destination: 'Japan Cherry Blossom Season',
    tagline: 'Lakad sa ilalim ng Sakura at gabi sa Kyoto',
    activities: ['Mag-rent ng kimono', 'Kumain ng authentic matcha at ramen', 'Mag-night stroll sa Dotonbori'],
    status: 'sooner',
    note: 'Gusto kitang kuhanan ng litrato habang nahuhulog ang sakura petals sa buhok mo.',
  },
  {
    destination: 'Siargao Island Getaway',
    tagline: 'Motorbike rides sa ilalim ng coconut trees at sunset surf',
    activities: ['Mag-motor sa palm tree road', 'Sugba Lagoon floating', 'Tumingin ng stars sa tabing-dagat'],
    status: 'planned',
    note: 'Yung ikaw ang nakayakap sa likod ko habang nagmomotor tayo sa gilid ng dagat.',
  },
  {
    destination: 'Baguio & Sagada Foggy Mornings',
    tagline: 'Mainit na kape, makapal na jacket, at yakap sa lamig',
    activities: ['Uminom ng strawberry taho', 'Magkape sa overlooking cloud cafe', 'Stargazing sa cold mountain air'],
    status: 'dreaming',
    note: 'Walang mas sasarap sa yakap mo habang malamig ang simoy ng hangin sa bundok.',
  },
];

export const WISH_QUOTES = [
  "Wish granted: Mas lalo kitang mamahalin araw-araw.",
  "Pangako, magkikita rin tayo sooner, Lovey.",
  "Salamat sa pananatili sa tabi ko sa bawat unos at ulan.",
  "Kahit gaano kalayo, iisang kalawakan ang tahanan nating dalawa.",
  "Ikaw ang pinakamagandang hiling na natupad sa buhay ko.",
  "Sa bawat pagtingala mo sa mga bituin, alalahanin mong may nagmamahal sa'yo nang wagas dito.",
];

export interface GuideLine {
  text: string;
  mood: 'happy' | 'loving' | 'starry' | 'playful' | 'tender' | 'ache';
  actionHint?: string;
}

export const GUIDE_INTERACTIVE_DIALOGUES: GuideLine[] = [
  {
    text: "Uyy Maica! Ako si Tala, ang iyong cosmic star companion. Dito lang ako palagi sa tabi mo habang naglalakbay tayo sa ating kalawakan! ✨",
    mood: 'happy',
    actionHint: 'Mag-scroll pababa para makita ang mga mundo',
  },
  {
    text: "Alam mo ba, bawat bituin dito ay sinindihan ng mga alaalang binuo niyo ni Clint... kahit gaano kalayo, kumikinang pa rin. 💫",
    mood: 'loving',
  },
  {
    text: "Psst! Napansin mo ba yung mga lumulutang na Polaroid sa gilid? I-tap mo sila para masilip ang mga tunay ninyong litrato! 📸",
    mood: 'playful',
    actionHint: 'Subukang i-tap ang lumulutang na litrato',
  },
  {
    text: "Ang ganda ng tugtog, 'no? Damang-dama ang bawat nota. Pwede mong palitan o i-pause sa music player sa ibaba. 🎶",
    mood: 'tender',
  },
  {
    text: "Kahit LDR kayo ngayon, tandaan mo: iisang buwan at iisang langit ang tinitingnan ninyo gabi-gabi. 🌙",
    mood: 'loving',
  },
  {
    text: "Heheh! Ang cute mo raw sabi ni Clint habang nakangiti ka sa screen mo ngayon. 🙈💕",
    mood: 'playful',
  },
  {
    text: "Tingnan mo yung 'Pangilatan' na bituin sa may gilid! May sarili siyang orbit dahil espesyal ang bundok na iyon sa inyong dalawa. ⛰️",
    mood: 'starry',
    actionHint: 'I-tap ang Pangilatan Star para mag-explore',
  },
  {
    text: "Minsan may mga gabing mahirap ang layo... pero tulad ng sabi mo noon: 'Sooner'. Palapit na nang palapit ang araw na magkasama na kayo. 💖",
    mood: 'tender',
  },
  {
    text: "Kapag may nakita kang shooting star o bulalakaw, i-tap mo agad para makapag-iwan ng hiling sa uniberso! 🌠",
    mood: 'starry',
    actionHint: 'Mag-abang ng dumaraang bulalakaw',
  },
  {
    text: "Nabisita mo na ba ang World 3: Letters? May tatlong mahahabang liham doon na galing sa kaibuturan ng puso ni Clint. 💌",
    mood: 'loving',
    actionHint: 'Buksan ang Letters World',
  },
  {
    text: "Salamat sa pagiging liwanag ni Clint sa bawat araw. Ikaw ang kanyang paboritong tala sa buong uniberso. ✨",
    mood: 'tender',
  },
  {
    text: "Kahit mag-brownout o mawalan ng signal, walang makakabura sa koneksyon ng mga puso ninyo. 💫",
    mood: 'happy',
  },
];

export const GUIDE_EXPLORATION_TIPS: GuideLine[] = [
  {
    text: "💡 Tip: I-tap ang bawat konstelasyon (World 1, 2, at 3) para mabuksan ang mga kwento, milestones, at gallery!",
    mood: 'starry',
  },
  {
    text: "💡 Tip: Gamitin ang 'Alaala sa Bituin' button sa ibaba para magpalipad ng mga random na litrato niyo sa Pangilatan!",
    mood: 'happy',
  },
  {
    text: "💡 Tip: Sa Pangilatan modal, pwede mong i-click ang mga arrows para tingnan lahat ng 8 totoong litrato mula sa inyong pag-akyat!",
    mood: 'starry',
  },
  {
    text: "💡 Tip: Pwede mong i-tap ako anumang oras kapag gusto mo ng munting kwento, payo, o lambing mula kay Clint!",
    mood: 'playful',
  },
  {
    text: "💡 Tip: Sa World 4 (Travel World), makikita mo ang mga pangarap na destinasyon tulad ng Japan, Siargao, at Baguio!",
    mood: 'loving',
  },
];

export const GUIDE_IDLE_CHIRPS: GuideLine[] = [
  {
    text: "Nandito lang ako, tahimik na nagmamasid sa inyong magandang kalawakan... ✨",
    mood: 'tender',
  },
  {
    text: "Basta't may pagmamahal, walang distansyang masyadong malayo. 💖",
    mood: 'loving',
  },
  {
    text: "Kumusta ka diyan, Maica? Huwag kalimutang magpahinga at uminom ng tubig ha. 😊",
    mood: 'happy',
  },
  {
    text: "Ang sarap balikan ng mga alaala sa Pangilatan... basang-basa pero puro ngiti. ⛰️🌧️",
    mood: 'tender',
  },
  {
    text: "Isang araw, hindi na 'to virtual universe lang — sabay niyo nang titingnan ang totoong mga bituin. 🌌",
    mood: 'starry',
  },
];

