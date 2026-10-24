import { db, allUsers } from '../../../server/db';
import { allow, requireAdmin } from '../../../server/http';

// Pārskats par visiem lietotājiem — TIKAI administratoriem
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  if (!(await requireAdmin(req, res))) return;
  const today = new Date().toISOString().slice(0, 10);
  const users = (await allUsers()).map((u) => {
    const d = u.data;
    return {
      id: u.id,
      name: `${u.profile.firstName} ${u.profile.lastName}`.trim(),
      level: u.profile.level,
      grade: u.profile.grade,
      school: u.profile.school,
      subjects: d.subjects.length,
      done: d.tasks.filter((t) => t.status === 'completed').length + d.exercises.filter((x) => x.completed).length,
      quizzes: d.quizResults.length,
      chat: d.chat.length,
      lastActive: u.lastActive,
      createdAt: u.createdAt,
    };
  });
  res.status(200).json({
    startedAt: db.startedAt,
    stats: {
      users: users.length,
      activeToday: users.filter((u) => u.lastActive.slice(0, 10) === today).length,
      quizzes: users.reduce((a, u) => a + u.quizzes, 0),
      chat: users.reduce((a, u) => a + u.chat, 0),
    },
    users,
  });
}
