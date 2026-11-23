// Bezmaksas un Premium plāna atšķirības (kopīgi klientam un serverim). Mainot šeit, mainās visur.
export const FREE_LIMITS = {
  quizzes: 3, // savi testi (savu uzdevumu pievienošana eksāmenu sadaļā ir noņemta; esošie ieraksti lietotāju datos paliek)
};

export const isPremium = (user) => user?.plan === 'premium';

// Vai lietotājs drīkst pievienot vēl vienu ierakstu (key: 'quizzes')
export function canAdd(user, data, key) {
  if (isPremium(user)) return true;
  return (data?.[key]?.length || 0) < FREE_LIMITS[key];
}

// AI limits tokenos; cilvēkam saprotams apraksts: "200 tūkst. AI tokenu dienā (≈ 80 jautājumi)". 1 AI skolotāja jautājums ≈ 2500 tokenu.
export const TOKENS_PER_QUESTION = 2500;
export const fmtTokens = (n) => (n >= 1000000 ? `${+(n / 1000000).toFixed(1)} milj.` : `${Math.round(n / 1000)} tūkst.`);
export const aiLimitText = (tokens) => `${fmtTokens(tokens || 0)} AI tokenu dienā (≈ ${Math.round((tokens || 0) / TOKENS_PER_QUESTION)} jautājumi)`;

// cfg = /api/config (AI limiti nāk no servera .env)
export const premiumFeatures = (cfg = {}) => [
  `${aiLimitText(cfg.aiTokensPremium || 1000000)} (bezmaksas — ${fmtTokens(cfg.aiTokensFree || 200000)})`,
  'Vairāk AI testu pēc tavām kļūdām',
  ...(cfg.aiDeep?.enabled ? ['Dziļā domāšana AI skolotājā grūtākiem uzdevumiem'] : []),
  'Viss, kas ir bezmaksas plānā',
  'Atbalsti Study Pilot attīstību',
];
