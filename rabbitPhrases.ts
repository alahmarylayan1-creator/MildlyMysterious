export const RABBIT_PHRASES = [
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
]

export function randomPhrase(avoid?: string): string {
  const pool = avoid ? RABBIT_PHRASES.filter(p => p !== avoid) : RABBIT_PHRASES
  return pool[Math.floor(Math.random() * pool.length)]
}
