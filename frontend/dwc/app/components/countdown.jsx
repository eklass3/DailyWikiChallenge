import React, { useState, useEffect } from 'react';

// Target times (in 24-hour format)
const targetTimes = ['11:00', '16:00', '21:00'];

const calculateTimeRemaining = (targetTime) => {
  const now = new Date();
  const [targetHour, targetMinute] = targetTime.split(':').map(Number);

  // Create a Date object for the target time today
  let targetDate = new Date();
  targetDate.setHours(targetHour, targetMinute, 0, 0);

  // If the target time has already passed today, set it for tomorrow
  if (now > targetDate) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const timeDiff = targetDate - now;
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

const Countdown = ({ target, onCountdownComplete }) => {
  const [remainingTime, setRemainingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const updateCountdown = () => {
      // Find the next target time
      // const now = new Date();
      // let nextTargetTime = targetTimes.find(time => {
      //   const [targetHour] = time.split(':').map(Number);
      //   return now.getHours() < targetHour || (now.getHours() === targetHour && now.getMinutes() < Number(time.split(':')[1]));
      // });

      // // If no next target time is found, use the first target time for the next day
      // if (!nextTargetTime) {
      //   nextTargetTime = targetTimes[0];
      // }

      const timeRemaining = calculateTimeRemaining(target);
      setRemainingTime(timeRemaining);

      // Check if the countdown has reached zero
      if (timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
        if (onCountdownComplete) onCountdownComplete();
      }
    };

    updateCountdown(); // Initial update
    const intervalId = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <div>
      <p>⏱️ Next Hint in <b>{`${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`}</b></p>
    </div>
  );
};

export default Countdown;
