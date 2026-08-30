import { WorldStar, AudioTrack, Letter, MemoryItem, RandomPhotoMemory, TimelineMilestone, TravelDream, OpenWhenLetter, LetterSubworld } from '../types';
import { PANGILATAN_FOLDER_URL, RANDOM_MEMORIES_FOLDER_URL, getDriveThumbnailUrl } from '../utils/driveHelper';

export const MEMORY_GALLERY_WALK_URL = 'https://memory-gallary-walk.vercel.app/';
export const SECRET_LETTER_DAW_URL = 'https://secret-letter-daw.vercel.app/';
export const OUR_FIRST_YEAR_URL = 'https://our-first-yearlovey.vercel.app/';

// Relationship start: September 22, 2025 at 9:00 PM (21:00 Philippine Standard Time / UTC+8)
export const RELATIONSHIP_START_DATE_ISO = '2025-09-22T21:00:00+08:00';
// 1st Year Anniversary milestone: September 22, 2026 at 9:00 PM (21:00 Philippine Standard Time / UTC+8)
export const FIRST_YEAR_ANNIVERSARY_DATE_ISO = '2026-09-22T21:00:00+08:00';

export { PANGILATAN_FOLDER_URL, RANDOM_MEMORIES_FOLDER_URL };

export const WORLDS: WorldStar[] = [
  {
    id: 'our-first-year',
    name: 'Our First Year',
    url: OUR_FIRST_YEAR_URL,
    active: true,
    order: 1,
    previewLine: 'Look, Lovey... our first year, hahahah.',
    starColor: '#f4d58d',
    unlockedDate: '2026-09-22T21:00:00+08:00',
    tagline: 'Dito Nagsimula ang Lahat',
    description: 'Ang patunay na ang pag-ibig ay lumalalim sa bawat araw — buksan ang Our First Year portal sa our-first-yearlovey.vercel.app kapag sumapit na ang 1st Anniversary sa Setyembre 22, 2026 (9:00 PM).',
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

export const ELEVEN_MONTHSARY_LETTER: Letter = {
  id: 'letter-11-monthsary',
  title: 'Ika-11 Buwan: Bawat Araw, Ikaw Pa Rin ang Pipiliin',
  date: 'Ika-11 Buwan ng Pagmamahalan',
  excerpt: '11 months na tayo Lovey... ilang hakbang na lang bago ang ating 1st year anniversary, pero lifetime ang pangarap ko sa\'yo.',
  content: [
    'Happy 11th Monthsary, aking pinakamamahal na Lovey!',
    'Grabe... 11 months na tayong magkasama. Isang buwan na lang, buong isang taon na ang ating kwento. Pero sa totoo lang, kapag iniisip ko ang bawat araw na lumipas, hindi ko nararamdaman ang bigat ng panahon — ang nararamdaman ko lang ay ang pasasalamat na ikaw ang kasama ko.',
    'Alam kong hindi madali ang ating sitwasyon. May mga araw na mahirap ang LDR, \'yung mga gabing gusto kitang yakapin pero boses at camera lang ang meron tayo. Pero sa kabila ng lahat ng kilometro sa pagitan natin, hinding-hindi ko naramdaman na nag-iisa ako.',
    'Dahil sa bawat "good morning Lovey", sa bawat random na lambing mo, sa mga tawa natin sa call kahit madaling araw na, at sa suportang ibinibigay mo sa akin araw-araw — pinatunayan mo na walang distansyang kayang magpahina sa dalawang pusong nagpasyang manindigan para sa isa\'t isa.',
    'Tandaan mo \'yung sinabi mo sa akin dati: "Sooner." Hinawakan ko \'yun noon, at lalo kong pinanghahawakan ngayon. Kaunti na lang, Lovey... darating din ang araw na wala nang screen, wala nang goodbyes, kundi ikaw na ang gigisnan ko sa bawat umaga.',
    'Salamat sa 11 months ng walang sawang pag-unawa, pagmamahal, at pagiging aking tahanan. Ikaw ang aking paboritong panalangin na tinugon ng Diyos.',
    'Happy 11th Monthsary, Maica ko. Mahal na mahal kita, higit pa sa lahat ng bituin sa ating kalawakan.',
  ],
  signature: 'Nandito palagi para sa\'yo, Clint (Lovey mo)',
  tag: '11 Monthsary Milestone',
  sealColor: '#ec4899',
  isSpecialMilestone: true,
  audioVoiceSnippet: 'Happy 11th monthsary Lovey ko... mahal na mahal kita.',
};

export const LETTERS: Letter[] = [
  ELEVEN_MONTHSARY_LETTER,
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
  {
    id: 'letter-4',
    title: 'Mga Lihim na Bulong sa Dilim (Sa Bawat Gabi ng LDR)',
    date: 'Gabi ng Pangungulila',
    excerpt: 'Kapag patay na ang mga ilaw at tumitig ako sa kisame, ikaw ang tanging liwanag...',
    content: [
      'Lovey,',
      'May mga gabi talaga na napakatahimik ng kwarto, at sa bawat katahimikan, ang lakas ng tibok ng puso ko para sa\'yo.',
      'Iniisip ko kung kumusta ka, kung nakapagpahinga ka na ba nang maayos, at kung gaano kasarap sa pakiramdam kapag dumating na ang panahon na hindi na screen ang hawak ko kundi ang kamay mo.',
      'Bawat sakripisyo ngayon, bawat puyat at pagod — may patutunguhan ang lahat ng ito. Ikaw ang aking pahinga.',
    ],
    signature: 'Yayakapin ka nang mahigpit sa isip, Clint',
    tag: 'Lihim na Bulong',
    sealColor: '#9333ea',
  },
  {
    id: 'letter-5',
    title: 'Pasasalamat sa Araw-Araw na Pagpili',
    date: 'Puso at Pasasalamat',
    excerpt: 'Hindi biro ang magmahal sa malayo, pero sa\'yo lang naging ganito kadali at kagaan...',
    content: [
      'Aking Maica,',
      'Gusto ko lang ipaalala sa\'yo kung gaano ako nagpapasalamat sa pagkakaroon mo sa buhay ko.',
      'Hindi mo kailangang maging perpekto para mahalin; sa bawat flaw mo, sa bawat kwela at kulit, lalo lang kitang minamahal.',
      'Salamat dahil ikaw ang aking sandalan, ang aking inspirasyon sa trabaho, at ang dahilan kung bakit may ngiti ako bago matulog.',
      'I will always choose you, in this universe and every timeline.',
    ],
    signature: 'Ang iyong Clint magpakailanman',
    tag: 'Tapat na Pag-ibig',
    sealColor: '#e11d48',
  },
];

export const OPEN_WHEN_LETTERS: OpenWhenLetter[] = [
  {
    id: 'open-when-miss-me',
    trigger: 'Kapag Miss na Miss Mo Ako',
    title: 'Buksan Kapag Nangungulila Ka sa Akin',
    tagline: 'Hawakan mo ang dibdib mo... andiyan lang ako sa bawat tibok.',
    emoji: '🥺',
    accentColor: '#f43f5e',
    content: [
      'Lovey ko, alam kong mahirap kapag miss na miss natin ang isa\'t isa.',
      'Kapag pakiramdam mo ay sobrang layo ko, ipikit mo ang mga mata mo. Isipin mo \'yung yakap ko, \'yung mga tawanan natin sa Pangilatan, at \'yung boses kong laging nagsasabing "Andito lang ako para sa\'yo."',
      'Hindi habangbuhay ang distansyang ito. Temporary lang ang layo, pero permanente ang pagmamahal ko sa\'yo.',
      'Tawagan mo ako agad kapag nabasa mo \'to ha? Sabihin mo "Lovey, miss kita" at papakinggan kita nang buong gabi.',
    ],
    encouragement: 'I-text o tawagan mo ako agad, Lovey. Sasagutin ko palagi para sa\'yo.',
    signature: 'Nangungulila rin sa\'yo, Clint',
    virtualGift: 'Virtual Mahigpit na Yakap at Halik sa Noo 🫂💖',
  },
  {
    id: 'open-when-tired',
    trigger: 'Kapag Pagod Ka sa Buong Araw',
    title: 'Buksan Kapag Mabigat ang Araw at Kailangan Mo ng Pahinga',
    tagline: 'Proud na proud ako sa lahat ng pinaghirapan mo ngayon.',
    emoji: '☕',
    accentColor: '#f59e0b',
    content: [
      'Pahinga ka muna, aking Lovey.',
      'I-baba mo muna lahat ng iniisip mo. You did so well today. Kahit gaano kabigat o nakakapagod ang mga nangyari, tapos na ang araw at ligtas ka na ngayon.',
      'Proud na proud ako sa\'yo palagi sa bawat effort at sipag mo. Huwag mong kakalimutang alagaan ang sarili mo.',
      'Kung andiyan lang ako, ipagluluto kita ng paborito mo at hihilutin ko ang mga balikat mo habang nagkukuwento ka.',
    ],
    encouragement: 'Uminom ka ng mainit na tubig o gatas, humiga nang maayos, at huminga nang malalim.',
    signature: 'Ang iyong taga-suporta at pahinga, Clint',
    virtualGift: 'Mainit na Kape at Lambing Delivery ☕✨',
  },
  {
    id: 'open-when-cant-sleep',
    trigger: 'Kapag Hindi Ka Makatulog sa Gabi',
    title: 'Buksan Kapag Gising Pa ang Isip sa Hatinggabi',
    tagline: 'Hayaan mong bantayan ka ng mga bituin sa ating uniberso.',
    emoji: '🌙',
    accentColor: '#6366f1',
    content: [
      'Gabi na Lovey... bakit gising ka pa? Heheh.',
      'Alam kong minsan ang daming tumatakbo sa isip kapag patay na ang ilaw. Pero tandaan mo, anuman ang bumabagabag sa\'yo, bukas na natin harapin \'yun nang magkasama.',
      'I-play mo ang paborito nating kanta dito sa music player, pakinggan mo ang mahinahon nitong tunog, at isipin mo na magkatabi tayong nakahiga sa ilalim ng kalawakan.',
      'Sweet dreams aking magandang prinsesa. Gigising ka bukas na panibagong araw ng pag-asa.',
    ],
    encouragement: 'Hayaan mong ang musika at pagmamahal ko ang magpatulog sa\'yo ngayong gabi.',
    signature: 'Bumabantay sa iyong panaginip, Clint',
    virtualGift: 'Kumot ng Pagmamahal at Malambot na Unan 🛏️⭐',
  },
  {
    id: 'open-when-need-laugh',
    trigger: 'Kapag Kailangan Mo ng Lambing o Tawanan',
    title: 'Buksan Kapag Gusto Mong Ngumiti at Tumawa',
    tagline: 'Pampatawa at pampakilig mula sa iyong paboritong makulit na boyfriend.',
    emoji: '😆',
    accentColor: '#ec4899',
    content: [
      'Uyy Lovey! Hahahah! Alam mo bang ikaw ang pinakamagandang bagay na nangyari sa buong uniberso ko?',
      'Remember noong kumanta ako sa Pangilatan kahit sintunado pero tawa ka pa rin nang tawa? O \'yung mga goofy faces natin sa videocall tuwing madaling araw?',
      'Ang ganda-ganda mo kapag nakangiti ka. Ngumiti ka nga ngayon habang binabasa mo \'to... ayan! Kitang-kita ko kahit malayo, ang cute cute mo talaga! 🥰',
      'Mahal na mahal kita, aking paboritong kalaro at tahanan.',
    ],
    encouragement: 'Magpadala ka ng selfie na nakangiti ngayon sa akin!',
    signature: 'Ang iyong makulit na Lovey, Clint',
    virtualGift: 'Isang Milyong Yakap at Kakulitan 😂💖',
  },
];

export const LETTER_SUBWORLDS: LetterSubworld[] = [
  {
    id: 'secret-letter-daw',
    name: 'Secret Letter Daw (11 Monthsary Special)',
    subtitle: 'Lihim na Liham para sa Ika-11 Buwan • Clint & Maica',
    description: 'Ang ating espesyal na 11th monthsary secret web experience sa secret-letter-daw.vercel.app — may misteryosong liham, mga tagong mensahe, at pagdiriwang ng ika-11 buwan nating dalawa.',
    category: 'secret-link',
    starColor: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
    iconName: 'Sparkles',
    badgeText: '11 Months Special',
    externalUrl: SECRET_LETTER_DAW_URL,
    previewLine: 'Uyy Lovey... ito ang ating 11 monthsary secret letter sa kabilang ibayo! Buksan mo, hehe.',
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
