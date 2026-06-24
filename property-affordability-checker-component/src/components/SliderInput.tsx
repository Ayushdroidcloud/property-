interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  formatDisplay: (v: number) => string;
}

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatDisplay,
}: SliderProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2.5">
        <label className="text-sm font-semibold text-[#212529]">{label}</label>
        <span className="text-sm font-bold text-[#0F5132] bg-[#d1e7dd] px-3 py-1 rounded-full whitespace-nowrap">
          {formatDisplay(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #0F5132 ${pct}%, #dee2e6 ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
        <span>{formatDisplay(min)}</span>
        <span>{formatDisplay(max)}</span>
      </div>
    </div>
  );
}
