# FlashQuiz+

## Problem Statement
Students often finish studying notes or slides but lack quick ways to test their understanding. **FlashQuiz+** enables users to upload study documents and instantly generate quizzes or flashcards for self‑assessment.

## Requirements & Features

### 1. User Interface
A simple and responsive interface for uploading documents and attempting quizzes or flashcards.

### 2. Document Handling
Accepts document formats (PDF, DOCX, or TXT) and extracts readable text content.

### 3. Quiz / Flashcard Generation
Generates multiple‑choice questions or flashcards using rule‑based logic or optional AI assistance.

### 4. User Interaction
Allows users to attempt quizzes and receive immediate feedback on their answers.

### 5. Summary & Insights
Displays basic statistics such as total questions attempted, correct answers, and weak topics.

## How It Works

1.  **Upload**: The user selects a study document (PDF, DOCX, etc.) via the frontend interface.
2.  **Extraction**: The file is sent to the FastAPI backend, where text content is extracted.
3.  **Generation**: The backend processes the text to create questions and answers (using algorithms or AI models).
4.  **Quiz Time**: The generated quiz is sent back to the frontend. The user answers questions interactively.
5.  **Feedback**: The system grades the answers instantly and provides a summary of performance.

## Tech Stack

-   **Frontend**: React (Vite)
-   **Backend**: FastAPI (Python)
-   **Database**: SQLModel (SQLite/PostgreSQL)

## Getting Started

### Backend
1.  Navigate to the `Backend` directory.
2.  Install dependencies.
3.  Run the server: `uvicorn main:app --reload`.

### Frontend
1.  Navigate to the `Frontend/vite-project` directory.
2.  Install dependencies: `npm install`.
3.  Run the development server: `npm run dev`.
