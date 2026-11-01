// Tukša datu struktūra klientā (sakrīt ar src/server/db.js emptyData)
export const emptyClientData = () => ({
  subjects: [],
  tasks: [],
  exercises: [],
  quizzes: [],
  quizResults: [],
  chat: [],
  activity: [],
  examAttempts: [], // valsts eksāmenu uzdevumi: { taskId, correct, at }
});
