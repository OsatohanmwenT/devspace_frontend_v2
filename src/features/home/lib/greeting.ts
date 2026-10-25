export function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  return hour < 18 ? "Good afternoon" : "Good evening";
}
