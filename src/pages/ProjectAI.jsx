import { Bot, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function ProjectAI({ projectName = "Project" }) {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl font-bold mb-2">{projectName} - AI Assistant</h1>
        <p className="text-gray-500">Chat with the project's dedicated AI assistant.</p>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50">
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm text-sm text-gray-700 shadow-sm max-w-[80%]">
              Hello! I'm the AI assistant for {projectName}. How can I help you today? I can analyze tasks, suggest workflow improvements, or generate reports.
            </div>
          </div>
          
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="relative flex items-center gap-2">
            <Input placeholder="Ask the AI something about this project..." className="flex-1 bg-gray-50" />
            <Button size="icon" className="bg-[#4A90E2] hover:bg-[#3D7EC8] text-white shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
