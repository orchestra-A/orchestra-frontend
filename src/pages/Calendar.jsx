export default function Calendar() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 35 }, (_, i) => i - 2);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-[#1D1E1B] dark:text-white/90 text-2xl font-bold">Calendar</h1>
      </div>

      <div className="bg-[#F4F1EB] dark:bg-[#1A1E2E] rounded-lg border border-gray-200 dark:border-[#2A3142] shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#2A3142] bg-[#F3F7F1] dark:bg-[#141824]">
          {days.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider border-r border-gray-200 dark:border-[#2A3142] last:border-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-gray-200 dark:bg-[#2A3142] gap-px">
          {dates.map((date, i) => (
            <div key={i} className={`min-h-[100px] p-2 bg-[#F4F1EB] dark:bg-[#1A1E2E] ${date > 0 && date <= 31 ? 'text-[#1D1E1B] dark:text-white/90' : 'text-gray-300 dark:text-white/20 bg-[#F3F7F1] dark:bg-[#141824]'}`}>
              <span className={`text-sm font-medium ${date === 14 ? 'bg-[#6B905F] dark:bg-[#4A90E2] text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                {date > 0 && date <= 31 ? date : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
