import { Bot, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

export default function ProjectAI() {
  const { projectId } = useParams();
  const { projects } = useProject();
  const decodedId = decodeURIComponent(projectId || "");
  const project = projects.find(p => p.id === decodedId || p.id === projectId);
  const projectName = project ? project.name : "Project";
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">{projectName} - AI</h1>
      </div>

      <div className="flex-1 bg-[#F4F1EB] dark:bg-[#121910] border border-gray-200 dark:border-[#2B3B26] rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto bg-[#F3F7F1] dark:bg-transparent">
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-[#6B905F] dark:bg-[#2B3B26] border border-gray-200 dark:border-transparent p-4 rounded-2xl rounded-tl-sm text-sm text-gray-700 dark:text-white/90 shadow-sm max-w-[80%]">
              Hello! I'm the AI assistant for {projectName}. How can I help you today? I can analyze tasks, suggest workflow improvements, or generate reports.
            </div>
          </div>
          
        </div>
        
        <div className="p-4 bg-[#F4F1EB] dark:bg-[#121910] border-t border-gray-200 dark:border-[#2B3B26]">
          <div className="relative flex items-center gap-2">
            <Input placeholder="Ask the AI something about this project..." className="flex-1 bg-[#F3F7F1] dark:bg-[#1C2618] border-gray-200 dark:border-[#2B3B26] text-[#1D1E1B] dark:text-white/90" />
            <Button size="icon" className="bg-[#6B905F] dark:bg-[#6B905F] hover:bg-[#5A7A4F] dark:hover:bg-[#6B905F] text-white shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
