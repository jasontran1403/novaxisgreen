import { useState, useEffect } from 'react';

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date (5 days from now)
    const target = new Date().getTime() + 5 * 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <div className="text-center">
        <div className="text-4xl font-bold text-cyan-400 mb-2">
          {timeLeft.days}
        </div>
        <div className="text-sm text-gray-400">Days</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-cyan-400 mb-2">
          {timeLeft.hours}
        </div>
        <div className="text-sm text-gray-400">Hours</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-cyan-400 mb-2">
          {timeLeft.minutes}
        </div>
        <div className="text-sm text-gray-400">Minutes</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-cyan-400 mb-2">
          {timeLeft.seconds}
        </div>
        <div className="text-sm text-gray-400">Seconds</div>
      </div>
    </div>
  );
}

export default CountdownTimer;

