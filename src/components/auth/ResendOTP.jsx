import { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';

const ResendOTP = ({ duration = 120, onResend }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;

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
  }, [isTimerRunning, timeLeft, onResend]);

  const handleResendClick = useCallback(() => {
    onResend();
    setTimeLeft(duration);
    setIsTimerRunning(true);
  }, [duration, onResend]);

  return (
    <div className="flex gap-1 text-sm">
      <p>Did not receive OTP?</p>
      <p className="w-[60px] text-center text-primary">{formatTime(timeLeft)}</p>
      <Button
        variant="secondary"
        size="sm"
        disabled={isTimerRunning}
        className="!w-fit !text-xs"
        onClick={handleResendClick}
      >
        Resend OTP
      </Button>
    </div>
  );
};

export default ResendOTP;
