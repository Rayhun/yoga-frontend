'use client';

import { useState, useEffect, useCallback } from 'react';

const JoinOnboardResendOTP = ({ duration = 120, promptText, actionLabel, onResend }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(duration);
    setIsTimerRunning(true);
  }, [duration]);

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const handleResendClick = useCallback(() => {
    onResend?.();
    setTimeLeft(duration);
    setIsTimerRunning(true);
  }, [duration, onResend]);

  return (
    <p className="text-center text-sm text-gray-500">
      {promptText || "Didn't get a code?"}{' '}
      {isTimerRunning ? (
        <span className="text-gray-400">
          Resend in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResendClick}
          className="font-semibold text-[#C17A3C] underline-offset-2 hover:underline"
        >
          {actionLabel || 'Resend'}
        </button>
      )}
    </p>
  );
};

export default JoinOnboardResendOTP;
