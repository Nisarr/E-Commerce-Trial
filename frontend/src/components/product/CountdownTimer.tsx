import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string | Date;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(deadline) - +new Date();
      let timeLeft = null;

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 bg-accent/5 border border-accent/10 rounded-2xl p-4 animate-in fade-in zoom-in duration-700">
      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
        <Clock size={20} className="animate-pulse" />
      </div>
      <div>
        <p className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">Offer Ends In:</p>
        <div className="flex gap-2">
          {[
            { label: 'D', value: timeLeft.days },
            { label: 'H', value: timeLeft.hours },
            { label: 'M', value: timeLeft.minutes },
            { label: 'S', value: timeLeft.seconds },
          ].map((item, i) => (
            <div key={i} className="flex items-baseline gap-0.5">
              <span className="text-sm font-black text-primary tabular-nums">{item.value.toString().padStart(2, '0')}</span>
              <span className="text-[8px] font-bold text-muted/40 uppercase">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
