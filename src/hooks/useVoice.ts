import { useState, useCallback, useRef } from 'react';
import { voiceApi } from '../utils/api';

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
    }
  }, []);

  // Start listening with Web Speech API
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
    }

    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Failed to start speech recognition');
        console.error('Speech recognition error:', error);
      }
    }
  }, [isListening, initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Start recording audio for transcription API
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      setError(null);
    } catch (error) {
      setError('Failed to access microphone');
      console.error('Recording error:', error);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Transcribe audio using API
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const response = await voiceApi.transcribe(audioFile);
      setTranscript(response.data.text);
    } catch (error) {
      setError('Failed to transcribe audio');
      console.error('Transcription error:', error);
    }
  }, []);

  // Text to speech
  const speak = useCallback(async (text: string) => {
    try {
      // Try browser's speech synthesis first
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Fallback to API
      const response = await voiceApi.synthesize(text);
      if (response.data.audio_url) {
        const audio = new Audio(response.data.audio_url);
        audio.play();
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  }, []);

  // Toggle listening (uses Web Speech API by default, falls back to recording)
  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        stopListening();
      } else {
        stopRecording();
      }
    } else {
      if (isSupported) {
        startListening();
      } else {
        startRecording();
      }
    }
  }, [isListening, isSupported, startListening, stopListening, startRecording, stopRecording]);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    toggleListening,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    speak,
    clearTranscript: () => setTranscript(''),
    clearError: () => setError(null),
  };
}