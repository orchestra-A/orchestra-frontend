import { HelpCircle, Mail, Book } from 'lucide-react';

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 text-center mt-12">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-3xl font-bold">How can we help you?</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#6B905F] dark:bg-[#1A1E2E] border border-gray-200 dark:border-[#2A3142] rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-[#6B905F] dark:text-[#4A90E2] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Book className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-[#1D1E1B] dark:text-white/90 mb-2">Documentation</h3>
          <p className="text-gray-500 dark:text-white/50 text-sm">Read our detailed guides and API documentation.</p>
        </div>
        
        <div className="bg-[#6B905F] dark:bg-[#1A1E2E] border border-gray-200 dark:border-[#2A3142] rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-[#9B59B6] dark:text-[#B97ACD] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-[#1D1E1B] dark:text-white/90 mb-2">Contact Support</h3>
          <p className="text-gray-500 dark:text-white/50 text-sm">Send us an email and we'll get back to you within 24 hours.</p>
        </div>
      </div>
    </div>
  );
}
