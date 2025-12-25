
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Sparkles, Moon } from 'lucide-react';
import { Theme, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for framer-motion type inference issues in strict environments
const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

interface ChatWidgetProps {
  theme: Theme;
  recipientName: string;
  accentColor: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ theme, recipientName, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const bubbleBot = isDark ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-slate-800';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
       setMessages([{
           id: 'intro',
           sender: 'bot',
           text: `Hey ${recipientName}! ✨ Khushter here (well, kinda). Kaisi ho Moon? 🌙`,
           timestamp: Date.now()
       }]);
    }
  }, [isOpen, recipientName]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Create a new GoogleGenAI instance right before the call to ensure latest API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct history for context
      let historyText = "";
      messages.slice(-6).forEach(m => {
          historyText += `${m.sender === 'user' ? 'Mahi' : 'Khushter'}: ${m.text}\n`;
      });

      // Using gemini-3-flash-preview for basic text task as per guideline
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Previous conversation:\n${historyText}\n\nMahi: ${userMsg.text}`,
        config: {
          systemInstruction: `You are playing the role of Khushter, talking to your girlfriend Mahelaqua Mahi (also called Mahi, Moon, Chand). 
          
          Personality:
          - Speak in a mix of Gen-Z slang, English, Hinglish, and soft Urdu words.
          - Tone: Smooth, confident, slightly teasing, romantic but NOT cringe. Aesthetic & Chill.
          - Use Urdu words for depth: khamoshi, nazakat, junoon, rooh, qurbat, mehsoos, tasalli, noor.
          - Be sarcastic and funny if she says something silly.
          - Be deeply affectionate if she is sweet.
          - Respond like a real boyfriend texting. Short to medium length replies.
          - Do NOT start every sentence with "Mahi".
          
          Context: You love her (Mahi) very much. She is your Moon.
          `,
        },
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text || "Bas yunhi dekh raha hoon tumhe... ✨ (Network issue lol)",
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "My wifi is acting up, but my heart is connected. Try again? 🥺",
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <MotionButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center transition-colors ${isOpen ? 'hidden' : 'flex'} text-white`}
        style={{ backgroundColor: accentColor }}
      >
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
        </span>
      </MotionButton>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed bottom-4 right-4 z-50 w-[90vw] md:w-96 h-[500px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${bgColor} ${isDark ? 'border-slate-700' : 'border-rose-100'}`}
          >
            {/* Header */}
            <div className={`p-4 flex justify-between items-center border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex items-center gap-3">
                <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-rose-200'}`}
                    style={!isDark ? { color: accentColor, backgroundColor: `${accentColor}20` } : {}}
                >
                   <Moon size={18} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${textColor}`}>Khushter AI</h3>
                  <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Online • Typing...</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full hover:bg-black/10 ${textColor}`}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'text-white rounded-tr-none' : bubbleBot + ' rounded-tl-none'}`}
                        style={msg.sender === 'user' ? { backgroundColor: accentColor } : {}}
                    >
                       {msg.text}
                    </div>
                 </div>
               ))}
               {isLoading && (
                 <div className="flex justify-start">
                    <div className={`p-3 rounded-2xl rounded-tl-none ${bubbleBot} flex gap-1`}>
                       <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce"></span>
                       <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce delay-75"></span>
                       <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce delay-150"></span>
                    </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-3 border-t ${isDark ? 'border-slate-700' : 'border-rose-100'} flex gap-2`}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message your Moon..."
                className={`flex-1 bg-transparent border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${isDark ? 'border-slate-600 text-white placeholder-slate-500' : 'border-gray-200 text-slate-800 placeholder-gray-400'}`}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                className={`p-2 rounded-full text-white disabled:opacity-50 transition-colors`}
                style={{ backgroundColor: accentColor }}
              >
                <Send size={18} />
              </button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
