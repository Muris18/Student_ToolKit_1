import { supabase } from './supabaseClient';

export const examService = {
  // Iegūt eksāmenu uzdevumus pēc klases, priekšmeta un gada
  async getTasks(grade, subject, year) {
    const { data, error } = await supabase
      .from('exam_tasks')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject)
      .eq('year', year);

    if (error) {
      console.error('Kļūda, ielādējot uzdevumus:', error.message);
      return [];
    }
    return data;
  },

  // Saglabāt skolēna atrisināto uzdevumu vai testa rezultātu
  async saveUserProgress(userId, taskId, isCorrect, score) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert([
        { user_id: userId, task_id: taskId, is_correct: isCorrect, score, updated_at: new Date() }
      ]);

    if (error) {
      console.error('Kļūda, saglabājot progresu:', error.message);
      return null;
    }
    return data;
  }
};