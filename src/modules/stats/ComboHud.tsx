import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import './combo-hud.css';

export interface ScorePopup {
  id: number;
  points: number;
  multiplier: number;
}

interface ComboHudProps {
  streak: number;
  multiplier: number;
  score: number;
  popups: ScorePopup[];
}

export function ComboHud({ streak, multiplier, score, popups }: ComboHudProps) {
  return (
    <div className="combo-hud">
      <motion.div
        className="combo-score"
        key={score}
        initial={{ scale: 1.14 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.22 }}
      >
        {score}
      </motion.div>

      <AnimatePresence>
        {multiplier > 1 ? (
          <motion.div
            className={`combo-badge ${multiplier >= 3 ? 'combo-badge-hot' : ''}`}
            initial={{ opacity: 0, y: -8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <Flame size={15} strokeWidth={2.2} />
            <span>×{multiplier.toFixed(1)}</span>
            <small>{streak} seguidas</small>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="combo-popups">
        <AnimatePresence>
          {popups.map((popup) => (
            <motion.div
              key={popup.id}
              className="combo-popup"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -28, scale: 1 }}
              exit={{ opacity: 0, y: -52 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            >
              +{popup.points}
              {popup.multiplier > 1 ? <em>×{popup.multiplier.toFixed(1)}</em> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
