// ─── Full bilingual translation dictionary ────────────────────────────────────
// Keys are flat namespaced by screen/section.
// Technology names, proper names, URLs, emails stay in English.

export type Lang = 'en' | 'ar'

export interface Translations {
  // ── Global ──
  back: string
  close: string
  continue: string
  start: string
  next: string
  reset: string
  mute: string
  unmute: string
  soundSettings: string
  effects: string
  ambient: string

  // ── Language toggle ──
  langLabel: string

  // ── Opening screen ──
  openingTagline: string
  openingDesc: string
  openingBegin: string
  openingPortfolio: string

  // ── Guide screen ──
  guideStep: string
  guideTitle: string
  guideSubtitle: string
  guideDawnName: string
  guideDuskName: string
  guideDawnSubtitle: string
  guideDuskSubtitle: string
  guideDawnQuote: string
  guideDuskQuote: string
  guideDawnTags: string[]
  guideDuskTags: string[]
  guideDawnBtn: string
  guideDuskBtn: string
  guideSelectedLabel: string
  guideSelectBtn: string
  guideEnterBtn: string
  guideContinueBtn: string
  guideSelectHint: string
  guideOr: string

  // ── Reset dialog ──
  resetAdventure: string
  resetHeading: string
  resetDesc: string
  resetKeepPlaying: string
  resetConfirm: string

  // ── Garden Hub ──
  hubTitle: string
  hubSubtitle: string
  explorerLabel: string
  lavenderKeys: string
  butterflies: string
  adventureProgress: string
  currentQuest: string
  selectedDestination: string
  awaitingExplorer: string
  hoverPrompt: string
  clickToEnter: string
  keyCollected: string
  completed: string
  locked: string
  readyToUnlock: string
  enterFinalRevelation: string
  finalRevelationKeys: (n: number) => string
  clickSeeRemains: string
  mainMenu: string
  resetBtn: string

  // Room names
  roomPortrait: string
  roomCabinet: string
  roomStudio: string
  roomWorkshop: string
  roomGallery: string
  roomFinalGate: string

  // Room taglines
  tagPortrait: string
  tagCabinet: string
  tagStudio: string
  tagWorkshop: string
  tagGallery: string

  // HUD buttons
  hintBtn: string
  mapBtn: string
  bagBtn: string

  // Guide portraits
  wiseWanderer: string
  etherealGuide: string

  // Inventory panel
  gameInventory: string
  collectedItems: string
  lavenderKeysLabel: string
  butterfliesLabel: string
  discoveredRooms: string
  noRoomsExplored: string

  // Map panel
  navigationLabel: string
  lavenderGarden: string
  finalGateLabel: string
  mapClickHint: string

  // Help panel
  guidanceLabel: string
  howToPlay: string
  helpItems: { icon: string; t: string; b: string }[]

  // Quest box
  questRevealationTitle: string
  questRevealationBody: string
  questGatheringTitle: string
  questGatheringBody: (n: number) => string
  questFirstStepsTitle: string
  questFirstStepsBody: (n: number) => string
  questAwaitTitle: string
  questAwaitBody: string

  // Toast
  toastMsg: string

  // Locked door modal
  finalRevelationLabel: string
  finalDoorRequires: string
  keysCollected: string
  roomCompletionStatus: string
  returnToMap: string

  // Signpost rooms
  signpostPortrait: string
  signpostStudio: string
  signpostWorkshop: string
  signpostGallery: string

  // Rabbit phrases
  rabbitPhrases: string[]

  // ── Portrait Room ──
  pr_title: string
  pr_subtitle: string
  pr_examinePrompt: string
  pr_clickToFind: string
  pr_examine: string
  pr_guideLabel: string
  pr_wrongMsg: string
  pr_roomComplete: string
  pr_questTitle: string
  pr_questIntro: string
  pr_questTask: string
  pr_objects: Record<string, { label: string; meaning: string; hint: string }>
  pr_clues: string[]
  pr_aboutTitle: string
  pr_aboutContent: string[]
  pr_educationTitle: string
  pr_educationItems: string[]
  pr_languagesTitle: string
  pr_languagesItems: string[]
  pr_allThreeRevealed: string
  pr_mindVoiceKnown: string
  pr_findObjects: string
  pr_foundItem: string
  pr_quoteComplete: string
  pr_quoteLooking: string
  pr_lavenderKeyCollected: string
  pr_dusk: string
  pr_dawn: string
  pr_completionSubtext: string
  pr_returnToGarden: string
  pr_allObjectsFound: string
  pr_revealTitle: string
  pr_revealSubtext: string
  pr_collectKey: string
  pr_keyCollectedLine: string

  // ── Curious Cabinet (Tools room) ──
  cc_title: string
  cc_subtitle: string
  cc_dropPrompt: string
  cc_emptyDrawer: string
  cc_roomComplete: string
  cc_guideLabel: string
  cc_drawers: Record<string, string>
  cc_tools: Record<string, string>

  // ── Lavender Studio ──
  ls_title: string
  ls_subtitle: string
  ls_storyTitle: string
  ls_roomComplete: string
  ls_guideLabel: string
  ls_wrongMsg: string

  // ── Workshop ──
  ws_title: string
  ws_subtitle: string
  ws_pass: string
  ws_needsImprovement: string
  ws_keyCollected: string
  ws_notDiscovered: string
  ws_guideLabel: string
  ws_approve: string
  ws_revise: string
  ws_wrongMsg: (label: string | null) => string
  ws_submissions: { title: string; category: string; criteria: Record<string, string>; reason: string; verdict: string }[]

  // ── Learning Gallery ──
  lg_title: string
  lg_subtitle: string
  lg_matchFound: string
  lg_notMatch: string
  lg_keyCollected: string
  lg_notDiscovered: string
  lg_guideLabel: string
  lg_pairs: { cert: string; topic: string }[]

  // ── Final Door ──
  fd_puzzleLabel: string
  fd_puzzleTitle: string
  fd_puzzleSubtitle: string
  fd_selectKey: string
  fd_placeKey: string
  fd_placed: string
  fd_keyLabel: string
  fd_slotLabels: Record<string, string>
  fd_journeyChapter: string
  fd_allKeysPlaced: string
  fd_keysPlaced: string
  fd_storyUnlocked: string
  fd_doorOpening: string
  fd_quoteComplete: string
  fd_quoteBeyond: string
  fd_quoteEach: string
  fd_portfolioOverview: string
  fd_allRoomsCompleted: string
  fd_reachOut: string
  fd_contactTitle: string
  fd_emailLabel: string
  fd_sendEmail: string
  fd_journeyComplete: string
  fd_journeyCompleteSubtitle: string
  fd_viewPortfolio: string
  fd_contactMe: string
  fd_returnGarden: string
  fd_cards: { title: string; content: string; tags: string[] }[]

  // ── Portfolio Page ──
  pp_nav: string[]
  pp_aboutLabel: string
  pp_aboutTitle: string
  pp_eduLabel: string
  pp_eduTitle: string
  pp_langLabel: string
  pp_langTitle: string
  pp_internLabel: string
  pp_internTitle: string
  pp_vidLabel: string
  pp_vidTitle: string
  pp_featuredLabel: string
  pp_featuredTitle: string
  pp_techLabel: string
  pp_techTitle: string
  pp_projLabel: string
  pp_projTitle: string
  pp_skillsLabel: string
  pp_skillsTitle: string
  pp_toolsLabel: string
  pp_toolsTitle: string
  pp_learnLabel: string
  pp_learnTitle: string
  pp_contactLabel: string
  pp_contactTitle: string
  pp_expandHint: string
  pp_closeBtn: string
  pp_viewRecognition: string
  pp_playVideo: string
  pp_stopVideo: string
  pp_viewLinkedIn: string
  pp_viewProfile: string
  pp_backToGame: string
  pp_returnMenu: string
  pp_returnHub: string
  pp_returnOpening: string
}

const en: Translations = {
  // ── Global ──
  back: '← Back',
  close: '✕',
  continue: 'Continue',
  start: 'Start',
  next: 'Next',
  reset: '↺ Reset',
  mute: 'Mute',
  unmute: 'Unmute',
  soundSettings: 'SOUND SETTINGS',
  effects: 'Effects',
  ambient: 'Ambient',

  langLabel: 'EN',

  // ── Opening ──
  openingTagline: 'A Lavender-Tinted Adventure',
  openingDesc: 'A story-driven portfolio filled with ideas,\nchoices, and unexpected discoveries.',
  openingBegin: '✦  Begin the Adventure  ✦',
  openingPortfolio: 'View Portfolio Directly',

  // ── Guide screen ──
  guideStep: 'Step I of III',
  guideTitle: 'Choose Your Companion',
  guideSubtitle: 'Your companion through the garden of discoveries',
  guideDawnName: 'Dawn',
  guideDuskName: 'Dusk',
  guideDawnSubtitle: 'The Gentle Dreamer',
  guideDuskSubtitle: 'The Keeper of Secrets',
  guideDawnQuote: '"Let curiosity lead the way. Sometimes the smallest clues reveal the clearest answers."',
  guideDuskQuote: '"Every mystery leaves a trace. Attention to detail can reveal what the first glance misses."',
  guideDawnTags: ['Warm', 'Creative', 'Curious'],
  guideDuskTags: ['Wise', 'Observant', 'Mysterious'],
  guideDawnBtn: 'Choose Dawn',
  guideDuskBtn: 'Choose Dusk',
  guideSelectedLabel: 'Selected',
  guideSelectBtn: 'Select Companion',
  guideEnterBtn: 'Selected',
  guideContinueBtn: 'Begin the Journey',
  guideSelectHint: 'Select a companion to begin',
  guideOr: 'OR',

  // ── Reset dialog ──
  resetAdventure: 'RESET ADVENTURE',
  resetHeading: 'Start Over?',
  resetDesc: 'This will clear all collected keys, butterflies, and room progress. Your guide selection will also reset. This cannot be undone.',
  resetKeepPlaying: 'Keep Playing',
  resetConfirm: '✦ Reset Everything',

  // ── Garden Hub ──
  hubTitle: 'Mildly Mysterious',
  hubSubtitle: 'THE LAVENDER GARDEN · HUB',
  explorerLabel: 'EXPLORER',
  lavenderKeys: 'GOLDEN KEYS',
  butterflies: 'BUTTERFLIES',
  adventureProgress: 'ADVENTURE PROGRESS',
  currentQuest: 'CURRENT QUEST',
  selectedDestination: 'SELECTED DESTINATION',
  awaitingExplorer: 'AWAITING EXPLORER',
  hoverPrompt: 'Hover over a glowing structure…',
  clickToEnter: '↵ Click to Enter',
  keyCollected: '✓ Key Collected',
  completed: '✦ Completed',
  locked: 'LOCKED',
  readyToUnlock: 'READY TO UNLOCK',
  enterFinalRevelation: '✦ Enter the Final Revelation',
  finalRevelationKeys: (n) => `Final Revelation · ${n} / 5 keys`,
  clickSeeRemains: 'Click to see what remains',
  mainMenu: '⌂ Main Menu',
  resetBtn: '↺ Reset',

  roomPortrait: 'The Portrait Room',
  roomCabinet: 'The Curious Cabinet',
  roomStudio: 'The Lavender Studio',
  roomWorkshop: 'The Insight Workshop',
  roomGallery: 'The Learning Gallery',
  roomFinalGate: 'Final Gate',

  tagPortrait: 'Stories · Identity · Origins',
  tagCabinet: 'Wonders · Interests · Mystery',
  tagStudio: 'Design · Creative Works · Vision',
  tagWorkshop: 'Code · Systems · Technical Craft',
  tagGallery: 'Education · Growth · Discovery',

  hintBtn: '✦ Hint',
  mapBtn: '🗺 Map',
  bagBtn: '🎒 Bag',

  wiseWanderer: 'The Wise\nWanderer',
  etherealGuide: 'The Ethereal\nGuide',

  gameInventory: 'GAME INVENTORY',
  collectedItems: '🎒 Collected Items',
  lavenderKeysLabel: 'Golden Keys',
  butterfliesLabel: 'Butterflies',
  discoveredRooms: 'DISCOVERED ROOMS',
  noRoomsExplored: 'No rooms explored yet.',

  navigationLabel: 'NAVIGATION',
  lavenderGarden: '🗺 The Lavender Garden',
  finalGateLabel: 'Final\nGate',
  mapClickHint: 'Click a glowing structure to explore it and collect its golden key.',

  guidanceLabel: 'GUIDANCE',
  howToPlay: '✦ How to Play',
  helpItems: [
    { icon: '🗝', t: 'Collect Keys',      b: 'Explore each glowing room, complete its challenge, then click the golden key to collect it.' },
    { icon: '🦋', t: 'Catch Butterflies', b: 'Collect 10 butterflies hidden around the garden to awaken a secret lavender bloom.' },
    { icon: '🐇', t: 'Ask the Bunny',    b: 'The magical bunny offers hints when clicked.' },
    { icon: '🔒', t: 'The Final Gate',   b: 'Collect all 5 golden keys to unlock the Final Revelation.' },
  ],

  questRevealationTitle: 'The Revelation Awaits',
  questRevealationBody: 'All 5 golden keys collected! Step through the final gate.',
  questGatheringTitle: 'Gathering Keys',
  questGatheringBody: (n) => `${n} key${n !== 1 ? 's' : ''} remain. Every room holds a secret.`,
  questFirstStepsTitle: 'First Steps',
  questFirstStepsBody: (n) => `${n} more key${n !== 1 ? 's' : ''} to find — explore every glowing structure.`,
  questAwaitTitle: 'The Garden Awaits',
  questAwaitBody: 'Explore the garden and collect 5 golden keys.',

  toastMsg: 'Lavender key collected · Room coming soon',

  finalRevelationLabel: 'THE FINAL REVELATION',
  finalDoorRequires: 'The final door requires all five keys.',
  keysCollected: 'Keys Collected:',
  roomCompletionStatus: 'ROOM COMPLETION STATUS',
  returnToMap: '← Return to Map',

  signpostPortrait: 'Portrait Room',
  signpostStudio: 'Lavender Studio',
  signpostWorkshop: 'Insight Workshop',
  signpostGallery: 'Learning Gallery',

  rabbitPhrases: [
    "Some secrets only appear to those who look twice.",
    "Not everything hidden is meant to stay hidden.",
    "A curious eye is often the first key.",
    "Every room keeps a secret. The question is where.",
    "The obvious path is rarely the only one.",
    "Five rooms. Five keys. One final secret.",
    "Look closely. The smallest detail may matter most.",
    "A locked door is simply a question waiting for an answer.",
    "Every puzzle leaves a trace.",
    "Some answers are hiding in plain sight.",
    "The next clue may already be looking at you.",
    "Keys are earned by curiosity, not luck.",
    "A little mystery makes every discovery better.",
  ],

  // ── Portrait Room ──
  pr_title: 'Portrait Room',
  pr_subtitle: 'Stories · Identity · Origins',
  pr_examinePrompt: 'Each object in this room holds a piece of the story. Examine them to find the clue.',
  pr_clickToFind: '✦ Click to find',
  pr_examine: 'Examine…',
  pr_guideLabel: 'Guide',
  pr_wrongMsg: 'Interesting… but this object holds a different story.',
  pr_roomComplete: 'Room Complete',
  pr_questTitle: 'The Mirror Speaks',
  pr_questIntro: 'This room holds fragments of identity — academic milestones, creative passions, and the language that shaped a perspective.',
  pr_questTask: 'Find the object that best represents the academic journey.',
  pr_objects: {
    scroll:   { label: 'University Scroll',   meaning: 'Academic Journey',    hint: 'A scroll sealed with knowledge — the foundation of every professional path.' },
    camera:   { label: 'Camera',              meaning: 'Visual Storytelling', hint: 'Through a lens, stories come alive in ways words sometimes cannot.' },
    journal:  { label: 'Journal',             meaning: 'Ideas',               hint: 'Words written in quiet moments hold the deepest ideas.' },
    teacup:   { label: 'Porcelain Teacup',    meaning: 'Comfort',             hint: 'Warmth in simplicity — the small rituals that sustain creative work.' },
    musicbox: { label: 'Silver Music Box',    meaning: 'Memory',              hint: 'Melodies hold memories that words forget.' },
    crystal:  { label: 'Crystal Sphere',      meaning: 'Vision',              hint: 'To see the future, one must first understand the present.' },
    vase:     { label: 'Ornate Flower Vase',  meaning: 'Growth',              hint: 'Even beautiful things require patience and the right environment.' },
    cat:      { label: 'Sleeping Cat',        meaning: 'Calm',                hint: 'Not every moment needs urgency — sometimes stillness is the answer.' },
  },
  pr_clues: [
    'The room speaks of a mind shaped by structured knowledge.',
    'Academic credentials are the foundation of professional identity.',
    'One object here carries the weight of four years of study.',
    'The scroll is the answer.',
  ],
  pr_aboutTitle: 'About Me',
  pr_aboutContent: [
    'Layan Mohammed Alahmari — an Information Systems student at King Abdulaziz University with a strong interest in content design, digital media, and technology-driven creativity.',
    'I approach every project with attention to detail, a desire to learn, and a belief that thoughtful design can simplify even the most complex ideas.',
    'My work sits at the intersection of structure and imagination — where systems thinking meets visual storytelling.',
  ],
  pr_educationTitle: 'Education',
  pr_educationItems: [
    'Bachelor of Science in Information Systems',
    'King Abdulaziz University',
    'Aug 2021 – Jun 2027',
  ],
  pr_languagesTitle: 'Languages',
  pr_languagesItems: [
    'Arabic — Native',
    'English — Advanced',
    'Confident in English writing, presentations, and professional content creation.',
  ],
  pr_allThreeRevealed: 'ALL THREE REVEALED',
  pr_mindVoiceKnown: '"Mind, path, and voice — now known."',
  pr_findObjects: 'Find the hidden objects',
  pr_foundItem: '✦ Found',
  pr_quoteComplete: '"The portrait is complete."',
  pr_quoteLooking: '"Look carefully. Each object hides in plain sight."',
  pr_lavenderKeyCollected: 'Lavender Key Collected',
  pr_dusk: 'Dusk',
  pr_dawn: 'Dawn',
  pr_completionSubtext: 'All hidden objects were found successfully.',
  pr_returnToGarden: 'Return to Garden',
  pr_allObjectsFound: 'ALL THREE OBJECTS FOUND',
  pr_revealTitle: 'The Portrait Reveals Itself',
  pr_revealSubtext: 'Three objects, three truths.',
  pr_collectKey: 'Collect Golden Key',
  pr_keyCollectedLine: 'LAVENDER KEY — COLLECTED',

  // ── Curious Cabinet ──
  cc_title: 'THE CURIOUS CABINET',
  cc_subtitle: 'Wonders · Interests · Mystery',
  cc_dropPrompt: 'Drop here ↓',
  cc_emptyDrawer: 'Empty — drop a tool',
  cc_roomComplete: 'Room Complete',
  cc_guideLabel: 'Guide',
  cc_drawers: {
    design:    'Visual Design',
    course:    'Educational Content and Presentations',
    voice:     'Voice-over Production',
    ideas:     'Ideas, Scripts & Problem Solving',
    version:   'Managing Code and Collaborating on Projects',
    technical: 'Technical Development',
  },
  cc_tools: {
    canva:      'Designing visual content',
    powerpoint: 'Designing and preparing educational content and presentations',
    elevenlabs: 'Producing voice-over',
    chatgpt:    'Supporting content generation and development',
    github:     'Managing code and collaborating on projects',
    vscode:     'Programming and project development',
  },

  // ── Lavender Studio ──
  ls_title: 'THE LAVENDER STUDIO',
  ls_subtitle: 'Design · Creative Works · Vision',
  ls_storyTitle: 'A Story in Pieces',
  ls_roomComplete: 'Room Complete',
  ls_guideLabel: 'Guide',
  ls_wrongMsg: 'This piece belongs somewhere else in the image.',

  // ── Workshop ──
  ws_title: 'THE WORKSHOP',
  ws_subtitle: 'Code · Systems · Technical Craft',
  ws_pass: 'Pass',
  ws_needsImprovement: 'Needs Improvement',
  ws_keyCollected: 'Key collected',
  ws_notDiscovered: 'Not yet discovered',
  ws_guideLabel: 'Guide',
  ws_approve: 'Approve',
  ws_revise: 'Revise',
  ws_wrongMsg: (label) => label ? `Reconsider the ${label} criterion.` : 'Review the criteria carefully before deciding.',
  ws_submissions: [
    {
      title: 'Statistics Educational Video',
      category: 'Statistics · Batch 1 of 3',
      criteria: { accuracy: 'Content Accuracy', visual: 'Visual Quality', technical: 'Technical Readiness' },
      reason: 'The submission meets all evaluation criteria and is ready for approval.',
      verdict: 'pass',
    },
    {
      title: 'Performance Measurement Video',
      category: 'Performance Management · Draft Review',
      criteria: { accuracy: 'Content Accuracy', visual: 'Visual Quality', technical: 'Technical Readiness' },
      reason: 'The content is accurate, but the visual hierarchy and technical export requirements need revision.',
      verdict: 'revise',
    },
    {
      title: 'Blue Team vs Red Team Video',
      category: 'Cybersecurity · Educational Content',
      criteria: { accuracy: 'Content Accuracy', visual: 'Visual Quality', technical: 'Technical Readiness' },
      reason: 'Content accuracy needs clarification, but the visual quality and technical readiness are strong.',
      verdict: 'revise',
    },
  ],

  // ── Learning Gallery ──
  lg_title: 'THE LEARNING GALLERY',
  lg_subtitle: 'Education · Growth · Discovery',
  lg_matchFound: 'Matched! ✓',
  lg_notMatch: 'Not a match — keep looking.',
  lg_keyCollected: 'Key collected',
  lg_notDiscovered: 'Not yet discovered',
  lg_guideLabel: 'Guide',
  lg_pairs: [
    { cert: 'From Idea to Interactive Prototype',                        topic: 'App Prototyping'      },
    { cert: 'Ethics of Artificial Intelligence and Data Governance',     topic: 'Responsible AI'       },
    { cert: 'How to Protect Your Data in the Information Age?',          topic: 'Data Protection'      },
    { cert: 'Mental Health in the Workplace',                            topic: 'Workplace Wellbeing'  },
    { cert: 'Self-Awareness and Development Methods',                    topic: 'Personal Development' },
  ],

  // ── Final Door ──
  fd_puzzleLabel: 'THE FINAL REVELATION',
  fd_puzzleTitle: 'Place Your Keys',
  fd_puzzleSubtitle: 'Each key belongs to the room that shaped it. Place them all to open the final door.',
  fd_selectKey: 'Select a key from your inventory, then click its matching slot on the door.',
  fd_placeKey: 'Click a slot to place it',
  fd_placed: 'PLACED',
  fd_keyLabel: '🗝 KEY',
  fd_slotLabels: {
    portrait: 'The Portrait Room',
    cabinet: 'The Curious Cabinet',
    studio: 'Lavender Studio',
    workshop: 'The Insight Workshop',
    gallery: 'The Learning Gallery',
  },
  fd_journeyChapter: 'JOURNEY CHAPTER',
  fd_allKeysPlaced: 'ALL KEYS PLACED',
  fd_keysPlaced: 'KEYS PLACED',
  fd_storyUnlocked: 'THE STORY IS NOW UNLOCKED',
  fd_doorOpening: 'THE DOOR IS OPENING…',
  fd_quoteComplete: '"Every key has found its door. The story is complete."',
  fd_quoteBeyond: '"The light beyond tells the story of everything you have built."',
  fd_quoteEach: '"Each key belongs to the story that shaped it."',
  fd_portfolioOverview: 'PORTFOLIO OVERVIEW',
  fd_allRoomsCompleted: 'ALL ROOMS COMPLETED',
  fd_reachOut: 'REACH OUT',
  fd_contactTitle: 'Contact Me',
  fd_emailLabel: 'EMAIL',
  fd_sendEmail: '✦  Send an Email  ✦',
  fd_journeyComplete: 'Journey Complete',
  fd_journeyCompleteSubtitle: 'You have explored every room and placed every key.',
  fd_viewPortfolio: '✦ View Full Portfolio',
  fd_contactMe: '✉ Contact Me',
  fd_returnGarden: '← Back to Garden',
  fd_cards: [
    {
      title: 'Information Systems',
      content: 'Bachelor of Information Systems at King Abdulaziz University (2021–2026). Bridging technology and meaningful digital experiences through structured analytical thinking.',
      tags: ['King Abdulaziz University', '2021–2026', 'Systems Analysis'],
    },
    {
      title: 'Business & Management',
      content: 'Combines knowledge from marketing, accounting, and project management to support an understanding of how technology connects with business needs and organizational decision-making.',
      tags: ['Marketing', 'Accounting', 'Project Management'],
    },
    {
      title: 'Video & Educational Content Production',
      content: 'Experience in analyzing and simplifying content, developing educational scripts, creating visual content, producing AI-assisted voice-over, editing, and delivering final video productions.',
      tags: ['Video Production', 'Scriptwriting', 'Content Simplification', 'Video Editing'],
    },
    {
      title: 'Web Technologies',
      content: 'Knowledge of web development fundamentals and interface building using web technologies, with an interest in creating clear and interactive digital experiences.',
      tags: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      title: 'AI-Assisted Creation',
      content: 'Integrated AI-powered workflows into creative and technical processes, leveraging tools like Figma AI, ChatGPT, and ElevenLabs to enhance output quality and efficiency.',
      tags: ['ChatGPT', 'Gemini', 'Copilot', 'ElevenLabs', 'Adobe Express'],
    },
  ],

  // ── Portfolio Page ──
  pp_nav: ['About', 'Education', 'Languages', 'Internship', 'Video Production', 'Work', 'Tech Contribution', 'Academic Projects', 'Skills', 'Tools', 'Certificates & Recognition', 'Contact'],
  pp_aboutLabel: 'ABOUT',
  pp_aboutTitle: 'About Me',
  pp_eduLabel: 'EDUCATION',
  pp_eduTitle: 'Education',
  pp_langLabel: 'LANGUAGES',
  pp_langTitle: 'Languages',
  pp_internLabel: 'INTERNSHIP',
  pp_internTitle: 'Summer Internship',
  pp_vidLabel: 'VIDEO',
  pp_vidTitle: 'Video Production',
  pp_featuredLabel: 'FEATURED',
  pp_featuredTitle: 'Featured Work',
  pp_techLabel: 'TECHNICAL',
  pp_techTitle: 'Technical Contribution',
  pp_projLabel: 'PROJECTS',
  pp_projTitle: 'Academic Projects',
  pp_skillsLabel: 'SKILLS',
  pp_skillsTitle: 'Skills',
  pp_toolsLabel: 'TOOLS',
  pp_toolsTitle: 'Tools',
  pp_learnLabel: 'CERTIFICATES',
  pp_learnTitle: 'Certificates & Recognition',
  pp_contactLabel: 'CONTACT',
  pp_contactTitle: 'Contact',
  pp_expandHint: '⤢ CLICK TO EXPAND',
  pp_closeBtn: '✕ Close',
  pp_viewRecognition: 'VIEW RECOGNITION ↗',
  pp_playVideo: 'Play Video',
  pp_stopVideo: 'Stop Video',
  pp_viewLinkedIn: 'View LinkedIn Profile',
  pp_viewProfile: 'View Profile',
  pp_backToGame: '← Back to Adventure',
  pp_returnMenu: '⌂ Main Menu',
  pp_returnHub: '← Return to Garden',
  pp_returnOpening: '← Return to Opening',
}

const ar: Translations = {
  // ── Global ──
  back: 'رجوع →',
  close: '✕',
  continue: 'متابعة',
  start: 'ابدأ',
  next: 'التالي',
  reset: '↺ إعادة الضبط',
  mute: 'كتم الصوت',
  unmute: 'تشغيل الصوت',
  soundSettings: 'إعدادات الصوت',
  effects: 'المؤثرات الصوتية',
  ambient: 'الصوت المحيط',

  langLabel: 'ع',

  // ── Opening ──
  openingTagline: 'مغامرة بنكهة اللافندر',
  openingDesc: 'ملف شخصي قصصي مليء بالأفكار والخيارات\nوالاكتشافات غير المتوقعة.',
  openingBegin: '✦  ابدأ المغامرة  ✦',
  openingPortfolio: 'عرض ملف الأعمال مباشرةً',

  // ── Guide screen ──
  guideStep: 'الخطوة الأولى من ثلاث',
  guideTitle: 'اختر رفيق رحلتك',
  guideSubtitle: 'رفيقك في رحلة عبر حديقة الاكتشافات',
  guideDawnName: 'داون',
  guideDuskName: 'دَسك',
  guideDawnSubtitle: 'الحالمة الهادئة',
  guideDuskSubtitle: 'حافظ الأسرار',
  guideDawnQuote: '"ليقد الفضول الطريق، فأحيانًا تكشف أبسط الإشارات أوضح الإجابات."',
  guideDuskQuote: '"لكل لغز أثر، والانتباه للتفاصيل قد يكشف ما لا يظهر من النظرة الأولى."',
  guideDawnTags: ['هادئة', 'مبدعة', 'فضولية'],
  guideDuskTags: ['حكيم', 'دقيق الملاحظة', 'غامض'],
  guideDawnBtn: 'اختر داون',
  guideDuskBtn: 'اختر دَسك',
  guideSelectedLabel: 'تم الاختيار',
  guideSelectBtn: 'اختر رفيقاً',
  guideEnterBtn: 'تم الاختيار',
  guideContinueBtn: 'ابدأ الرحلة',
  guideSelectHint: 'اختر رفيقًا للبدء',
  guideOr: 'أو',

  // ── Reset dialog ──
  resetAdventure: 'إعادة ضبط المغامرة',
  resetHeading: 'البدء من جديد؟',
  resetDesc: 'سيؤدي هذا إلى مسح جميع المفاتيح المجمّعة والفراشات وتقدم الغرف. سيتم كذلك إعادة تعيين اختيار رفيقك. لا يمكن التراجع عن هذا الإجراء.',
  resetKeepPlaying: 'الاستمرار في اللعب',
  resetConfirm: '✦ إعادة الضبط الكاملة',

  // ── Garden Hub ──
  hubTitle: 'Mildly Mysterious',
  hubSubtitle: 'حديقة اللافندر · المحور',
  explorerLabel: 'مستكشف',
  lavenderKeys: 'مفاتيح اللافندر',
  butterflies: 'الفراشات',
  adventureProgress: 'تقدم المغامرة',
  currentQuest: 'المهمة الحالية',
  selectedDestination: 'الوجهة المختارة',
  awaitingExplorer: 'في انتظار المستكشف',
  hoverPrompt: 'مرر مؤشرك فوق المبنى المضيء…',
  clickToEnter: '↵ انقر للدخول',
  keyCollected: '✓ تم جمع المفتاح',
  completed: '✦ مكتمل',
  locked: 'مقفل',
  readyToUnlock: 'جاهز للفتح',
  enterFinalRevelation: '✦ الدخول إلى الكشف النهائي',
  finalRevelationKeys: (n) => `الكشف النهائي · ${n} / 5 مفاتيح`,
  clickSeeRemains: 'انقر لرؤية ما تبقى',
  mainMenu: '⌂ القائمة الرئيسية',
  resetBtn: '↺ إعادة',

  roomPortrait: 'غرفة الصورة الشخصية',
  roomCabinet: 'خزانة الفضول',
  roomStudio: 'استوديو اللافندر',
  roomWorkshop: 'ورشة الروابط',
  roomGallery: 'معرض التعلّم',
  roomFinalGate: 'البوابة الأخيرة',

  tagPortrait: 'القصص · الهوية · الأصول',
  tagCabinet: 'العجائب · الاهتمامات · الغموض',
  tagStudio: 'التصميم · الأعمال الإبداعية · الرؤية',
  tagWorkshop: 'البرمجة · الأنظمة · الإتقان التقني',
  tagGallery: 'التعليم · النمو · الاكتشاف',

  hintBtn: '✦ تلميح',
  mapBtn: '🗺 خريطة',
  bagBtn: '🎒 حقيبة',

  wiseWanderer: 'الرفيق\nالحكيم',
  etherealGuide: 'الرفيقة\nالحالمة',

  gameInventory: 'مخزون اللعبة',
  collectedItems: '🎒 العناصر المجمّعة',
  lavenderKeysLabel: 'مفاتيح اللافندر',
  butterfliesLabel: 'الفراشات',
  discoveredRooms: 'الغرف المكتشفة',
  noRoomsExplored: 'لم يتم استكشاف أي غرفة حتى الآن.',

  navigationLabel: 'التنقل',
  lavenderGarden: '🗺 حديقة اللافندر',
  finalGateLabel: 'البوابة\nالأخيرة',
  mapClickHint: 'انقر على المبنى المضيء لاستكشافه والحصول على مفتاح اللافندر الخاص به.',

  guidanceLabel: 'التوجيه',
  howToPlay: '✦ كيفية اللعب',
  helpItems: [
    { icon: '🗝', t: 'جمع المفاتيح',      b: 'استكشف كل غرفة مضيئة وأكمل تحديها ثم اضغط على المفتاح الذهبي لجمعه.' },
    { icon: '🦋', t: 'جمع الفراشات',      b: 'اجمع 10 فراشات منتشرة في الحديقة لتوقظ زهرة لافندر سرية.' },
    { icon: '🐇', t: 'اسأل الأرنب',       b: 'يقدم الأرنب السحري تلميحات عند الضغط عليه.' },
    { icon: '🔒', t: 'الباب الأخير',      b: 'اجمع المفاتيح الذهبية الخمسة لفتح الكشف الأخير.' },
  ],

  questRevealationTitle: 'الكشف في انتظارك',
  questRevealationBody: 'تم جمع جميع المفاتيح الخمسة! ادخل من البوابة الأخيرة.',
  questGatheringTitle: 'جمع المفاتيح',
  questGatheringBody: (n) => `تبقى ${n} ${n === 1 ? 'مفتاح' : 'مفاتيح'}. كل غرفة تحمل سراً.`,
  questFirstStepsTitle: 'الخطوات الأولى',
  questFirstStepsBody: (n) => `${n} ${n === 1 ? 'مفتاح' : 'مفاتيح'} أخرى للعثور عليها — استكشف كل مبنى مضيء.`,
  questAwaitTitle: 'الحديقة تنتظرك',
  questAwaitBody: 'استكشف الحديقة واجمع 5 مفاتيح لافندر.',

  toastMsg: 'تم جمع مفتاح اللافندر · الغرفة قادمة قريباً',

  finalRevelationLabel: 'الكشف النهائي',
  finalDoorRequires: 'يحتاج الباب الأخير إلى المفاتيح الخمسة لفتحه.',
  keysCollected: 'المفاتيح المجمّعة:',
  roomCompletionStatus: 'حالة إكمال الغرف',
  returnToMap: 'العودة إلى الخريطة →',

  signpostPortrait: 'غرفة الصورة الشخصية',
  signpostStudio: 'استوديو اللافندر',
  signpostWorkshop: 'ورشة الروابط',
  signpostGallery: 'معرض التعلّم',

  rabbitPhrases: [
    "بعض الأسرار لا تظهر إلا لمن ينظر مرة أخرى.",
    "ليس كل ما خفي كُتب له أن يبقى مخفيًا.",
    "العين الفضولية قد تكون أول مفتاح.",
    "لكل غرفة سر... والسؤال هو أين يختبئ؟",
    "الطريق الواضح ليس دائمًا الطريق الوحيد.",
    "خمس غرف، خمسة مفاتيح، وسر أخير.",
    "دقق النظر، فقد تكون أصغر التفاصيل هي الأهم.",
    "الباب المقفل مجرد سؤال ينتظر إجابة.",
    "كل لغز يترك أثرًا.",
    "قد يكون الدليل التالي أمامك بالفعل.",
    "المفاتيح تُكتسب بالفضول، لا بالحظ.",
    "القليل من الغموض يجعل كل اكتشاف أجمل.",
    "بعض الإجابات تختبئ في مكان واضح للعيان.",
  ],

  // ── Portrait Room ──
  pr_title: 'غرفة الصورة الشخصية',
  pr_subtitle: 'الحكاية · الهوية · البدايات',
  pr_examinePrompt: 'كل قطعة في هذه الغرفة تحمل جزءاً من القصة. افحصها للعثور على الدليل.',
  pr_clickToFind: '✦ انقر للبحث',
  pr_examine: 'افحص…',
  pr_guideLabel: 'الرفيق',
  pr_wrongMsg: 'مثير للاهتمام… لكن هذه القطعة تحمل قصة مختلفة.',
  pr_roomComplete: 'اكتملت الغرفة',
  pr_questTitle: 'المرآة تتكلم',
  pr_questIntro: 'تحمل هذه الغرفة شظايا من الهوية — إنجازات أكاديمية وشغف إبداعي ولغة شكّلت منظوراً.',
  pr_questTask: 'ابحث عن القطعة التي تمثّل الرحلة الأكاديمية على أفضل وجه.',
  pr_objects: {
    scroll:   { label: 'لفافة جامعية',          meaning: 'الرحلة الأكاديمية',     hint: 'لفافة مختومة بالمعرفة — أساس كل مسيرة مهنية.' },
    camera:   { label: 'كاميرا',               meaning: 'رواية القصص المرئي',    hint: 'من خلال العدسة تحيا القصص بأساليب لا تستطيع الكلمات أحياناً التعبير عنها.' },
    journal:  { label: 'مذكرة',                meaning: 'الأفكار',               hint: 'الكلمات المكتوبة في لحظات الهدوء تحمل أعمق الأفكار.' },
    teacup:   { label: 'فنجان بورسلين',         meaning: 'الراحة',               hint: 'الدفء في البساطة — الطقوس الصغيرة التي تُعين على العمل الإبداعي.' },
    musicbox: { label: 'صندوق موسيقى فضي',      meaning: 'الذاكرة',              hint: 'الألحان تحمل ذكريات تنساها الكلمات.' },
    crystal:  { label: 'كرة بلورية',            meaning: 'الرؤية',               hint: 'لرؤية المستقبل يجب أولاً فهم الحاضر.' },
    vase:     { label: 'مزهرية زخرفية',          meaning: 'النمو',                hint: 'حتى الأشياء الجميلة تحتاج إلى صبر وبيئة مناسبة.' },
    cat:      { label: 'قطة نائمة',             meaning: 'الهدوء',               hint: 'ليست كل لحظة بحاجة إلى عجلة — أحياناً السكون هو الجواب.' },
  },
  pr_clues: [
    'تتحدث الغرفة عن عقل تشكّل بالمعرفة المنظّمة.',
    'المؤهلات الأكاديمية هي أساس الهوية المهنية.',
    'قطعة واحدة هنا تحمل ثقل أربع سنوات من الدراسة.',
    'اللفافة هي الجواب.',
  ],
  pr_aboutTitle: 'نبذة عني',
  pr_aboutContent: [
    'ليان محمد الأحمري — طالبة نظم معلومات في جامعة الملك عبدالعزيز، أحمل اهتماماً عميقاً بتصميم المحتوى والإعلام الرقمي والإبداع التقني.',
    'أتناول كل مشروع بعين ثاقبة وشغف للتعلم وإيمان بأن التصميم المدروس يستطيع تبسيط حتى أعقد الأفكار.',
    'تقع أعمالي عند تقاطع البنية والخيال — حيث يلتقي التفكير المنظومي بسرد القصص المرئي.',
  ],
  pr_educationTitle: 'التعليم',
  pr_educationItems: [
    'بكالوريوس علوم في نظم المعلومات',
    'جامعة الملك عبدالعزيز',
    'أغسطس 2021 – يونيو 2027',
  ],
  pr_languagesTitle: 'اللغات',
  pr_languagesItems: [
    'العربية — اللغة الأم',
    'الإنجليزية — متقدم',
    'واثقة في الكتابة الإنجليزية والعروض التقديمية وإنتاج المحتوى المهني.',
  ],
  pr_allThreeRevealed: 'اكتُشف الثلاثة',
  pr_mindVoiceKnown: '"العقل والمسار والصوت — باتت معروفة."',
  pr_findObjects: 'اعثر على العناصر المخفية',
  pr_foundItem: '✦ وُجد',
  pr_quoteComplete: '"اكتملت الصورة الشخصية."',
  pr_quoteLooking: '"انظر بعناية. كل شيء يختبئ في العلن."',
  pr_lavenderKeyCollected: 'مفتاح اللافندر تم جمعه',
  pr_dusk: 'الغسق',
  pr_dawn: 'الفجر',
  pr_completionSubtext: 'تم العثور على جميع العناصر المخفية بنجاح.',
  pr_returnToGarden: 'العودة إلى الحديقة →',
  pr_allObjectsFound: 'اكتُشف جميع العناصر الثلاثة',
  pr_revealTitle: 'تكشف الصورة عن نفسها',
  pr_revealSubtext: 'ثلاثة عناصر، ثلاثة حقائق.',
  pr_collectKey: 'اجمع المفتاح الذهبي',
  pr_keyCollectedLine: 'مفتاح اللافندر — تم الجمع',

  // ── Curious Cabinet ──
  cc_title: 'خزانة الفضول',
  cc_subtitle: 'العجائب · الاهتمامات · الغموض',
  cc_dropPrompt: 'أسقط هنا ↓',
  cc_emptyDrawer: 'فارغ — أسقط أداة',
  cc_roomComplete: 'اكتملت الغرفة',
  cc_guideLabel: 'تم كشف الخزانة',
  cc_drawers: {
    design:    'التصميم البصري',
    course:    'المحتوى والعروض التعليمية',
    voice:     'إنتاج التعليق الصوتي',
    ideas:     'الأفكار والنصوص وحل المشكلات',
    version:   'إدارة الأكواد والتعاون على المشاريع',
    technical: 'التطوير التقني',
  },
  cc_tools: {
    canva:      'تصميم المحتوى المرئي',
    powerpoint: 'تصميم وإعداد المحتوى والعروض التعليمية',
    elevenlabs: 'إنتاج التعليق الصوتي',
    chatgpt:    'المساعدة في توليد وتطوير المحتوى',
    github:     'إدارة الأكواد والتعاون على المشاريع',
    vscode:     'البرمجة وتطوير المشاريع',
  },

  // ── Lavender Studio ──
  ls_title: 'استوديو اللافندر',
  ls_subtitle: 'التصميم · الأعمال الإبداعية · الرؤية',
  ls_storyTitle: 'قصة من القطع',
  ls_roomComplete: 'اكتملت الغرفة',
  ls_guideLabel: 'الرفيق',
  ls_wrongMsg: 'هذه القطعة تنتمي إلى مكان آخر في الصورة.',

  // ── Workshop ──
  ws_title: 'ورشة المراجعة',
  ws_subtitle: 'البرمجة · الأنظمة · الإتقان التقني',
  ws_pass: 'مستوفى',
  ws_needsImprovement: 'يحتاج إلى تحسين',
  ws_keyCollected: 'تم جمع المفتاح',
  ws_notDiscovered: 'لم يُكتشف بعد',
  ws_guideLabel: 'الرفيق',
  ws_approve: 'اعتماد',
  ws_revise: 'تعديل',
  ws_wrongMsg: (label) => label ? `أعد النظر في معيار ${label}.` : 'راجع المعايير بعناية قبل اتخاذ قرارك.',
  ws_submissions: [
    {
      title: 'فيديو تعليمي للإحصاء',
      category: 'الإحصاء · الدفعة الأولى من 3',
      criteria: { accuracy: 'دقة المحتوى', visual: 'الجودة البصرية', technical: 'الاستعداد التقني' },
      reason: 'التقديم يستوفي جميع معايير التقييم وهو جاهز للموافقة.',
      verdict: 'pass',
    },
    {
      title: 'فيديو قياس الأداء',
      category: 'إدارة الأداء · مراجعة المسودة',
      criteria: { accuracy: 'دقة المحتوى', visual: 'الجودة البصرية', technical: 'الاستعداد التقني' },
      reason: 'المحتوى دقيق، لكن التسلسل الهرمي المرئي ومتطلبات التصدير التقنية تحتاج إلى مراجعة.',
      verdict: 'revise',
    },
    {
      title: 'فيديو الفريق الأزرق مقابل الفريق الأحمر',
      category: 'الأمن السيبراني · محتوى تعليمي',
      criteria: { accuracy: 'دقة المحتوى', visual: 'الجودة البصرية', technical: 'الاستعداد التقني' },
      reason: 'دقة المحتوى تحتاج إلى توضيح، لكن الجودة البصرية والاستعداد التقني قويّان.',
      verdict: 'revise',
    },
  ],

  // ── Learning Gallery ──
  lg_title: 'معرض التعلّم',
  lg_subtitle: 'التعليم · النمو · الاكتشاف',
  lg_matchFound: 'تطابق! ✓',
  lg_notMatch: 'لا تطابق — تابع البحث.',
  lg_keyCollected: 'تم جمع المفتاح',
  lg_notDiscovered: 'لم يُكتشف بعد',
  lg_guideLabel: 'الرفيق',
  lg_pairs: [
    { cert: 'من الفكرة إلى النموذج التفاعلي',                             topic: 'نمذجة التطبيقات'    },
    { cert: 'أخلاقيات الذكاء الاصطناعي وحوكمة البيانات',                   topic: 'الذكاء الاصطناعي المسؤول' },
    { cert: 'كيف تحمي بياناتك في عصر المعلومات؟',                         topic: 'حماية البيانات'     },
    { cert: 'الصحة النفسية في بيئة العمل',                                 topic: 'الرفاهية المهنية'   },
    { cert: 'الوعي الذاتي وأساليب التطوير',                                topic: 'التطوير الشخصي'    },
  ],

  // ── Final Door ──
  fd_puzzleLabel: 'الكشف النهائي',
  fd_puzzleTitle: 'ضع مفاتيحك',
  fd_puzzleSubtitle: 'كل مفتاح ينتمي إلى الغرفة التي شكّلته. ضعها جميعاً لفتح الباب الأخير.',
  fd_selectKey: 'اختر مفتاحاً من مخزونك ثم انقر على الفتحة المقابلة له على الباب.',
  fd_placeKey: 'انقر على فتحة لوضعه',
  fd_placed: 'وُضع',
  fd_keyLabel: '🗝 مفتاح',
  fd_slotLabels: {
    portrait: 'غرفة الصورة الشخصية',
    cabinet: 'خزانة الفضول',
    studio: 'استوديو اللافندر',
    workshop: 'ورشة الروابط',
    gallery: 'معرض التعلّم',
  },

  fd_journeyChapter: 'فصل من الرحلة',
  fd_allKeysPlaced: 'جميع المفاتيح وُضعت',
  fd_keysPlaced: 'المفاتيح الموضوعة',
  fd_storyUnlocked: 'القصة مُفتوحة الآن',
  fd_doorOpening: 'الباب يُفتح…',
  fd_quoteComplete: '"كل مفتاح وجد بابه. القصة اكتملت."',
  fd_quoteBeyond: '"الضوء من ورائه يروي قصة كل ما بنيته."',
  fd_quoteEach: '"كل مفتاح ينتمي إلى القصة التي شكّلته."',
  fd_portfolioOverview: 'نظرة عامة على ملف الأعمال',
  fd_allRoomsCompleted: 'جميع الغرف مكتملة',
  fd_reachOut: 'تواصل معي',
  fd_contactTitle: 'تواصل معي',
  fd_emailLabel: 'البريد الإلكتروني',
  fd_sendEmail: '✦  إرسال بريد إلكتروني  ✦',
  fd_journeyComplete: 'اكتملت الرحلة',
  fd_journeyCompleteSubtitle: 'لقد استكشفت كل غرفة ووضعت كل مفتاح.',
  fd_viewPortfolio: '✦ عرض ملف الأعمال كاملاً',
  fd_contactMe: '✉ تواصل معي',
  fd_returnGarden: 'العودة إلى الحديقة →',
  fd_cards: [
    {
      title: 'نظم المعلومات',
      content: "بكالوريوس نظم المعلومات في جامعة الملك عبدالعزيز (2021–2026). ربط التكنولوجيا بتجارب رقمية ذات مغزى من خلال التفكير التحليلي المنظّم.",
      tags: ['جامعة الملك عبدالعزيز', '2021–2026', 'تحليل الأنظمة'],
    },
    {
      title: 'الجانب التجاري والإداري',
      content: 'يجمع الجانب التجاري والإداري بين مفاهيم من التسويق والمحاسبة وإدارة المشاريع، بما يدعم فهم العلاقة بين التقنية واحتياجات الأعمال واتخاذ القرارات داخل بيئات العمل.',
      tags: ['التسويق', 'المحاسبة', 'إدارة المشاريع'],
    },
    {
      title: 'إنتاج الفيديو والمحتوى التعليمي',
      content: 'خبرة في تحليل المحتوى وتبسيطه، وإعداد النصوص التعليمية، وتصميم المحتوى المرئي، وإنتاج التعليق الصوتي بمساعدة الذكاء الاصطناعي، والمونتاج، وإخراج الفيديو بصورته النهائية.',
      tags: ['إنتاج الفيديو', 'كتابة النصوص', 'تبسيط المحتوى', 'المونتاج'],
    },
    {
      title: 'تقنيات الويب',
      content: 'معرفة بأساسيات تطوير الويب وبناء الواجهات باستخدام تقنيات الويب، مع اهتمام بتطوير تجارب رقمية واضحة وتفاعلية.',
      tags: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      title: 'الإنشاء بمساعدة الذكاء الاصطناعي',
      content: 'دمج سير عمل مدعومة بالذكاء الاصطناعي في العمليات الإبداعية والتقنية، مع الاستفادة من أدوات مثل ChatGPT وElevenLabs وAdobe Express لتعزيز جودة المخرجات وكفاءتها.',
      tags: ['ChatGPT', 'Gemini', 'Copilot', 'ElevenLabs', 'Adobe Express'],
    },
  ],

  // ── Portfolio Page ──
  pp_nav: ['نبذة', 'التعليم', 'اللغات', 'التدريب', 'إنتاج الفيديو', 'الأعمال', 'المساهمة التقنية', 'المشاريع الأكاديمية', 'المهارات', 'الأدوات', 'الشهادات والتكريم', 'التواصل'],
  pp_aboutLabel: 'نبذة',
  pp_aboutTitle: 'نبذة عني',
  pp_eduLabel: 'التعليم',
  pp_eduTitle: 'التعليم',
  pp_langLabel: 'اللغات',
  pp_langTitle: 'اللغات',
  pp_internLabel: 'التدريب',
  pp_internTitle: 'التدريب الصيفي',
  pp_vidLabel: 'الإنتاج المرئي',
  pp_vidTitle: 'إنتاج الفيديو',
  pp_featuredLabel: 'الأعمال',
  pp_featuredTitle: 'أعمال مختارة',
  pp_techLabel: 'تقني',
  pp_techTitle: 'المساهمة التقنية',
  pp_projLabel: 'أكاديمي',
  pp_projTitle: 'مشاريع جامعية',
  pp_skillsLabel: 'مهارات',
  pp_skillsTitle: 'المهارات',
  pp_toolsLabel: 'أدوات',
  pp_toolsTitle: 'الأدوات التي أستخدمها',
  pp_learnLabel: 'الشهادات',
  pp_learnTitle: 'الشهادات والتكريم',
  pp_contactLabel: 'التواصل',
  pp_contactTitle: 'تواصل معي',
  pp_expandHint: '⤢ انقر للتوسيع',
  pp_closeBtn: '✕ إغلاق',
  pp_viewRecognition: 'عرض التكريم ↗',
  pp_playVideo: 'تشغيل الفيديو',
  pp_stopVideo: 'إيقاف الفيديو',
  pp_viewLinkedIn: 'عرض ملفي على لينكد إن',
  pp_viewProfile: 'عرض الملف الشخصي',
  pp_backToGame: 'العودة إلى المغامرة →',
  pp_returnMenu: '⌂ القائمة الرئيسية',
  pp_returnHub: 'العودة إلى الحديقة →',
  pp_returnOpening: 'العودة إلى البداية →',
}

export const TRANSLATIONS: Record<Lang, Translations> = { en, ar }
