export interface DailyQuoteLetter {
  id: string;
  quote: string;
  author: string;
  theme: string;
  body: string[];
  closing: string;
  tag: string;
  moodEmoji: string;
}

export const DAILY_LETTERS: DailyQuoteLetter[] = [
  {
    id: 'daily-1',
    quote: '"Look at the sky... murag bisan unsa kalayo, iisang kalangitan ra gihapon atong ginatan-aw."',
    author: 'Clint para kay Maica',
    theme: 'Distansya ug Kalangitan',
    body: [
      'Maica... Lovey, hahahah.',
      'Actually, nagtan-aw ko sa langit ganina. Kahibalo ka unsa akong nahinumdoman? Katong magka-call ta sa gabii unya pareho tang nagtan-aw sa gawas sa bintana.',
      'Grabe no... layo kayo ta physically, pero the moment I look at the stars, murag duol ra kaayo ka. Naa ra ka sa pikas side sa screen, nagkatawa.',
      'Salamat kaayo sa pag-uban nako ani nga journey. Na appreciate jud nako tanan.',
    ],
    closing: 'Always here for you, Lovey,',
    tag: 'Daily Whisper',
    moodEmoji: '💌',
  },
  {
    id: 'daily-2',
    quote: '"Hahaha remember tong Pangilatan? Basa kaayo ta pero walay reklamo. Pure peace ra gyud."',
    author: 'Alaala sa Pangilatan',
    theme: 'Alaala sa Kabundukan',
    body: [
      'Remember tong Pangilatan, Lovey?',
      'Kanang basa kaayo ta sa ulan, tugnaw kaayo ang hangin, unya nagdala ra kog guitar nga walay klarong chords hahahah. Pero wala jud ta nagdali. Nagtan-aw ra ta sa clouds.',
      'Dira nako na-realize nga ang peace diay... dili diay siya lugar. It\'s being with the right person.',
      'Thank you for being my peace, Maica. Beautiful kaayo to nga memory.',
    ],
    closing: 'Amping pirmi diha ha, Clint',
    tag: 'Pangilatan Memories',
    moodEmoji: '⛰️',
  },
  {
    id: 'daily-3',
    quote: '"Bitaw no, the best part of the day is when I finally hear your voice bago matulog."',
    author: 'Late Night Talks',
    theme: 'Hatinggabi ug Tingog',
    body: [
      'Hahahah, cute kaayo ka paminawon kung ting-tulog na.',
      'Kanang hinay-hinay na mawala imong tingog sa call, pero dili jud ka musugot nga i-end ang call first. Ako ray magtan-aw sa timer nga moabot ug 5 hours, 6 hours.',
      'Bisag kapoy ang work ug tibuok adlaw, pag kadungog nako sa imong "ingat ka palagi lovey", mawala tanan kabug-at.',
      'I\'m really thankful nga ikaw akong ka-share sa akong everyday life.',
    ],
    closing: 'Goodnight daan or maayong adlaw sa\'yo, Lovey,',
    tag: 'Late Night Serenade',
    moodEmoji: '🌙',
  },
  {
    id: 'daily-4',
    quote: '"Remember tong baha? We never blamed each other. Nilabang ra ta hinay-hinay."',
    author: 'Pagsalig sa Dalan',
    theme: 'Paglahutay ug Pagsalig',
    body: [
      'Actually, I was thinking about this recently...',
      'Remember katong na-trap ta sa baha? Most people would panic or mag-away. Pero kita... we stayed calm. Nagtan-aw ta ug ways unsaon pagtabok, step by step, katawa-katawa pa gamay.',
      'Murag mao jud na atong relationship. Whatever challenges come our way, as long as we walk the same direction and don\'t let go of each other\'s hands, kaya ra kaayo.',
      'I\'m really proud of how we handle things together, Lovey.',
    ],
    closing: 'Kuyog ta pirmi sa tanan, Clint',
    tag: 'Our Strength',
    moodEmoji: '🤝',
  },
  {
    id: 'daily-5',
    quote: '"Unsay tawag ato nga moment? Kanang kalit lang ko mapangisi kay nahinumdom ko nimo."',
    author: 'Gagmay nga Moments',
    theme: 'Gagmay nga mga Butang',
    body: [
      'Hahahah, random thought lang ni.',
      'Naka notice ka nga whenever I see something cute or funny sa dalan, ikaw dayon akong unang gusto i-chat?',
      'Kanang "Look Lovey, cute kaayo ni" or "Murag kaila ko ani nga batasan hahahah".',
      'It\'s the small things jud. Thank you for making ordinary days feel so special.',
    ],
    closing: 'Smile today ha,',
    tag: 'Everyday Wonder',
    moodEmoji: '✨',
  },
  {
    id: 'daily-6',
    quote: '"Sooner, diba? Katong time nga halos di na ta magka-storya... pero andito pa rin tayo."',
    author: 'Angkla sa Paglaum',
    theme: 'Sooner nga Saad',
    body: [
      'Lovey... bitaw no.',
      'Looking back, naa jud toy time sa una nga murag ang bug-at sa tanan. Magkalayo ta, busy, and sometimes we felt tired.',
      'Pero you always said that one word: "Sooner." Simple ra kaayo siya nga word, pero I swear, mao to akong gikuptan pirmi.',
      'Look at us now. First year anniversary na nato. Fast forward ta gamay, mag-uban na jud ta puhon nga walay airport goodbyes.',
    ],
    closing: 'Nagpasalamat jud ko sa Ginoo nga ikaw akong kauban,',
    tag: 'Sooner Promise',
    moodEmoji: '⚓',
  },
  {
    id: 'daily-7',
    quote: '"Dili ra to sakay ug motor... it was us trusting each other on the road."',
    author: 'Motorcycle Diaries',
    theme: 'Biyahe sa Dalan',
    body: [
      'Nakahinumdom ko sa atong mga motor rides, Maica.',
      'Kanang bugnaw kaayo ang hangin sa dalan unya gakos ka sa akong likod. Walay klarong destinasyon usahay, pero as long as nag-dagan ta ug magka-istorya sa helmet, lipay na kaayo ta.',
      'Murag mao jud na akong gusto sa kinabuhi: simple rides with you, enjoying the scenery, and knowing we\'re heading in the same direction.',
      'Na appreciate jud nako imong presence sa akong kinabuhi.',
    ],
    closing: 'Ride safe and stay warm, Lovey, Clint',
    tag: 'Road & Journey',
    moodEmoji: '🏍️',
  },
  {
    id: 'daily-8',
    quote: '"You don\'t have to do anything grand. Just you being you is already more than enough."',
    author: 'Kinasingkasing nga Pasalamat',
    theme: 'Tinuod nga Pagpangga',
    body: [
      'Actually, gusto lang tika pasalamatan karon.',
      'Dili tungod kay naay occasion or unsa, but simply because you exist in my life. Salamat sa imong pagsabot, sa imong lambing, ug sa imong kasingkasing nga kanunay nag-amuma.',
      'I think God really guided our paths to cross. Murag gi-remind ta nga worth it ang paghulat sa saktong tawo.',
      'I\'m really lucky to have you, Maica.',
    ],
    closing: 'With quiet love and gratitude, Clint',
    tag: 'Heartfelt Truth',
    moodEmoji: '🌿',
  },
  {
    id: 'daily-9',
    quote: '"Kanang sunset gani... nagtan-aw lang ta. Walay daghang storya pero puno ang kasingkasing."',
    author: 'Katahom sa Kilumkilom',
    theme: 'Sunset & Wonder',
    body: [
      'Hahahah, remember tong sunset nga hilom ra kaayo ta nagtan-aw?',
      'Dili man ko tig-drama nga pagkatawo, pero when I sat beside you that afternoon, na-amaze jud ko. Ka-nice sa colors sa sky, and mas ni-nice pa kay naa ka sa akong tupad.',
      'Everything feels richer and more meaningful when I share it with you.',
      'Mao gyud. Looking forward to watching thousands more sunsets with you.',
    ],
    closing: 'Kanunay naga-tan-aw sa atong kalangitan,',
    tag: 'Sunset Wonder',
    moodEmoji: '🌅',
  },
  {
    id: 'daily-10',
    quote: '"Okay ra ba ka diha? Kung kapoy gani, pahulay lang. Diri ra ko, kanunay naga-alalay."',
    author: 'Dangpanan sa Kalinaw',
    theme: 'Kalinaw ug Dangpanan',
    body: [
      'Hey Lovey, checking in on you.',
      'If today feels a bit heavy or drained ka sa mga buhaton, remember to take a deep breath. Dili nimo kailangan dad-on tanan mag-isa.',
      'Tell me what happened kung gusto ka mag-share, or we can just stay on call in silence. Bisan unsa, okay ra kaayo.',
      'You are doing great, and I am so proud of you pirmi.',
    ],
    closing: 'Your safe space, always, Clint',
    tag: 'Safe Harbor',
    moodEmoji: '🛡️',
  },
  {
    id: 'daily-11',
    quote: '"Ka funny ba ato hahahah... pero bitaw, I love how we can laugh at the silliest things."',
    author: 'Tawanan ug Lambing',
    theme: 'Tawanan ug Kagaan',
    body: [
      'Hahahaha! Naalala nako katong joke nako nga walay klaro unya mikatawa gihapon ka bisan corny.',
      'Ay hala, murag ikaw ra jud ang tawo nga maka-gets sa akong sense of humor nga usahay awkward.',
      'Thank you for the endless laughs, Lovey. Life is so much lighter when we\'re joking around and being our true silly selves.',
      'Ayaw kalimot mo-smile karon ha, kay cute kaayo ka kung mag-smile.',
    ],
    closing: 'Imong paboritong corny nga uyab, Clint',
    tag: 'Pure Joy',
    moodEmoji: '💖',
  },
  {
    id: 'daily-12',
    quote: '"First year down... pero murag pagsugod pa lang jud ni sa atong tinuod nga adventure."',
    author: 'Unang Tuig Milestone',
    theme: 'Unang Tuig ug Umaabot',
    body: [
      'One whole year, Maica. Grabe no...',
      'Kung huna-hunaon nimo tanan — mga trips, mga late-night conversations, mga ulan nga atong nasinati, ug ang mga adlaw nga LDR ta — everything brought us closer.',
      'Dili perpekto atong storya, pero it\'s ours. And I wouldn\'t trade any piece of it for anything else.',
      'Thank you for choosing me every single day. I will keep choosing you too.',
    ],
    closing: 'Happy 1st Year Anniversary, Lovey!',
    tag: 'Milestone & Beyond',
    moodEmoji: '📖',
  },
  {
    id: 'daily-13',
    quote: '"Fast forward ta gamay... pohon maglakaw-lakaw na ta sa Japan ug magkape sa kabuntagon."',
    author: 'Mga Pangandoy nga Biyahe',
    theme: 'Pangandoy nga Dalan',
    body: [
      'Lovey, imagine this:',
      'Makamotor ta sa Siargao under the palm trees, unya sunod mag-jacket ta sa Baguio nag-inom ug init nga kape samtang nagtan-aw sa fog.',
      'Tapos pohon sa Japan, nagtan-aw sa sakura petals samtang nag-lakaw ta nga magka-holding hands.',
      'Dili lang ni drawing. Step by step, atong buhaton ni tanan together.',
    ],
    closing: 'Dreaming and building our future with you, Clint',
    tag: 'Travel Horizons',
    moodEmoji: '✈️',
  },
  {
    id: 'daily-14',
    quote: '"I think God allowed this distance para mas masabtan nato kung unsa ka bililhon ang atong koneksyon."',
    author: 'Pagsalig sa Panahon',
    theme: 'Pagsalig ug Paglaum',
    body: [
      'You know, Lovey... nag-reflect ko sa atong story.',
      'Murag gi-remind jud ta pirmi nga everything happens in God\'s perfect timing. Ang distansya dili silot — it\'s an opportunity for us to build trust, patience, and true understanding.',
      'Every prayer I make, apil jud ka pirmi. I always thank God for bringing you into my world.',
      'Ampingi imong kaugalingon pirmi diha ha.',
    ],
    closing: 'Praying for you always, Clint',
    tag: 'Faith & Trust',
    moodEmoji: '🙏',
  },
  {
    id: 'daily-15',
    quote: '"Walay drama, walay daghang pasikot-sikot. I\'m really glad we\'re doing this life together."',
    author: 'Taimtim nga Saad',
    theme: 'Taimtim nga Saad',
    body: [
      'Maica...',
      'Sa tanang kasaba sa kalibutan, ikaw ang akong kalinaw. Sa tanang dalan nga akong maagian, ikaw akong direksyon.',
      'Dili ko perpekto nga tawo, pero I promise to listen, to understand, and to appreciate you more each day.',
      'Na appreciate jud nako tanan imoha gibuhat. Mahal kaayo tika, Lovey. Pirmi ug kanunay.',
    ],
    closing: 'Hangtod sa kahangturan, Clint',
    tag: 'Endless Heart',
    moodEmoji: '💍',
  },
];

export const getRandomDailyLetter = (): DailyQuoteLetter => {
  const randIndex = Math.floor(Math.random() * DAILY_LETTERS.length);
  return DAILY_LETTERS[randIndex];
};

export const getDailyLetterForToday = (): DailyQuoteLetter => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % DAILY_LETTERS.length;
  return DAILY_LETTERS[index];
};
