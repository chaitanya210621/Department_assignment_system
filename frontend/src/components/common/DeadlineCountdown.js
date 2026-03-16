import React, { useState, useEffect } from 'react';

const DeadlineCountdown = ({ deadline, compact = false }) => {
  const [countdown, setCountdown] = useState('');
  const [status, setStatus] = useState('normal'); // normal | warning | critical | overdue

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(deadline);
      const diff = end - now;

      if (diff <= 0) {
        setCountdown('Overdue');
        setStatus('overdue');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 3) {
        setCountdown(`${days}d ${hours}h remaining`);
        setStatus('normal');
      } else if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`);
        setStatus('warning');
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        setStatus('critical');
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
        setStatus('critical');
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const styles = {
    normal: compact
      ? 'text-green-600 text-xs font-medium'
      : 'bg-green-50 text-green-700 border border-green-200',
    warning: compact
      ? 'text-yellow-600 text-xs font-medium'
      : 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    critical: compact
      ? 'text-red-600 text-xs font-medium animate-pulse'
      : 'bg-red-50 text-red-700 border border-red-200 animate-pulse',
    overdue: compact
      ? 'text-red-600 text-xs font-medium'
      : 'bg-red-100 text-red-800 border border-red-300',
  };

  const icons = {
    normal: '🕐',
    warning: '⚡',
    critical: '🔥',
    overdue: '❌',
  };

  if (compact) {
    return (
      <span className={styles[status]}>
        {icons[status]} {countdown}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${styles[status]}`}>
      <span>{icons[status]}</span>
      <span>{countdown}</span>
    </div>
  );
};

export default DeadlineCountdown;
