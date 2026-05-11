export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full overflow-y-auto">

      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-zinc-800">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Master Dash</p>
        <p className="text-[10px] tracking-widest text-zinc-600 uppercase mt-0.5">Command Center</p>
        <p className="text-xs text-zinc-500 italic mt-3">"Build the life. Build the freedom."</p>
      </div>

      {/* One Move Today */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-3">One Move Today</p>
        <div className="space-y-4">
          {[
            { label: "Work Move", icon: "💼", text: "Ship the insights dashboard feature." },
            { label: "Wealth Move", icon: "📈", text: "Review and update investment allocations." },
            { label: "Self Move", icon: "❤️", text: "Train, breathe, be present. No work after 9PM." },
          ].map((move) => (
            <div key={move.label} className="flex gap-3">
              <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-sm shrink-0">
                {move.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">{move.label}</p>
                <p className="text-xs text-zinc-300 leading-snug mt-0.5">{move.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Check */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-3">Energy Check</p>
        <div className="space-y-2.5">
          {[
            { label: "Body", value: 7 },
            { label: "Mind", value: 6 },
            { label: "Creative", value: 8 },
            { label: "Social", value: 6 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 w-14">{item.label}</span>
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${item.value * 10}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 w-6 text-right">{item.value}/10</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="px-5 py-5 mt-auto">
        <p className="text-xs text-zinc-500 italic leading-relaxed">
          "Discipline is freedom."
        </p>
        <p className="text-[10px] text-zinc-600 mt-1">— Jocko Willink</p>
      </div>

    </aside>
  );
}
