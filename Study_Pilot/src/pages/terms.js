import LegalPage from '../components/LegalPage';
import { loadLegal } from '../lib/legalContent';

// Lietošanas noteikumi. Teksts: content/terms.md. Pēc teksta maiņas vajag jaunu build.
export async function getStaticProps() {
  return { props: loadLegal('terms') };
}

export default LegalPage;
