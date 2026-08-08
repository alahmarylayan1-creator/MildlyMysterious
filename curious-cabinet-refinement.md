انسخي هذا البرومبت كامل كما هو:

Use this as the next refinement prompt.

Do not redesign the game.
Keep the current dreamy lavender visual style, current room structure, current gameplay logic, and current overall layout.
Only refine **The Curious Cabinet** room and apply the requested UI polish.

## ROOM FOCUS
Refine **The Curious Cabinet / خزانة الفضول** only.

---

## 1) ARABIC TEXT FIX
When the language is Arabic:
- make **all room interface text Arabic**
- keep only the actual tool names in English if needed, such as:
  - PowerPoint
  - GitHub
  - Canva
  - ChatGPT
  - ElevenLabs
  - Visual Studio

Everything else in this room must be Arabic, including:
- instructions
- labels
- progress text
- success text
- completion text
- button text
- helper text
- drawer labels
- status text

Do not leave random English phrases such as:
- tools placed correctly
- drag each tool to its drawer
- internship toolkit
- enchanted drawers
or any similar English UI text in Arabic mode.

Translate them naturally into Arabic, not literal awkward translation.

Suggested Arabic wording:
- Internship Toolkit → أدوات التدريب
- Drag each tool to its drawer → اسحب كل أداة إلى درجها الصحيح
- Enchanted Drawers → الأدراج المسحورة
- tools placed correctly 0/6 → الأدوات الموضوعة بشكل صحيح 0/6
- Skip Puzzle → تخطي اللعبة
- Key Collected → تم جمع المفتاح
- Collect Golden Key → اجمع المفتاح الذهبي
- Back to Garden → العودة إلى الحديقة

When the language is English, keep the English version normally.

---

## 2) CABINET PROGRESS LIGHTS
Use the cabinet itself as part of the progress feedback.

Add a clear visual sequence so that:
- each time the player places one tool correctly,
  one small cabinet indicator / button / light on the cabinet turns on
- after the second correct placement, the second one lights up
- continue until all 6 are lit
- the lights should glow softly in gold / warm light
- make the progression visually satisfying and obvious

The cabinet should feel like it is “waking up” step by step.

Do not wait until the very end only.
The player should see progress after every correct match.

---

## 3) THE SAME CABINET SHOULD OPEN
Do not show a different generic cabinet for the ending state.

The **same cabinet that exists in the room art** should be the one that opens at completion.

Requirements:
- preserve the same cabinet identity and look
- when the puzzle is solved, the cabinet in the room opens
- the opening animation should feel smooth and magical
- the inside reveal should appear within that same cabinet
- it should feel like the actual room object opened, not a replacement object

---

## 4) REMOVE THE WORD “رفيق”
Remove the word **رفيق** from the room completion state.

Do not show “الرفيق” as the final label after solving the room.

Replace it with cleaner and more relevant room completion wording.

Use something more fitting, such as:
- اكتملت الغرفة
- تم كشف الخزانة
- اكتمل الاكتشاف

Choose the option that best fits the existing tone, but do not use “رفيق”.

---

## 5) FIX DAWN PORTRAIT AT THE TOP
Refine the small Dawn portrait shown in the top HUD / header.

Current problem:
the portrait looks blurry / unclear / too vague.

Fix it so that:
- Dawn’s face is clearly visible
- her upper torso / chest area is visible
- the portrait matches the original Dawn design from the guide-selection screen
- it should not look blurred or muddy
- it should feel like a clean cropped portrait version of the real Dawn card art
- keep the same overall HUD placement and style

Do the same quality rule for guide portraits wherever they appear in the game.

---

## 6) CENTER AND BALANCE THE COMPLETION LAYOUT
In the completion state of this room:
- center-align the completion card and its text more clearly
- center the golden key visually
- center the “Collect Golden Key / اجمع المفتاح الذهبي” button
- make the spacing balanced and polished
- avoid awkward right-shifted alignment
- the entire completion area should feel symmetrical and intentional

Make the completion message, key, and action button look visually balanced.

---

## 7) AFTER COLLECTING THE KEY
When the player clicks to collect the golden key:
- the golden key should disappear from the room completion screen
- the key must count correctly in progress
- show a clear action button:
  - Arabic: العودة إلى الحديقة
  - English: Back to Garden
- clicking that button should take the player back to the garden hub to continue the game
- do not leave the user stuck in the room after key collection

The room should clearly communicate that:
- the puzzle is completed
- the key has been collected
- the next step is returning to the garden

---

## 8) GLOW ON ALL BUTTONS IN THE ENTIRE GAME
Apply a consistent smooth glow interaction to **all buttons across the entire game**, not just this room.

This includes:
- main menu
- reset
- hint
- map
- bag
- mute / sound
- language button
- back buttons
- collect key buttons
- return to garden buttons
- confirmation buttons
- skip puzzle
- room action buttons
- guide selection buttons
- any modal buttons
- any hoverable action chip or clickable control

Glow behavior:
- keep it smooth and elegant
- use the same dreamy lavender / pink / soft gold glow style already used in the project
- glow should appear on hover
- stronger glow on primary action buttons
- avoid harsh neon
- use soft, premium, magical glow
- keep transitions smooth

Also make sure buttons feel interactive with:
- slight lift on hover
- subtle brightness increase
- smooth transition timing

---

## 9) KEEP THE ROOM FUNCTIONAL
Do not break the existing drag-and-drop gameplay.

Keep the gameplay structure:
- player drags each tool to the correct drawer
- correct placements progress the cabinet
- final state opens the same cabinet
- player can collect the golden key
- player can return to the garden

Make sure the room remains fully playable.

---

## 10) FINAL QA CHECK
Verify all of the following:
- Arabic mode shows Arabic everywhere except tool names
- no leftover English UI text remains in Arabic mode
- each correct match lights one cabinet indicator
- the same cabinet opens at the end
- the word “رفيق” is removed
- Dawn’s portrait is clear and recognizable
- completion layout is centered and balanced
- the collect-key action works
- after key collection, the key disappears from the screen
- a “return to garden” button appears and works
- all buttons across the entire game now have a smooth glow
- no UI becomes misaligned
- the room still works correctly

If needed, prioritize correctness, polish, consistency, and bilingual quality without redesigning the game.