import { Text, TextProps } from "@chakra-ui/layout";
import { FC } from "react";

type DisclaimerTextProps = TextProps & {
  size?: "xs" | "sm";
};

export const DisclaimerText: FC<DisclaimerTextProps> = ({
  size = "sm",
  ...props
}) => {
  return (
    <Text color="other.600" textStyle={size} whiteSpace="pre-line" {...props}>
      {`Welcome to the first release of cored.in!
      We encourage you to explore and provide feedback on Discord.`}
    </Text>
  );
};
