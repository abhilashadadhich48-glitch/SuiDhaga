import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { aiAPI } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AiChatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Hello! I am your **SuiDhaga AI Stylist & Fashion Advisor** 🧵✨. 
      
How can I assist you today? You can ask me about:
- Choice of fabrics for custom dresses (Lehengas, Kurtas, Suits)
- Measurement tips for a perfect bespoke fit
- Trendy neck/sleeve pattern ideas
- Average tailoring pricing estimates`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    'Bridal Lehenga fabrics',
    'Blouse neck designs',
    'How to measure chest?',
    'Pricing estimates'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    // Add User Message
    const userMsg: Message = {
      id: Math.random().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await aiAPI.chat(text);
      const aiReply = response.data?.reply || response.data?.message || response.data?.text || 'Thank you for reaching out!';

      const aiMsg: Message = {
        id: Math.random().toString(),
        text: aiReply,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('AI chat failed:', error);
      const serverErr = error?.response?.data?.message;
      const errorMsg: Message = {
        id: Math.random().toString(),
        text: serverErr ? `Notice: ${serverErr}` : 'Sorry, I am facing a temporary stitching issue. Please try again in a moment!',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Helper to simple-parse basic markdown bold text for display
  const formatText = (text?: string) => {
    if (!text || typeof text !== 'string') return null;
    return text.split('\n').map((line, idx) => {
      // Basic bold formatting **text**
      const parts = line.split('**');
      const formattedLine = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return <strong key={partIdx} className="font-bold text-[#2f5d50]">{part}</strong>;
        }
        return part;
      });

      return (
        <p key={idx} className={idx > 0 ? "mt-2" : ""}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Sparkles Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2f5d50] text-[#c5a880] shadow-2xl hover:bg-[#204037] transition-all duration-300 hover:scale-110 border border-[#c5a880]/30 animate-pulse-subtle"
          title="Ask AI Fashion Advisor"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="flex h-[520px] w-[380px] flex-col rounded-2xl border border-[#e8e4de] bg-white shadow-2xl transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-[#2f5d50] p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Sparkles className="h-5 w-5 text-[#c5a880]" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white"></span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wider">AI Design Advisor</h3>
                <span className="text-[10px] text-[#c5a880] tracking-widest font-sans uppercase">SuiDhaga</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto bg-[#faf8f5] p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2f5d50] text-white rounded-tr-none'
                      : 'bg-white text-[#2c2c2c] border border-[#e8e4de] rounded-tl-none shadow-sm'
                  }`}
                >
                  {formatText(msg.text)}
                </div>
                <span className="mt-1 text-[9px] text-gray-400 font-sans">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 p-2 text-gray-500 bg-white border border-[#e8e4de] rounded-2xl rounded-tl-none max-w-[80px] justify-center shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#c5a880]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#2f5d50] [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#c5a880] [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="bg-[#faf8f5] px-4 pb-2 pt-1 flex flex-wrap gap-1.5">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="rounded-full bg-white border border-[#e8e4de] px-3 py-1 text-[10px] font-sans font-medium text-[#2f5d50] hover:bg-[#2f5d50] hover:text-white transition-all shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSubmit} className="border-t border-[#e8e4de] bg-white p-3 flex gap-2 rounded-b-2xl">
            <input
              type="text"
              placeholder="Ask about designs, measurements, fabrics..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-xl border border-[#e8e4de] px-4 py-2 text-xs focus:border-[#2f5d50] focus:ring-1 focus:ring-[#2f5d50] outline-none font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2f5d50] text-[#c5a880] hover:bg-[#204037] transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiChatbox;
