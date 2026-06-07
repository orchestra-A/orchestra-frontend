import { Bot, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function ProjectAI({ projectName = "Project" }) {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-gray-900 dark:text-white/90 text-2xl font-bold">{projectName} - AI</h1>
      </div>

      <div className="flex-1 bg-white dark:bg-[#1A1E2E] border border-gray-200 dark:border-[#2A3142] rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50 dark:bg-transparent">
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white dark:bg-[#2A3142] border border-gray-200 dark:border-transparent p-4 rounded-2xl rounded-tl-sm text-sm text-gray-700 dark:text-white/90 shadow-sm max-w-[80%]">
              Hello! I'm the AI assistant for {projectName}. How can I help you today? I can analyze tasks, suggest workflow improvements, or generate reports.
            </div>
          </div>
          
        </div>
        
        <div className="p-4 bg-white dark:bg-[#1A1E2E] border-t border-gray-200 dark:border-[#2A3142]">
          <div className="relative flex items-center gap-2">
            <Input placeholder="Ask the AI something about this project..." className="flex-1 bg-gray-50 dark:bg-[#141824] border-gray-200 dark:border-[#2A3142] text-gray-900 dark:text-white/90" />
            <Button size="icon" className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
