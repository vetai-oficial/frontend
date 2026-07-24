interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = '', style, onClick }: CardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
