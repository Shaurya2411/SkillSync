
import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/gemini';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const CareerCoachBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Welcome to SkillSync! I am your Career Mentor. How can I help you optimize your readiness today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const stream = await sendChatMessage(userMessage);
      let botResponse = '';
      
      // Add empty bot message to fill
      setMessages(prev => [...prev, { role: 'bot', text: '' }]);

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        botResponse += c.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = botResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'I encountered a connection error. Please try again!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="w-[380px] h-[500px] bg-[#1a2e20] border border-[#3b5443] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-10 duration-300">
          <div className="p-6 bg-[#28392e] border-b border-[#3b5443] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-[#0df259] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[#102216] text-sm">robot_2</span>
              </div>
              <div>
                <h3 className="text-white font-black text-sm">Career Mentor</h3>
                <div className="flex items-center gap-1.5">
                   <div className="size-1.5 bg-[#0df259] rounded-full animate-pulse"></div>
                   <span className="text-[9px] font-black text-[#0df259] uppercase tracking-widest">AI Agent Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#9cbaa6] hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-[#0df259] text-[#102216] font-bold rounded-tr-none' 
                    : 'bg-[#102216] border border-[#3b5443] text-white rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#102216] border border-[#3b5443] p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="size-1 bg-[#0df259] rounded-full animate-bounce"></div>
                    <div className="size-1 bg-[#0df259] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="size-1 bg-[#0df259] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-[#102216]/50 border-t border-[#3b5443] flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your readiness..."
              className="flex-1 bg-[#102216] border border-[#3b5443] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#0df259] transition-all"
            />
            <button type="submit" className="size-10 bg-[#0df259] text-[#102216] rounded-xl flex items-center justify-center hover:scale-105 transition-all">
              <span className="material-symbols-outlined font-black">send</span>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`size-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-[#28392e] text-[#0df259]' : 'bg-[#0df259] text-[#102216]'
        }`}
      >
        <span className="material-symbols-outlined text-3xl font-black">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>
    </div>
  );
};

export default CareerCoachBot;
