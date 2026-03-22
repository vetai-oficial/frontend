interface BadgeProps {
  children: React.ReactNode;
  color?: 'red' | 'green' | 'yellow';
}

export const Badge = ({ children, color = 'red' }: BadgeProps) => {
  const colors = {
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[color] || colors.red}`}>
      {children}
    </span>
  );
};
