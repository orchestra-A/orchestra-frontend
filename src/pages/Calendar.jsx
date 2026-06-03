export default function Calendar() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 35 }, (_, i) => i - 2);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-gray-900 text-2xl font-bold mb-2">Calendar</h1>
        <p className="text-gray-500">View your schedule and upcoming deadlines.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {days.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-gray-200 gap-px">
          {dates.map((date, i) => (
            <div key={i} className={`min-h-[100px] p-2 bg-white ${date > 0 && date <= 31 ? 'text-gray-900' : 'text-gray-300 bg-gray-50'}`}>
              <span className={`text-sm font-medium ${date === 14 ? 'bg-[#4A90E2] text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                {date > 0 && date <= 31 ? date : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
