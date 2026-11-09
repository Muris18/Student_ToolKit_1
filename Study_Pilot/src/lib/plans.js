// Bezmaksas un Premium plāna atšķirības (kopīgi klientam un serverim). Mainot šeit, mainās visur.
export const FREE_LIMITS = {
  quizzes: 3, // savi testi
  exercises: 15, // savi eksāmenu uzdevumi
};

export const isPremium = (user) => user?.plan === 'premium';

// Vai lietotājs drīkst pievienot vēl vienu ierakstu (key: 'quizzes' | 'exercises')
export function canAdd(user, data, key) {
  if (isPremium(user)) return true;
  return (data?.[key]?.length || 0) < FREE_LIMITS[key];
}

// cfg = /api/config (AI limiti nāk no servera .env)
export const premiumFeatures = (cfg = {}) => [
  `${cfg.aiLimitPremium || 100} AI skolotāja jautājumi dienā (bezmaksas — ${cfg.aiLimitFree || 10})`,
  'Vairāk AI testu pēc tavām kļūdām (katrs tests = 1 AI jautājums)',
  'Neierobežoti savi eksāmenu uzdevumi',
  'Viss, kas ir bezmaksas plānā',
  'Atbalsti Study Pilot attīstību',
];
