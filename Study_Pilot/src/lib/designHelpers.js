export function seasonFor(date) {
  const month = date.getMonth();
  if (month === 9) return { name: 'Helovīns', symbols: ['🎃', '🎃', '🦇', '🦇'], message: 'Mazliet maģijas. Daudz progresa.', note: 'Vienīgais biedējošais? Atstāt visu uz pēdējo vakaru.' };
  if (month === 11 || month < 2) return { name: 'Ziema', symbols: ['❄️', '✦', '✧', '❄️'], message: 'Silta tēja. Skaidras domas.', note: 'Mazs solis šodien — mierīgāks rītdienas rīts.' };
  if (month >= 2 && month <= 4) return { name: 'Pavasaris', symbols: ['🌱', '🌿', '🌼', '🍃'], message: 'Jaunas idejas. Jauns sākums.', note: 'Dod savām zināšanām vietu augt.' };
  if (month >= 5 && month <= 7) return { name: 'Vasara', symbols: ['☀️', '🌼', '✧', '🌿'], message: 'Vairāk gaismas. Vieta idejām.', note: 'Mazliet mācību, mazliet atelpas. Atrodi savu ritmu.' };
  return { name: 'Rudens', symbols: ['🍁', '🍂', '✧', '🍃'], message: 'Jauns ritms. Tavi mērķi.', note: 'Labs sākums ir viens paveikts uzdevums.' };
}
export function weekDays(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}
export function secondsLeft(deadline, now = Date.now()) { return Math.max(0, Math.ceil((deadline - now) / 1000)); }
