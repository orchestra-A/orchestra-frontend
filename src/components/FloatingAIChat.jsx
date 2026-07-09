import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, X, MessageSquare } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useProject } from '../context/ProjectContext';

export function FloatingAIChat() {
  const location = useLocation();
  
  // Extract projectId if we are on a project route
  const pathParts = location.pathname.split('/');
  const isProjectRoute = pathParts[1] === 'project' && pathParts.length >= 3;
  const currentProjectId = isProjectRoute ? pathParts[2] : null;

  const { projects } = useProject();
  const project = projects.find(p => p.id === currentProjectId || p.id === decodeURIComponent(currentProjectId || ''));
  const projectName = project ? project.name : "Project";

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: -1, top: -1 });
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm the AI assistant for ${projectName}. How can I help you today?` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });
  const windowRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Removed reset on navigate to persist chat box open state across tabs

  // Ping health endpoint on first open
  useEffect(() => {
    if (isOpen) {
      fetch('https://orchestra-ai-36zm.onrender.com/health').catch(() => {});
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        left: dragRef.current.initialLeft + dx,
        top: dragRef.current.initialTop + dy
      });
    };

    const onPointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging]);

  // No longer returning null on non-project routes, handled by AppShell
  const onPointerDown = (e) => {
    if (!windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    };
    setIsDragging(true);
  };

  const hasCustomPos = position.left !== -1;
  const windowStyle = hasCustomPos 
    ? { left: position.left, top: position.top, bottom: 'auto', right: 'auto' } 
    : { bottom: '80px', right: '24px' };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMsg = { role: 'user', content: inputText.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Get last 5 pairs of interactions (up to 10 messages)
      const history = newMessages.slice(1, -1).slice(-10).map(m => m.content);

      const response = await fetch('https://orchestra-ai-36zm.onrender.com/clover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
        },
        body: JSON.stringify({
          question: `[System Context: User is currently on URL path: ${location.pathname}]\n\n${userMsg.content}`,
          conversation_history: history
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || data.response || data.reply || JSON.stringify(data) }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the AI server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 bg-[#6B905F] hover:bg-[#5A7A4F] text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-105 group px-4 overflow-hidden"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[200px] group-hover:ml-1 text-sm font-medium">
              Chat with AI
            </span>
          </div>
        </button>
      )}

      {isOpen && (
        <div 
          ref={windowRef}
          style={windowStyle}
          className="fixed z-50 w-[350px] bg-[#F4F1EB] dark:bg-[#09090B] border border-gray-200 dark:border-[#27272A] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div 
            className="flex items-center justify-between px-4 py-3 bg-[#6B905F] dark:bg-[#27272A] text-white cursor-move touch-none select-none"
            onPointerDown={onPointerDown}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm truncate max-w-[200px]">AI - {projectName}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-[400px] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto bg-[#F3F7F1] dark:bg-transparent space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6B905F] to-[#5A7A4F] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl text-[13px] shadow-sm max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-white dark:bg-[#1E1E22] text-[#1D1E1B] dark:text-white rounded-tr-sm border border-gray-200 dark:border-[#27272A]' 
                      : 'bg-gradient-to-br from-[#6B905F] to-[#3B5432] text-white rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6B905F] to-[#5A7A4F] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-[#6B905F] to-[#3B5432] text-white p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm max-w-[85%] flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                    <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 bg-[#F4F1EB] dark:bg-[#09090B] border-t border-gray-200 dark:border-[#27272A]">
              <div className="relative flex items-center gap-2">
                <Input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Ask something..." 
                  className="flex-1 bg-white dark:bg-[#09090B] border-gray-200 dark:border-[#27272A] text-[#1D1E1B] dark:text-white/90" 
                />
                <Button 
                  onClick={handleSend}
                  disabled={isLoading || !inputText.trim()}
                  size="icon" 
                  className="bg-[#6B905F] hover:bg-[#5A7A4F] text-white shrink-0 disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
