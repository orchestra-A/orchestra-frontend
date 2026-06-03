import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function Todo() {
  const tasks = [
    { id: 1, title: 'Review marketing copy', project: 'Project 1', due: 'Today', status: 'pending' },
    { id: 2, title: 'Update dependencies', project: 'Project 2', due: 'Tomorrow', status: 'completed' },
    { id: 3, title: 'Prepare Q3 roadmap slides', project: 'General', due: 'Next Week', status: 'pending' },
  ];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-gray-900 text-2xl font-bold mb-2">My Tasks</h1>
        <p className="text-gray-500">Track and manage your daily to-dos.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {tasks.map(task => (
            <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <button className={`text-${task.status === 'completed' ? 'green' : 'gray'}-400 hover:text-green-500`}>
                {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{task.project}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                <Clock className="w-3.5 h-3.5" />
                <span>{task.due}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
