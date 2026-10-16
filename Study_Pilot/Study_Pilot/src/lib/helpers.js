// Kopīgas palīgfunkcijas datiem un datumiem

export const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

const pad = (n) => String(n).padStart(2, '0');
export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());

// Dienu starpība no šodienas (negatīva = pagātnē)
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

export function relDay(dateStr) {
  const n = daysUntil(dateStr);
  if (n === null) return '';
  if (n === 0) return 'Šodien';
  if (n === 1) return 'Rīt';
  if (n === -1) return 'Vakar';
  if (n < 0) return `Pirms ${-n} ${-n === 1 ? 'dienas' : 'dienām'}`;
  return `Pēc ${n} ${dienas(n, true)}`;
}

// Latviešu skaitļa locījums: 1 diena, 2 dienas, 21 diena, 11 dienas
export function dienas(n, datīvs = false) {
  const one = n % 10 === 1 && n % 100 !== 11;
  if (datīvs) return one ? 'dienas' : 'dienām';
  return one ? 'diena' : 'dienas';
}

export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = ['janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.'];
  return `${d}. ${months[m - 1]} ${y}`;
}

export const gradeLabel = (p) => (p ? (p.level === 'kurss' ? `${p.grade}. kurss` : `${p.grade}. klase`) : '');

export const SUBJECT_COLORS = ['#e5192f', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#84cc16', '#f97316'];

// Ieteikumi (lietotājs pats izvēlas, ko pievienot)
export function suggestedSubjects(profile) {
  if (!profile) return [];
  if (profile.level === 'kurss') return ['Matemātika', 'Latviešu valoda', 'Angļu valoda', 'Programmēšana', 'Datubāzes', 'Fizika'];
  if (profile.grade <= 9) return ['Matemātika', 'Latviešu valoda', 'Angļu valoda', 'Vēsture', 'Dabaszinības', 'Krievu valoda'];
  return ['Matemātika', 'Latviešu valoda', 'Angļu valoda', 'Vēsture', 'Fizika', 'Ķīmija', 'Bioloģija', 'Programmēšana'];
}

export const subjectById = (data, id) => data?.subjects.find((s) => s.id === id) || null;
export const subjectName = (data, id) => subjectById(data, id)?.name || 'Bez priekšmeta';
export const subjectColor = (data, id) => subjectById(data, id)?.color || 'rgb(var(--s400))';

export const TASK_TYPES = ['Eksāmens', 'Pārbaudes darbs', 'Mājasdarbs', 'Konsultācija', 'Mācību sesija'];
export const isExamType = (type) => type === 'Eksāmens' || type === 'Pārbaudes darbs';

// Kopsavilkums progresam pa priekšmetiem
export function subjectStats(data) {
  if (!data) return [];
  return data.subjects.map((s) => {
    const tasks = data.tasks.filter((t) => t.subjectId === s.id);
    const ex = data.exercises.filter((x) => x.subjectId === s.id);
    const results = data.quizResults.filter((r) => r.subjectId === s.id);
    const total = tasks.length + ex.length;
    const completed = tasks.filter((t) => t.status === 'completed').length + ex.filter((x) => x.completed).length;
    const qTotal = results.reduce((a, r) => a + r.total, 0);
    const qScore = results.reduce((a, r) => a + r.score, 0);
    return {
      ...s,
      total,
      completed,
      progress: total ? Math.round((completed / total) * 100) : 0,
      quizCount: results.length,
      accuracy: qTotal ? Math.round((qScore / qTotal) * 100) : null,
    };
  });
}

export function overallStats(data) {
  if (!data) return { completed: 0, total: 0, progress: 0, accuracy: null, activeThisWeek: 0 };
  const total = data.tasks.length + data.exercises.length;
  const completed = data.tasks.filter((t) => t.status === 'completed').length + data.exercises.filter((x) => x.completed).length;
  const qTotal = data.quizResults.reduce((a, r) => a + r.total, 0);
  const qScore = data.quizResults.reduce((a, r) => a + r.score, 0);
  const weekAgo = toDateStr(new Date(Date.now() - 6 * 86400000));
  return {
    completed,
    total,
    progress: total ? Math.round((completed / total) * 100) : 0,
    accuracy: qTotal ? Math.round((qScore / qTotal) * 100) : null,
    activeThisWeek: data.activity.filter((d) => d >= weekAgo).length,
  };
}

// Nākamie nepabeigtie termiņi, sakārtoti pēc datuma
export function upcoming(data, { examsOnly = false, limit = 99 } = {}) {
  if (!data) return [];
  return data.tasks
    .filter((t) => t.status !== 'completed' && daysUntil(t.dueDate) >= 0 && (!examsOnly || isExamType(t.type)))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}
