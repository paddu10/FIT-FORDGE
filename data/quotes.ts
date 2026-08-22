export const MOTIVATIONAL_QUOTES = [
  { quote: "Discipline beats motivation.", emphasis: "Discipline" },
  { quote: "Your future self is built by what you do today.", emphasis: "today" },
  { quote: "Small progress is still progress.", emphasis: "progress" },
  { quote: "Don't wait for motivation. Build the habit.", emphasis: "habit" },
  { quote: "Consistency creates results.", emphasis: "Consistency" },
  { quote: "Train your body. Strengthen your mind.", emphasis: "mind" },
  { quote: "One more rep. One step closer.", emphasis: "closer" },
  { quote: "Earn your strength.", emphasis: "strength" },
  { quote: "Progress, not perfection.", emphasis: "Progress" },
  { quote: "Show up. Do the work.", emphasis: "work" }
];

export function getDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return MOTIVATIONAL_QUOTES[dayIndex % MOTIVATIONAL_QUOTES.length];
}
