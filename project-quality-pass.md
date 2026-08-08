Perform a complete quality, interaction, responsiveness, and audio pass on the entire existing project.

Do not redesign the established visual identity.

Do not remove approved content.

Do not replace Dawn or Dusk.

Do not change the room mechanics.

Focus on consistency, functionality, polish, and bug fixing.

────────────────────────────
GLOBAL AUDIO
────────────────────────────

Add a consistent calm ethereal music theme throughout the website.

Use subtle environmental ambience such as:

- distant waterfall
- gentle wind
- soft garden or bird ambience
- magical shimmer

Use the same core musical identity across all game rooms.

Add slight room-specific layers:

Portrait Room:
- page movement
- delicate glass chime

Curious Cabinet:
- wood drawer
- glass sparkle

Lavender Studio:
- projector
- film reel
- soft creative studio ambience

Workshop:
- subtle technology and mechanical sounds

Learning Gallery:
- card flip
- gentle gallery ambience

Final Door:
- wind
- magical chimes
- key and door sounds

Add consistent UI sounds:

- button click
- correct answer
- incorrect answer
- drag and drop
- room completion
- key collection
- door unlock

IMPORTANT AUDIO BEHAVIOR

- Sound must begin only after the visitor’s first interaction.
- Do not autoplay audio before interaction.
- The Mute button must control all music, ambience, and sound effects.
- Preserve mute state while navigating.
- Avoid loud, repetitive, or distracting sounds.
- Stop or reduce room-specific audio after leaving that room.
- Video audio must remain controllable through the video player.

────────────────────────────
VISUAL FEEDBACK
────────────────────────────

Correct interactions:

- soft glow
- subtle sparkle
- brief polished success animation

Incorrect interactions:

- gentle visual shake
- subtle warning
- no harsh red flashing
- no penalty unless explicitly designed

Completion states:

- centered content
- large visible key
- “Room Complete”
- clear Back to Map button

────────────────────────────
RESPONSIVENESS
────────────────────────────

Optimize for:

1. Standard laptop
2. Smaller laptop
3. Tablet
4. Mobile

Laptop-first layout must remain the primary experience.

On mobile:

- stack side-by-side cards vertically
- maintain readable font sizes
- prevent clipped buttons
- make draggable elements large enough to interact with
- allow scrolling when needed
- keep navigation accessible
- avoid covering content with fixed controls

Do not shrink desktop content until it becomes unreadable.

────────────────────────────
ALIGNMENT AND SPACING
────────────────────────────

Across all screens:

- center text with the element directly below it
- use consistent content widths
- keep equal cards equal in size
- prevent decorative elements from covering text
- prevent success messages from appearing off-center
- ensure keys are never hidden
- ensure all buttons have sufficient spacing
- ensure dialogue boxes fit their text
- prevent horizontal scrolling

────────────────────────────
NAVIGATION TEST
────────────────────────────

Test every route and button:

- Begin Adventure
- View Portfolio Directly
- guide selection
- Begin the Journey
- every map room
- every Back to Map button
- Help buttons
- Continue buttons
- Final Door modal
- View Full Portfolio
- Contact Me
- Enter Game Mode
- portfolio navigation links

Use internal routing only.

Never rely on browser history.

Fix any button that does not navigate.

────────────────────────────
GAME STATE TEST
────────────────────────────

Verify that:

- the selected guide remains selected
- room progress is preserved while navigating
- a completed room remains completed
- keys are counted once only
- duplicate clicks do not create duplicate keys
- map progress updates correctly
- the Final Door unlocks only at 5 / 5
- refreshing or route changes do not create impossible states during the current session

────────────────────────────
ROOM INTERACTION TEST
────────────────────────────

Portrait Room:
- all three objects clickable
- correct found counter
- Continue required before completion
- cards readable
- key centered

Curious Cabinet:
- all six tools draggable
- every correct match opens a drawer
- cabinet becomes clickable after all matches
- cabinet doors open
- key appears inside the cabinet

Lavender Studio:
- all nine puzzle pieces draggable
- no pieces become stuck
- video cards reveal correctly
- key appears immediately
- both uploaded videos play
- selected card glows
- shared player switches videos

Workshop:
- all three cases function
- correct and incorrect feedback works
- Run Final Review is required
- final key is visible

Learning Gallery:
- matching game remains playable
- flip and match states work
- final key appears

Final Door:
- early click displays progress modal
- all five keys drag correctly
- door opens after all slots are filled

────────────────────────────
PORTFOLIO TEST
────────────────────────────

Verify:

- every section is visible in one continuous page
- no game UI appears in the direct portfolio
- Explore My Work scrolls correctly
- Contact Me scrolls correctly
- email opens a new message
- phone opens the call action
- LinkedIn opens the correct clean profile URL
- both videos work in the embedded player
- the page is professional and readable on mobile and laptop

Fix all broken interactions, overlaps, missing content, console errors, invalid states, and accessibility issues without redesigning approved content.