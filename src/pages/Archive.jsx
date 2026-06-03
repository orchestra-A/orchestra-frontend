import { Archive as ArchiveIcon } from 'lucide-react';

export default function Archive() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ArchiveIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h1 className="text-gray-900 text-2xl font-bold mb-2">Archive</h1>
      <p className="text-gray-500 max-w-sm mb-6">Your archived projects and tasks will appear here. Currently, there are no items in your archive.</p>
    </div>
  );
}
