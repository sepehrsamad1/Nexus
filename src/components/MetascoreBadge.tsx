import { cn } from '@/lib/utils';

interface MetascoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MetascoreBadge({ score, label, size = 'md', className }: MetascoreBadgeProps) {
  // Metacritic style color logic
  let bgColor = "bg-metascore-low"; // Rose 500
  if (score >= 75) bgColor = "bg-metascore-high"; // Emerald 500
  else if (score >= 50) bgColor = "bg-metascore-mid text-zinc-900"; // Amber 500 (needs darker text)
  else bgColor = "bg-metascore-low"; // Rose 500
  
  if (score === 0) bgColor = "bg-zinc-700"; // Unrated

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl"
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center font-black rounded-lg shadow-sm border border-black/20",
        bgColor,
        score >= 50 && score < 75 ? "text-zinc-950" : "text-white",
        sizeClasses[size]
      )}>
        {score > 0 ? score : 'tbd'}
      </div>
      {label && (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">{label}</span>
          <span className="text-xs text-zinc-400">
            {score >= 75 ? 'Universal Acclaim' : score >= 50 ? 'Mixed or Average' : score > 0 ? 'Generally Unfavorable' : 'Not yet reviewed'}
          </span>
        </div>
      )}
    </div>
  );
}
