'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  Bot,
  FlameKindling
} from 'lucide-react';
import { api } from '@/services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am Shivaay, your AI Fitness Assistant. Ask me anything about proteins, creatine, weight loss, showroom timings, or order status (e.g. "Creatine available hai?" or "order status ord-xxxx").',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Text-To-Speech (TTS) response
  const speakResponse = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel(); // cancel any active speech

    // Clean markdown formatting before reading
    const cleanText = text.replace(/[*#`_\-]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate voice (preferably Hindi or Indian English if Hinglish/Hindi text)
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('en-IN')) || voices[0];
    
    if (targetVoice) utterance.voice = targetVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Try Chrome/Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setInputText('');
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.ai.chat(text);
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      speakResponse(data.reply);
    } catch (err) {
      const aiErrorMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: 'Sorry, I am having trouble connecting to the Shivaay server. Please check your network and try again!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Speech Recognition Setup (Runs clientside)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = 'hi-IN'; // Set to Hindi/Hinglish capture
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setInputText(speechToText);
          handleSendMessage(speechToText);
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  return (
    <>
      {/* Floating capsule trigger button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-charcoal text-brand-gold border border-brand-gold/45 shadow-lg shadow-brand-gold/15 transition-all duration-300 led-glow-gold cursor-pointer"
        aria-label="AI Fitness Assistant"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1.5 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-orange" />
        </span>
      </motion.button>

      {/* Floating Chat Drawer UI */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[550px] rounded-2xl glass-panel border border-brand-gold/20 flex flex-col overflow-hidden shadow-2xl shadow-black/80"
          >
            {/* Top header strip */}
            <div className="p-4 bg-brand-charcoal border-b border-brand-gold/10 flex items-center justify-between relative">
              {/* LED Strip */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-brand-orange to-brand-gold" />
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center text-white shrink-0">
                  <Bot className="h-5 w-5 text-brand-black" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <span>Shivaay AI Coach</span>
                    <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-pulse" />
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Bilingual Voice Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Output Toggle */}
                <button
                  onClick={() => {
                    setIsVoiceEnabled(!isVoiceEnabled);
                    window.speechSynthesis.cancel();
                  }}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isVoiceEnabled
                      ? 'border-brand-gold/20 text-brand-gold bg-brand-gold/5'
                      : 'border-gray-800 text-gray-500 hover:text-gray-300'
                  }`}
                  title={isVoiceEnabled ? 'Mute Voice Output' : 'Enable Voice Output'}
                >
                  {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.speechSynthesis.cancel();
                  }}
                  className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-brand-charcoal transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages scrolling arena */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-brand-charcoal">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${
                      isAi ? 'self-start' : 'self-end flex-row-reverse ml-auto'
                    }`}
                  >
                    {/* Avatar icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        isAi 
                          ? 'bg-brand-charcoal border-brand-gold/15 text-brand-gold' 
                          : 'bg-brand-orange/20 border-brand-orange/20 text-brand-orange'
                      }`}
                    >
                      {isAi ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isAi
                          ? 'bg-brand-charcoal/80 border border-brand-gold/10 text-gray-200 rounded-tl-none'
                          : 'bg-gradient-to-r from-brand-orange/20 to-brand-gold/15 border border-brand-orange/20 text-white rounded-tr-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="block text-[9px] text-gray-500 text-right mt-1.5">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing loader */}
              {loading && (
                <div className="flex gap-3 max-w-[80%] self-start">
                  <div className="w-7 h-7 rounded-full bg-brand-charcoal border border-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                    <Bot className="h-3.5 w-3.5 animate-bounce" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-brand-charcoal/80 border border-brand-gold/10 text-xs text-gray-400 rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Microphone listening overlay */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-brand-orange/15 border-t border-brand-orange/20 flex flex-col items-center justify-center text-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-ping" />
                  <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Listening to your voice...</span>
                </div>
                <p className="text-[9px] text-gray-400">Speak now in Hindi, English, or Hinglish. Click Mic to stop.</p>
              </motion.div>
            )}

            {/* Chat bottom input controllers */}
            <div className="p-4 bg-brand-charcoal/40 border-t border-brand-gold/10 flex gap-2 items-center">
              {/* Mic Icon for speech recognition */}
              <button
                onClick={handleToggleListening}
                className={`p-3 rounded-xl border shrink-0 transition-all duration-300 ${
                  isListening
                    ? 'bg-brand-orange border-brand-orange text-white animate-pulse'
                    : 'border-brand-gold/20 text-brand-gold bg-brand-black/30 hover:border-brand-gold'
                }`}
                title="Speak to Assistant"
              >
                {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Ask about pricing, status, advice..."
                className="flex-grow bg-brand-black border border-brand-gold/10 hover:border-brand-gold/25 focus:border-brand-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-colors"
                disabled={loading}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputText.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold hover:scale-105 duration-300 text-white shrink-0 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
