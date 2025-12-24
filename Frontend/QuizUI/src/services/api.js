import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/quiz/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export const generateQuiz = async (topic, settings = {}) => {
  const { 
    questionCount = 5, 
    includeFlashcards = false, 
    difficulty = 'medium', 
    questionType = 'mixed' 
  } = settings;
  
  try {
    const params = new URLSearchParams({
      topic: topic,
      num_questions: questionCount,
      include_flashcards: includeFlashcards,
      difficulty: difficulty,
      question_type: questionType
    });
    
    const response = await api.post(`/quiz/generate?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

// Generate a single question at a time
export const generateOneQuestion = async (topic = "general", difficulty = "medium", questionType = "mcq", previousQuestions = []) => {
  try {
    const params = new URLSearchParams({
      topic: topic,
      difficulty: difficulty,
      question_type: questionType,
    });
    
    if (previousQuestions.length > 0) {
      params.append('previous_questions', previousQuestions.join(','));
    }
    
    const response = await api.post(`/quiz/generate-one?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error generating question:', error);
    throw error;
  }
};

// Check answers using cosine similarity
export const checkAnswersSimilarity = async (answers) => {
  try {
    const response = await api.post('/quiz/check-answers', { answers });
    return response.data;
  } catch (error) {
    console.error('Error checking answers:', error);
    throw error;
  }
};

// Agent-based quiz generation (uses parsed character format)
export const generateQuizWithAgent = async (numQuestions = 5) => {
  try {
    const params = new URLSearchParams({
      num_questions: numQuestions,
    });
    const response = await api.post(`/quiz/agent/generate?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error generating quiz with agent:', error);
    throw error;
  }
};

// Generate a single question using agent
export const generateOneQuestionWithAgent = async (previousQuestions = []) => {
  try {
    const params = new URLSearchParams();
    
    if (previousQuestions.length > 0) {
      params.append('previous_questions', previousQuestions.join(','));
    }
    
    const response = await api.post(`/quiz/agent/generate-one?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error generating question with agent:', error);
    throw error;
  }
};

// Generate flashcards using agent
export const generateFlashcardsWithAgent = async (numFlashcards = 5) => {
  try {
    const params = new URLSearchParams({
      num_flashcards: numFlashcards,
    });
    const response = await api.post(`/quiz/agent/generate-flashcards?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error generating flashcards with agent:', error);
    throw error;
  }
};

export default api;
