const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Nosūtīt jautājumu AI skolotājam (RAG sistēmai)
  async askAiTutor(question, subject, grade) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, subject, grade }),
      });

      if (!response.ok) {
        throw new Error('Tīkla kļūda saziņā ar AI serveri');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI četa kļūda:', error);
      return { text: 'Atvainojiet, pašlaik nevaru savienoties ar AI serveri. Lūdzu, mēģiniet vēlāk!' };
    }
  }
};