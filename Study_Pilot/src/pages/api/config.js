import { emailEnabled } from '../../server/email';
import { stripeEnabled } from '../../server/stripe';

// Publiski iestatījumi saskarnei: kuras funkcijas ir ieslēgtas šajā serverī
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).json({
    email: emailEnabled(),
    payments: stripeEnabled(),
    premiumPrice: process.env.PREMIUM_PRICE_TEXT || '',
    aiLimitFree: parseInt(process.env.AI_DAILY_LIMIT_FREE, 10) || 10,
    aiLimitPremium: parseInt(process.env.AI_DAILY_LIMIT_PREMIUM, 10) || 100,
  });
}
