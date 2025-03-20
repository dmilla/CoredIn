import { Box } from "@chakra-ui/react";

type NotificationDotProps = {
  ariaLabel: string;
};

export const NotificationDot = ({ ariaLabel }: NotificationDotProps) => {
  return (
    <Box
      bg="brand.300"
      w="7px"
      h="7px"
      borderRadius="50%"
      alignSelf="start"
      ml="-0.25em"
      aria-label={ariaLabel}
    />
  );
};
