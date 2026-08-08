Fix the existing “View Portfolio Directly” page in one focused pass.

Do NOT rebuild the page from scratch.
Do NOT change the written content, section order, project information, video URLs, or navigation structure.

The current page has four major problems that must be fixed now:

1. the logo still looks like a square pasted image
2. hover glow is missing or applied to text instead of the containers
3. the email is not a real clickable link
4. the page colors feel too flat and too uniformly purple

Solve all four problems in this pass.

────────────────────────────
1. FIX THE LOGO PROPERLY
────────────────────────────

CURRENT PROBLEM:

The LM logo still visibly looks like a square image placed on top of the page.

THIS MUST CHANGE.

Do not simply add another circle around the square image.

Do not keep the square background visible.

Use the existing LM artwork, but visually isolate the artwork from its square image background.

The final logo presentation must NOT show a square boundary.

For every logo instance:

- crop or mask away the square image background
- keep only the actual LM artwork visible
- place the artwork inside a custom circular or organic emblem
- use a transparent background around the artwork
- add a dark translucent purple glass layer behind it
- add a thin muted-gold outer ring
- add a subtle lavender inner ring
- add a soft radial glow behind the emblem
- add tiny elegant decorative details around the emblem, such as small stars, dots, or fine ornamental lines
- keep the artwork itself recognizable and unchanged
- make it feel like part of the interface, not like an uploaded image

HERO LOGO:

Make the hero logo a refined decorative emblem.

It should feel integrated into the hero section.

HEADER LOGO:

Use a smaller simplified version of the same emblem beside the name.

FOOTER LOGO:

Use the same compact emblem treatment.

IMPORTANT:

There must be NO visible square or rectangular background around the logo anywhere.

────────────────────────────
2. MAKE THE HOVER GLOW ACTUALLY VISIBLE
────────────────────────────

CURRENT PROBLEM:

The hover effect is either missing, too weak, or incorrectly applied to the text.

REMOVE text glow.

The glow must happen on the CONTAINER.

When the user hovers over any interactive element, the element itself must visibly light up.

Apply this to:

- all buttons
- all cards
- project cards
- Play Video buttons
- education cards
- language cards
- internship panels
- technical contribution panels
- academic project cards
- skill badges
- tool badges
- certificate cards
- recognition cards
- contact cards
- navigation buttons
- Game Mode button
- clickable logo
- any other clickable container

HOVER EFFECT:

On hover, the CONTAINER must:

- visibly brighten from inside
- show a lavender light inside the background
- brighten its border
- add a clear soft outer lavender glow
- gently lift upward by 3–5 px
- scale very slightly, around 1.015–1.025
- use a smooth 180–250 ms transition
- show cursor: pointer when clickable

The effect must be clearly noticeable.

Do NOT make it neon.

Do NOT apply glow directly to text.

Text should remain crisp.

For small badges:
- use a smaller glow
- slightly brighten the badge background and border

For navigation text:
- do not glow the words
- instead use a small illuminated background, underline, or pill effect on hover

For Play Video buttons:
- use the strongest hover glow among the buttons
- illuminate the button background from inside
- keep the text clean and readable

────────────────────────────
3. FIX THE EMAIL AS A REAL LINK
────────────────────────────

CURRENT PROBLEM:

The email currently appears only as visible text and does not open a new email draft.

Fix this using a real HTML anchor.

Use exactly:

href="mailto:alahmarylayan1@gmail.com"

Make BOTH of these clickable:

- the full Email contact card
- the visible email address

Do not use internal routing.

Do not use a custom navigation callback.

Do not prevent the default link behavior.

Use a real anchor element.

The interaction must open the visitor’s default email application or browser email handler and start a new email addressed to:

alahmarylayan1@gmail.com

Use:

mailto:alahmarylayan1@gmail.com

Also:

- use cursor: pointer
- add an accessible label:
  “Send email to Layan Alahmari”

If the environment blocks mailto during preview, preserve the correct real mailto link in the final implementation.

────────────────────────────
4. IMPROVE THE COLOR SYSTEM
────────────────────────────

CURRENT PROBLEM:

The page feels too flat and too uniformly purple.

Keep the same overall theme, but create more visual depth and variation.

Use a controlled palette based on:

- deep plum
- midnight purple
- soft lavender
- muted violet
- warm muted gold
- ivory / soft white
- very subtle dusty rose only if needed as a secondary accent

Do NOT use:

- bright red
- bright green
- cyan
- bright blue
- orange

Keep everything harmonious with the current theme.

USE COLORS WITH PURPOSE:

BACKGROUND:
- use deep plum and midnight purple
- allow very subtle gradients between sections

CARDS:
- use slightly different dark-purple tones
- some cards can have a faint lavender glass tint
- use thin lavender or muted-gold borders

HEADINGS:
- mostly soft white or pale lavender

SMALL LABELS:
- muted gold

BUTTONS:
- deep purple or lavender
- gold used as a refined accent, not the entire button

PROJECT CARDS:
- BOTH projects must use the same palette
- remove any red/green distinction
- use purple, lavender, gold, and white only
- differentiate them using iconography, layout details, or subtle tonal differences, not unrelated colors

CONTACT CARDS:
- keep the same palette
- allow one subtle gold accent line or icon detail per card

SECTIONS:
- create subtle tonal variation between sections so the page does not look like one flat purple block

Use depth through:
- gradients
- glassmorphism
- subtle border contrast
- soft inner highlights
- muted gold accent lines

Do not make the page colorful for the sake of color.

The final result should feel:

- premium
- elegant
- mysterious
- professional
- cohesive
- visually rich
- not flat
- not neon
- not monochrome

────────────────────────────
FINAL CHECK
────────────────────────────

Before finishing, verify:

- no logo instance shows a square image background
- hover glow is clearly visible on the CONTAINER of interactive elements
- text itself does not glow
- both video project cards use the same purple/gold/white design family
- the email card is a real mailto link
- the email address itself is clickable
- the page uses purple, gold, white, and subtle tonal variation instead of one flat purple color
- no unrelated red or green accents remain
- all existing content stays unchanged

Do not change anything outside “View Portfolio Directly”.