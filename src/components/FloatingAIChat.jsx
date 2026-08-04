import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Send, X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { sendCloverMessage } from '../services/api';

export function FloatingAIChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Extract projectId if we are on a project route
  const pathParts = location.pathname.split('/');
  const isProjectRoute = pathParts[1] === 'project' && pathParts.length >= 3;
  const currentProjectId = isProjectRoute ? pathParts[2] : null;

  const { projects, tasks } = useProject();
  const project = projects.find(p => p.id === currentProjectId || p.id === decodeURIComponent(currentProjectId || ''));
  const projectName = project ? project.name : "Project";

  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm the AI assistant for ${projectName}. How can I help you today?` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (!isResizing) return;
    
    const handlePointerMove = (e) => {
      // The new width is calculated based on how far the mouse is from the right edge of the screen
      // Assuming the chat is docked on the right side.
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 600) {
        setWidth(newWidth);
      }
    };
    
    const handlePointerUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isResizing]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userQuery = inputText.trim();
    const userMsg = { role: 'user', content: userQuery };
    
    // Extract last 5 query/response turns (up to 10 messages) for conversation_history
    const historySlice = messages.slice(-10);
    const conversationHistory = historySlice.map(m => ({
      content: m.content,
      role: m.role === 'user' ? 'user' : 'assistant'
    }));

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Pass the canonical project ID (with underscores) rather than the raw URL slug
      const canonicalId = project ? project.id : null;
      
      // Initialize an empty message placeholder for the assistant
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      const userId = currentUser ? (currentUser.user_id || currentUser.id || currentUser.username) : null;

      const data = await sendCloverMessage(userQuery, conversationHistory, canonicalId, userId, (chunk, fullText) => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: fullText };
          return newMessages;
        });
      });
      
      let replyContent = '';
      let suggestedTasks = [];
      let action = null;
      
      if (data && typeof data === 'object') {
        replyContent = data.text || data.answer || data.reply || data.response || data.message || JSON.stringify(data);
        suggestedTasks = data.suggestedTasks || data.suggested_tasks || [];
        action = data.action || null;
      } else {
        replyContent = String(data);
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'assistant', 
          content: replyContent,
          suggestedTasks,
          action
        };
        return newMessages;
      });
    } catch (error) {
      console.error('Clover AI Chat Error:', error);
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
        <div className="relative flex h-full shrink-0">
          {/* Drag Handle */}
          <div 
            onPointerDown={handlePointerDown}
            className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-[#6B905F]/50 z-10 transition-colors"
          />
          <div 
            style={{ width: `${width}px` }}
            className="bg-[#F4F1EB] dark:bg-[#09090B] border-l border-gray-200 dark:border-[#27272A] flex flex-col h-full shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-none shrink-0"
          >
          <div 
            className="flex items-center justify-between px-4 py-4 bg-[#6B905F] dark:bg-[#27272A] text-white select-none border-b border-[#5A7A4F] dark:border-[#3F3F46]"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm truncate max-w-[200px]">AI - {projectName}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto bg-[#F3F7F1] dark:bg-transparent space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6B905F] to-[#5A7A4F] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl max-w-[80%] text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#6B905F] dark:bg-[#6B905F]/80 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-[#1E1E22] text-[#1D1E1B] dark:text-white/90 rounded-tl-none border border-gray-100 dark:border-[#27272A]'
                  }`}>
                    {msg.role === 'assistant' && msg.content === "" ? (
                      <div className="flex gap-1 items-center h-4 px-1">
                        <div className="w-1.5 h-1.5 bg-[#6B905F]/50 dark:bg-white/50 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-[#6B905F]/50 dark:bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                        <div className="w-1.5 h-1.5 bg-[#6B905F]/50 dark:bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}

                    {/* Render suggested tasks if any */}
                    {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-black/5 dark:border-white/5 pt-3">
                        <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Related Tasks
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {msg.suggestedTasks.map((task, tIdx) => (
                            <div 
                              key={tIdx}
                              onClick={() => {
                                let targetProjectId = task.project_id || currentProjectId;
                                
                                // Fallback: look up the task in the global tasks array to find its project_id
                                if (!targetProjectId && tasks) {
                                  const foundTask = tasks.find(t => t.id === task.id || t.id === task.task_id);
                                  if (foundTask) targetProjectId = foundTask.project_id;
                                }

                                if (targetProjectId) {
                                  navigate(`/project/${targetProjectId}/workflow`, { state: { selectedTaskId: task.id || task.task_id } });
                                  setIsOpen(false);
                                } else {
                                  console.warn("Routing failed: Missing project ID for task", task);
                                }
                              }}
                              className="bg-[#F4F1EB]/50 dark:bg-black/20 hover:bg-[#F4F1EB] dark:hover:bg-black/40 border border-black/5 dark:border-white/10 rounded-md p-2 cursor-pointer transition-all flex items-center gap-2 group"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-[#6B905F] shrink-0" />
                              <span className="font-medium text-xs truncate group-hover:text-[#6B905F] dark:group-hover:text-[#7ED957] transition-colors">
                                {task.title || task.name || 'View Task'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
        </div>
      )}
    </>
  );
}
