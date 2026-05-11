export default function Sidebar() {
  const moves = [
    { label: "Work", text: "Ship the insights dashboard feature." },
    { label: "Wealth", text: "Review and update investment allocations." },
    { label: "Self", text: "Train, breathe, be present. No work after 9PM." },
  ]

  const energy = [
    { label: "Body", value: 7 },
    { label: "Mind", value: 6 },
    { label: "Creative", value: 8 },
    { label: "Social", value: 6 },
  ]

  return (
    <aside className="w-52 shrink-0 border-r border-blue-900/20 flex flex-col h-full overflow-y-auto bg-[#0b0d14]">

      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-zinc-300 uppercase">Master Dash</p>
        <p className="text-[9px] tracking-[0.18em] text-zinc-600 uppercase mt-0.5">Command Center</p>
        <p className="text-[11px] text-zinc-500 italic mt-4 leading-relaxed">"Build the life.<br />Build the freedom."</p>
      </div>

      <div className="mx-6 h-px bg-zinc-800/60" />

      {/* One Move Today */}
      <div className="px-6 py-5">
        <p className="text-[9px] font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-4">One Move Today</p>
        <div className="space-y-4">
          {moves.map((move) => (
            <div key={move.label}>
              <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.16em] mb-1">{move.label}</p>
              <p className="text-[12px] text-zinc-300 leading-snug">{move.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-6 h-px bg-zinc-800/60" />

      {/* Energy Check */}
      <div className="px-6 py-5">
        <p className="text-[9px] font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-4">Energy Check</p>
        <div className="space-y-3">
          {energy.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500 w-12 shrink-0">{item.label}</span>
              <div className="flex-1 h-px bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-500 rounded-full transition-all"
                  style={{ width: `${item.value * 10}%` }}
                />
              </div>
              <span className="text-[9px] text-zinc-700 w-4 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-6 h-px bg-zinc-800/60" />

      {/* Current Mode */}
      <div className="px-6 py-4">
        <p className="text-[9px] font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-1.5">Current Mode</p>
        <p className="text-[11px] font-medium text-amber-600/90 tracking-wide">Deep Work</p>
      </div>

      {/* Quote */}
      <div className="px-6 py-5 mt-auto">
        <div className="h-px bg-zinc-800/60 mb-5" />
        <p className="text-[11px] text-zinc-500 italic leading-relaxed">
          "Discipline is freedom."
        </p>
        <p className="text-[9px] text-zinc-700 mt-1.5 tracking-wide">— Jocko Willink</p>
      </div>

    </aside>
  )
}
