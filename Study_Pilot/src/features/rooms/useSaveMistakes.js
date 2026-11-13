import { useEffect } from 'react';
import { useApp } from '../../lib/AppContext';
import { uid } from '../../lib/helpers';

const KEY = 'sp-room-saved';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } };
const write = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-60))); } catch (e) {} };

// Kad dalībnieks atbildējis uz visiem uzdevumiem vai kārta pārgājusi pārskatā, vienreiz (kods:kārta) ieraksta
// rezultātu quizResults, lai kļūdas nonāktu Testa režīmā. VIAA uzdevumus (tracked) jau saglabā serveris kā exam_attempts.
export function useSaveMistakes(state) {
  const { update } = useApp();
  useEffect(() => {
    if (!state || !state.questions.length) return;
    const qs = state.questions;
    const answered = qs.filter((q) => q.mine);
    const review = state.room.state === 'review';
    if (!answered.length || (!review && answered.length < qs.length)) return;
    const key = `${state.room.code}:${state.room.round}`;
    const saved = read();
    if (saved.includes(key)) return;
    write([...saved, key]); // atzīmē pirms update, lai atkārtots efekts neieraksta divreiz
    const wrong = answered.filter((q) => !q.mine.correct);
    const wrongItems = wrong
      .filter((q) => !q.tracked && q.result)
      .map((q) => ({ question: q.question.slice(0, 600), options: q.options, correctIndex: q.result.correctIndex, topic: q.topic || '' }));
    update((d) => ({
      ...d,
      quizResults: [...(d.quizResults || []), {
        id: uid(), quizId: `room-${state.room.code}-${state.room.round}`, subjectId: '', score: answered.length - wrong.length, total: answered.length,
        wrong: wrong.map((q) => q.id), date: new Date().toISOString(),
        auto: true, subject: state.room.set.subject || '', grade: state.room.set.grade || null, wrongItems,
      }],
    }));
  }, [state, update]);
}
