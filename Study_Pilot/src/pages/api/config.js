import { emailEnabled } from '../../server/email';
import { stripeEnabled } from '../../server/stripe';
import { tokenLimits, deepConfig } from '../../server/ai';

// Publiski iestatījumi saskarnei: kuras funkcijas ir ieslēgtas šajā serverī
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).json({
    email: emailEnabled(),
    payments: stripeEnabled(),
    premiumPrice: process.env.PREMIUM_PRICE_TEXT || '',
    // Dienas AI limits tokenos (skat. src/server/ai.js)
    aiTokensFree: tokenLimits().free,
    aiTokensPremium: tokenLimits().premium,
    // Dziļās domāšanas režīms (Premium): vai ieslēgts un cik parastajiem jautājumiem tas līdzinās limitā
    aiDeep: { enabled: deepConfig().enabled, factor: deepConfig().factor },
  });
}
