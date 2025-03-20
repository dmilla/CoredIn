import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const launchDate = new Date("12-04-2024");

export const LaunchCountdown = () => {
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date();
      const diff = launchDate.getTime() - now.getTime();
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      const months = Math.floor(
        (diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
      );
      const days = Math.floor(
        (diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
      );
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const timeString = [
        years > 0 ? `${years}y` : "",
        months > 0 ? `${months}m` : "",
        days > 0 ? `${days}d` : "",
        hours > 0 ? `${hours}h` : "",
        minutes > 0 ? `${minutes}m` : "",
        `${seconds}s`
      ]
        .filter(Boolean)
        .join(" | ");

      setRemainingTime(timeString);
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <Box>
      <Text fontSize="1.5rem" color="brand.300" fontWeight="700">
        {remainingTime}
      </Text>
    </Box>
  );
};
