// src/components/Messaging/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { IoAttach, IoSend, IoStop, IoClose } from 'react-icons/io5';
import { MdMic, MdAudiotrack, MdAttachFile } from 'react-icons/md';
import './MessageInput.css';

const MessageInput = ({ 
  onSendMessage, 
  onTypingStart, 
  onTypingStop, 
  disabled = false,
  placeholder = "Écrivez votre message..." 
}) => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Gestion du typing indicator
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Reset du timer de typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTypingStart, onTypingStop]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;

    onSendMessage(trimmedMessage, selectedFiles);
    setMessage('');
    setSelectedFiles([]);
    
    // Arrêter le typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Reset input pour permettre de sélectionner le même fichier à nouveau
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.startsWith('audio/')) return <MdAudiotrack />;
    return <MdAttachFile />;
  };

  // Aperçu audio avec bouton de lecture
  const AudioPreview = ({ file, onRemove, index }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
      if (file && file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });

        audioRef.current = audio;

        return () => {
          URL.revokeObjectURL(url);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
        };
      }
    }, [file]);

    const togglePlay = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!file.type.startsWith('audio/')) {
      return (
        <div className="file-preview">
          <span className="file-icon">{getFileIcon(file)}</span>
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
          </div>
          <button 
            className="remove-file"
            onClick={() => onRemove(index)}
            type="button"
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <div className="file-preview audio-preview">
        <button 
          className="play-audio-btn"
          onClick={togglePlay}
          type="button"
        >
          {isPlaying ? <IoStop /> : <MdMic />}
        </button>
        <div className="audio-info">
          <span className="file-name"><MdMic /> Message vocal</span>
          <span className="file-size">{duration ? formatDuration(duration) : '0:00'}</span>
        </div>
        <button 
          className="remove-file"
          onClick={() => onRemove(index)}
          type="button"
        >
          ✕
        </button>
      </div>
    );
  };

  // Démarrer l'enregistrement audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' });
        
        // Ajouter l'audio aux fichiers sélectionnés
        setSelectedFiles(prev => [...prev, audioFile]);
        
        // Nettoyer le stream
        stream.getTracks().forEach(track => track.stop());
        setMediaRecorder(null);
        setRecordingTime(0);
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      recorder.start();

      // Démarrer le chronomètre
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      alert('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
    }
  };

  // Arrêter l'enregistrement audio
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Annuler l'enregistrement audio
  const cancelRecording = () => {
    if (mediaRecorder) {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      setRecordingTime(0);
      
      // Nettoyer le stream
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      setMediaRecorder(null);
    }
  };

  // Formatter le temps d'enregistrement
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="message-input-container">
      {/* Aperçu des fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          {selectedFiles.map((file, index) => (
            <AudioPreview 
              key={index} 
              file={file} 
              index={index} 
              onRemove={removeFile}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          {/* Bouton d'ajout de fichiers */}
          <button
            type="button"
            className="attachment-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Ajouter un fichier"
          >
            <IoAttach />
          </button>

          {/* Zone de texte */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Impossible d'envoyer un message" : placeholder}
            className="message-textarea"
            disabled={disabled}
            rows={1}
          />

          {/* Bouton dynamique : Micro ou Envoi */}
          {isRecording ? (
            // Boutons d'enregistrement en cours
            <div className="recording-controls">
              <button
                type="button"
                className="cancel-recording-button"
                onClick={cancelRecording}
                title="Annuler l'enregistrement"
              >
                <IoClose />
              </button>
              <div className="recording-info">
                <span className="recording-time">{formatRecordingTime(recordingTime)}</span>
                <div className="recording-wave"><MdMic /></div>
              </div>
              <button
                type="button"
                className="stop-recording-button"
                onClick={stopRecording}
                title="Terminer l'enregistrement"
              >
                <IoStop />
              </button>
            </div>
          ) : (
            // Bouton micro ou envoi selon le contenu
            <button
              type={message.trim() || selectedFiles.length > 0 ? "submit" : "button"}
              className={`${message.trim() || selectedFiles.length > 0 ? 'send-button active' : 'record-button'}`}
              onClick={message.trim() || selectedFiles.length > 0 ? undefined : startRecording}
              disabled={disabled}
              title={message.trim() || selectedFiles.length > 0 ? "Envoyer le message" : "Enregistrer un message vocal"}
            >
              {message.trim() || selectedFiles.length > 0 ? (
                <span className="send-icon"><IoSend /></span>
              ) : (
                <MdMic />
              )}
            </button>
          )}
        </div>

        {/* Input fichier caché */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="file-input"
        />
      </form>
    </div>
  );
};

export default MessageInput;
