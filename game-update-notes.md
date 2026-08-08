إي صح، إذا الفراشات بس عدّاد بدون مكافأة فالميكانيك ناقص. الأفضل نخليها **مهمّة جانبية صغيرة لها Reward واضح**، وبنفس الوقت نصلح موضوع المفتاح الأسود نهائيًا.

هذا برومبت تكميلي دقيق لـ Figma Make:

---

**Use this as a refinement prompt only. Do not redesign the game. Keep all approved layouts, room mechanics, colors, navigation, and bilingual behavior. Fix only the issues below.**

## 1) FIX THE KEY ICON IN “HOW TO PLAY”
The key icon shown next to **Collect Keys** in the “How to Play” panel is still black.

Replace it with the same approved **golden key** used everywhere else.

Requirements:
- warm elegant gold
- clearly visible on dark purple
- subtle magical gold glow
- no black key icon anywhere
- no gray key icon anywhere

Check ALL key appearances across the entire game:
- How to Play
- inventory
- map
- room completion
- room reward
- final gate
- progress HUD
- tooltips
- modals
- any decorative key icons

All of them must use the same consistent golden key asset/style.

---

## 2) UPDATE THE “COLLECT KEYS” TEXT
The current instruction still says:

“collect its lavender key”

This is outdated.

Change it to:

### English
**Collect Keys**  
Explore each glowing room, complete its challenge, then click the golden key to collect it.

### Arabic
**جمع المفاتيح**  
استكشف كل غرفة مضيئة وأكمل تحديها ثم اضغط على المفتاح الذهبي لجمعه.

Important:
Keys are NOT lavender anymore.

---

## 3) BUTTERFLY COLLECTION MUST HAVE A PURPOSE
Keep the butterfly collection mechanic, but make collecting all **20 butterflies** unlock a real reward.

Butterflies are a **side quest**, not required to finish the five main rooms.

Show progress as:

**Butterflies 0 / 20**

Arabic:

**الفراشات 0 / 20**

Each butterfly:
- can be clicked
- disappears smoothly when collected
- increases the counter by 1
- is replaced by another butterfly somewhere else in the garden
- uses a soft flutter / fade transition
- never appears over important UI

---

# 4) REWARD AT 20 / 20 — SECRET LAVENDER BLOOM
When the player collects all 20 butterflies, trigger a special hidden reward.

Call it:

### English
**Secret Lavender Bloom**

### Arabic
**زهرة اللافندر السرية**

This should NOT give another key.

The five golden keys must remain tied only to the five main rooms.

Instead, collecting all 20 butterflies unlocks a beautiful **bonus discovery** in the garden.

---

## 5) HOW THE REWARD APPEARS
When the counter reaches 20 / 20:

1. briefly glow the butterfly counter
2. butterflies gather in a soft spiral animation
3. a previously closed lavender flower in the garden begins to glow
4. the flower blooms smoothly
5. show a small message:

### English
**A hidden bloom has awakened.**

### Arabic
**تفتحت زهرة كانت تنتظر أن تُكتشف**

Then allow the player to click the flower.

Do not open the reward automatically.

The player must discover and click it.

---

## 6) WHAT THE SECRET FLOWER REVEALS
When the player clicks the Secret Lavender Bloom, open a small polished bonus card.

This bonus should reveal a light personal/professional detail from the portfolio without affecting main progression.

Use:

### English title
**A Little More About Me**

### Arabic title
**جانب إضافي عني**

### English text
**Beyond tools and projects, curiosity, creativity, and attention to detail shape the way I approach learning and digital work.**

### Arabic text
**إلى جانب الأدوات والمشاريع يشكل الفضول والإبداع والاهتمام بالتفاصيل جزءًا من أسلوبي في التعلم والعمل الرقمي**

This is a small optional discovery, not a main portfolio section.

---

## 7) OPTIONAL VISUAL REWARD
After unlocking the Secret Lavender Bloom:

- add a tiny permanent lavender flower icon beside the butterfly counter
- or show a small “20/20” completed glow

Do not add another large badge system.

Keep it subtle.

---

## 8) UPDATE INVENTORY
In the inventory panel:

Keep:

**Golden Keys**
0 / 5

and

**Butterflies**
0 / 20

When butterflies reach 20 / 20:
- mark the butterfly card as completed
- add a tiny lavender flower symbol
- use a gentle completed glow

Do not put the Secret Lavender Bloom inside the main key count.

---

## 9) UPDATE HOW TO PLAY
Remove Pocket Watch completely if it still exists.

The “How to Play” panel should now contain only:

### English

**Collect Keys**  
Explore each glowing room, complete its challenge, then click the golden key to collect it.

**Catch Butterflies**  
Collect 20 butterflies hidden around the garden to awaken a secret lavender bloom.

**Ask the Bunny**  
The magical bunny offers hints when clicked.

**The Final Gate**  
Collect all 5 golden keys to unlock the Final Revelation.

### Arabic

**جمع المفاتيح**  
استكشف كل غرفة مضيئة وأكمل تحديها ثم اضغط على المفتاح الذهبي لجمعه.

**جمع الفراشات**  
اجمع 20 فراشة منتشرة في الحديقة لتوقظ زهرة لافندر سرية.

**اسأل الأرنب**  
يقدم الأرنب السحري تلميحات عند الضغط عليه.

**الباب الأخير**  
اجمع المفاتيح الذهبية الخمسة لفتح الكشف الأخير.

---

## 10) IMPORTANT GAME LOGIC
The butterfly side quest must NOT:
- block room progression
- block the Final Gate
- give a sixth key
- reset when entering another room

Butterfly progress must persist across navigation.

If the player leaves the garden at 12 / 20 and comes back, it must still show 12 / 20.

---

## FINAL CHECK
Verify:

- How to Play key icon is gold
- there are no black key icons anywhere
- “lavender key” wording is removed
- all five main keys are golden
- all room keys require manual click collection
- butterflies can actually be clicked and collected
- butterfly count persists
- new butterflies respawn smoothly
- 20 / 20 unlocks the Secret Lavender Bloom
- the Secret Lavender Bloom is optional
- it does not affect the five-key progression
- Pocket Watch is completely removed
- English and Arabic versions both work correctly

---

وأنا أشوف **زهرة اللافندر السرية** مناسبة جدًا؛ تعطي سبب فعلي للفراشات، لكن ما تخرب نظام المفاتيح ولا تجبر الشخص يجمع 20 عشان يكمل اللعبة.