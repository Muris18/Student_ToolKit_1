import LegalPage from '../components/LegalPage';
import { loadLegal } from '../lib/legalContent';

// Privātuma politika. Teksts: content/privacy.md (to pašu failu rāda arī GitHub).
// Lapa tiek ģenerēta build laikā; pēc teksta maiņas vajag jaunu build (serverī: docker compose up -d --build).
export async function getStaticProps() {
  return { props: loadLegal('privacy') };
}

export default LegalPage;
