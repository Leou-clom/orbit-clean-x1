import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import './stats-card.css';

export type StatTone = 'cyan' | 'green' | 'amber' | 'violet' | 'rose';

export interface StatsCardProps {
  title: string;
  value: string | number;
  detail?: string;
  change?: number;
  icon: LucideIcon;
  tone?: StatTone;
  index?: number;
}

export function StatsCard({
  title,
  value,
  detail,
  change,
  icon: Icon,
  tone = 'cyan',
  index = 0,
}: StatsCardProps) {
  return (
    <motion.article
      className={`stats-card stats-card-${tone}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
    >
      <div className="stats-card-glow" aria-hidden="true" />

      <div className="stats-card-row">
        <div className="stats-card-text">
          <p className="stats-card-title">{title}</p>

          <motion.h3
            className="stats-card-value"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32, delay: index * 0.07 + 0.12 }}
          >
            {value}
          </motion.h3>

          {detail ? <p className="stats-card-detail">{detail}</p> : null}

          {change !== undefined ? (
            <p className={`stats-card-change ${change < 0 ? 'stats-card-change-down' : ''}`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}
            </p>
          ) : null}
        </div>

        <span className="stats-card-icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.8} />
        </span>
      </div>
    </motion.article>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return <div className="stats-grid">{children}</div>;
}
