import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../Components/Layout/AppLayout';
import { 
  Upload as UploadIcon, 
  FileText, 
  X, 
  CheckCircle2,
  AlertCircle,
  Brain,
  Settings,
  Sparkles
} from 'lucide-react';
import './Upload.css';

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [quizSettings, setQuizSettings] = useState({
    difficulty: 'medium',
    questionCount: 10,
    questionType: 'mixed',
    includeFlashcards: true
  });
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && acceptedTypes.includes(droppedFile.type)) {
      setFile(droppedFile);
      setUploadStatus('idle');
    } else {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && acceptedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setUploadStatus('idle');
    } else {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGenerateQuiz = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate processing time
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Navigate to quiz after short delay
      setTimeout(() => {
        navigate('/quiz/new-generated');
      }, 1500);
    }, 2500);
  };

  return (
    <AppLayout>
      <div className="upload-page">
        <div className="upload-header">
          <h1>Upload Document</h1>
          <p>Upload your study material and let AI generate quizzes for you</p>
        </div>

        <div className="upload-container">
          {/* Upload Area */}
          <div className="upload-section">
            <div 
              className={`drop-zone glass-card ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                hidden
              />

              {!file ? (
                <div className="drop-zone-content">
                  <div className="upload-icon-wrapper">
                    <UploadIcon size={48} />
                  </div>
                  <h3>Drag & drop your file here</h3>
                  <p>or click to browse</p>
                  <span className="supported-formats">
                    Supported: PDF, DOC, DOCX, TXT
                  </span>
                </div>
              ) : (
                <div className="file-preview">
                  <div className="file-info">
                    <FileText size={40} className="file-icon" />
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button className="remove-file" onClick={handleRemoveFile}>
                      <X size={20} />
                    </button>
                  </div>

                  {uploadStatus === 'uploading' && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="progress-text">Processing... {uploadProgress}%</span>
                    </div>
                  )}

                  {uploadStatus === 'success' && (
                    <div className="upload-success">
                      <CheckCircle2 size={24} />
                      <span>Quiz generated successfully! Redirecting...</span>
                    </div>
                  )}

                  {uploadStatus === 'error' && (
                    <div className="upload-error">
                      <AlertCircle size={24} />
                      <span>Error processing file. Please try again.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* File Select Button */}
            <button 
              className="btn btn-secondary btn-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon size={20} />
              Select File from Computer
            </button>
          </div>

          {/* Quiz Settings */}
          <div className="settings-section glass-card">
            <div className="settings-header">
              <Settings size={24} />
              <h2>Quiz Settings</h2>
            </div>

            <div className="settings-form">
              <div className="setting-group">
                <label>Difficulty Level</label>
                <div className="radio-group">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <label key={level} className="radio-option">
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={quizSettings.difficulty === level}
                        onChange={(e) => setQuizSettings({ ...quizSettings, difficulty: e.target.value })}
                      />
                      <span className="radio-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label>Number of Questions</label>
                <div className="slider-wrapper">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={quizSettings.questionCount}
                    onChange={(e) => setQuizSettings({ ...quizSettings, questionCount: parseInt(e.target.value) })}
                    className="slider"
                  />
                  <span className="slider-value">{quizSettings.questionCount}</span>
                </div>
              </div>

              <div className="setting-group">
                <label>Question Type</label>
                <select
                  value={quizSettings.questionType}
                  onChange={(e) => setQuizSettings({ ...quizSettings, questionType: e.target.value })}
                  className="form-select"
                >
                  <option value="mixed">Mixed (MCQ + True/False)</option>
                  <option value="mcq">Multiple Choice Only</option>
                  <option value="truefalse">True/False Only</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={quizSettings.includeFlashcards}
                    onChange={(e) => setQuizSettings({ ...quizSettings, includeFlashcards: e.target.checked })}
                  />
                  <span>Also generate flashcards</span>
                </label>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-full generate-btn"
              onClick={handleGenerateQuiz}
              disabled={!file || uploadStatus === 'uploading'}
            >
              <Sparkles size={20} />
              {uploadStatus === 'uploading' ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;
