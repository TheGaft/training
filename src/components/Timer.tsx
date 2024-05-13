import { FC, useMemo } from 'react';
import { useCountdown } from 'rooks';

export const Timer: FC<{ minutes: number; options?: any }> = ({
  minutes,
  options,
}) => {
  
  const endTime = useMemo(
    () => new Date(Date.now() + minutes * 60 * 1000),
    [minutes]
  );

  const count = useCountdown(endTime, {
    interval: 1000,
    ...options,
  });
  
  return (
    <span>
      Timer: {Math.floor(count / 60)}:{(count % 60).toString().padStart(2, '0')}
    </span>
  );
};
