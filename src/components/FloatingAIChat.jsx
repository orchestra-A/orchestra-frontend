import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Send, X, MessageSquare, CheckCircle2, ArrowRight, AlertCircle, RefreshCcw } from 'lucide-react';
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
  const [chatError, setChatError] = useState(false);

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

  const handleActionClick = (actionObj) => {
    if (!actionObj) return;

    if (typeof actionObj === 'object') {
      if (actionObj.type === 'switch_project' && actionObj.project_id) {
        navigate(`/project/${actionObj.project_id}/workflow`);
        setIsOpen(false);
        return;
      }
      if (actionObj.type === 'open_url' && actionObj.url) {
        window.open(actionObj.url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
        return;
      }
    }

    let dest = '';
    let pid = currentProjectId;
    
    if (typeof actionObj === 'string') {
      dest = actionObj.toLowerCase();
    } else if (typeof actionObj === 'object') {
      const validDestinations = ['dashboard', 'projects', 'todo', 'calendar', 'archive', 'profile', 'settings', 'workspaces', 'help', 'workflow', 'tasks', 'team', 'activity', 'blueprint'];
      
      for (const key of Object.keys(actionObj)) {
        if (validDestinations.includes(key.toLowerCase())) {
          dest = key.toLowerCase();
          break;
        }
      }
      
      if (!dest) {
        dest = (actionObj.destination || actionObj.action || actionObj.type || actionObj.name || '').toLowerCase();
      }
      if (actionObj.project_id) pid = actionObj.project_id;
    }
    
    if (!dest) return;

    if (dest === 'dashboard') {
      navigate('/');
      setIsOpen(false);
      return;
    }
    
    const globalRoutes = ['projects', 'todo', 'calendar', 'archive', 'profile', 'settings', 'workspaces', 'help'];
    const projectRoutes = ['workflow', 'tasks', 'team', 'activity'];
    
    if (globalRoutes.includes(dest)) {
      navigate(`/${dest}`);
      setIsOpen(false);
    } else if (projectRoutes.includes(dest) && pid) {
      navigate(`/project/${pid}/${dest}`);
      setIsOpen(false);
    } else if (dest === 'blueprint' && pid) {
      navigate(`/blueprint/${pid}`);
      setIsOpen(false);
    } else {
      console.warn("Unknown routing action or missing project ID:", actionObj);
    }
  };

  const handleSend = async (overrideQuery = null) => {
    const userQuery = overrideQuery || inputText.trim();
    if (!userQuery || isLoading) return;
    
    setChatError(false);
    
    const userMsg = { role: 'user', content: userQuery };
    
    // Ensure we don't duplicate the user query in history if it's a retry
    let historyToUse = messages;
    if (overrideQuery && messages.length > 0 && messages[messages.length - 1].role === 'user') {
      historyToUse = messages.slice(0, -1);
    }
    
    // Extract last 5 query/response turns (up to 10 messages) for conversation_history
    const historySlice = historyToUse.slice(-10);
    const conversationHistory = historySlice.map(m => ({
      content: m.content,
      role: m.role === 'user' ? 'user' : 'assistant'
    }));

    setMessages(prev => [...prev, userMsg]);
    if (!overrideQuery) {
      setInputText('');
    }
    setIsLoading(true);

    try {
      // Pass the canonical project ID (with underscores) rather than the raw URL slug
      const canonicalId = project ? project.id : null;
      
      // Initialize an empty message placeholder for the assistant
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      const userId = currentUser ? (currentUser.user_id || currentUser.id || currentUser.username) : null;
      const username = currentUser ? (currentUser.username || currentUser.name) : null;

      const data = await sendCloverMessage(userQuery, conversationHistory, canonicalId, userId, username, (chunk, fullText) => {
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
        replyContent = data.text || data.answer || data.reply || data.response || data.message || '';
        if (!replyContent) {
           // If the AI literally gave us no text, consider it a failure.
           throw new Error("AI returned an empty response.");
        }
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
      // Remove the empty placeholder
      setMessages(prev => prev.slice(0, -1));
      setChatError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setChatError(false);
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      setMessages(prev => prev.slice(0, -1));
      handleSend(lastMsg.content);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 bg-[#6B905F] hover:bg-[#5A7A4F] text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-105 group px-4 overflow-hidden"
        >
          <div className="flex items-center justify-center">
            <MessageSquare className="w-6 h-6 shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[200px] group-hover:ml-2 text-sm font-medium">
              Chat with AI
            </span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="relative h-full flex z-40 shrink-0">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-[#6B905F]/10 flex items-center justify-center mr-2 shrink-0 border border-[#6B905F]/20">
                      <Bot className="w-3.5 h-3.5 text-[#6B905F]" />
                    </div>
                  )}
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-[#6B905F] text-white rounded-br-sm' 
                        : 'bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] text-gray-800 dark:text-gray-200 rounded-bl-sm'
                      }`}
                  >
                    {/* Assistant message content handling (markdown parsing) */}
                    {msg.role === 'assistant' ? (
                      msg.content ? (
                        <div className="ai-chat-content space-y-2">
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          
                          {/* Suggested Tasks Rendering */}
                          {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 space-y-2">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white/90">Suggested Tasks:</p>
                              {msg.suggestedTasks.map((task, tIdx) => (
                                <div key={tIdx} className="bg-gray-50 dark:bg-black/20 p-2 rounded-md border border-gray-100 dark:border-white/5">
                                  <p className="font-medium text-gray-800 dark:text-white/80">{task.title}</p>
                                  {task.description && <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{task.description}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Render action rerouting button if any */}
                          {msg.action && (
                            <button
                              onClick={() => handleActionClick(msg.action)}
                              className="mt-2 w-full py-2 px-3 bg-[#6B905F]/10 hover:bg-[#6B905F]/20 dark:bg-white/5 dark:hover:bg-white/10 text-[#6B905F] dark:text-white/90 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors flex items-center justify-between group"
                            >
                              <span>
                                {typeof msg.action === 'string' 
                                  ? `Go to ${msg.action}` 
                                  : msg.action.type === 'switch_project'
                                    ? 'Switch Project'
                                    : msg.action.type === 'open_url'
                                      ? 'Open Link'
                                      : `Go to ${Object.keys(msg.action).find(k => k !== 'project_id' && k !== 'type') || msg.action.destination || 'Page'}`
                                }
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex space-x-1 items-center h-5 px-1">
                          <div className="w-1.5 h-1.5 bg-[#6B905F] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#6B905F] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#6B905F] rounded-full animate-bounce"></div>
                        </div>
                      )
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Error State Banner */}
            {chatError && (
              <div className="mx-4 mb-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex flex-col gap-2 shadow-sm">
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span className="font-medium">Something went wrong connecting to the AI server.</span>
                </div>
                <button 
                  onClick={handleRetry}
                  className="self-end px-3 py-1 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 text-xs font-semibold rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            <div className="p-4 bg-white dark:bg-[#18181B] border-t border-gray-200 dark:border-[#27272A] shrink-0">
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
