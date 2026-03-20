interface BadgeProps {
  label: string;
  color: string; // CSS color value
  className?: string;
}

export default function Badge({ label, color, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}
      style={{
        background: `${color}22`,
        color,
        borderColor: `${color}44`,
      }}
    >
      {label}
    </span>
  );
}
