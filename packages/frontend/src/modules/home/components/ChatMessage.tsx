import { Box, Text } from "@chakra-ui/react";
import { FC } from "react";

type ChatMessageProps = {
  messageText: string;
  isMyOwnMessage: boolean;
  createdAt: string;
};

export const ChatMessage: FC<ChatMessageProps> = ({
  messageText,
  isMyOwnMessage,
  createdAt
}) => {
  return (
    <Box
      bg={isMyOwnMessage ? "brand.500" : "brand.200"}
      color={isMyOwnMessage ? "brand.100" : "brand.900"}
      px="0.75em"
      py="0.5em"
      borderRadius="0.75em"
      borderBottomLeftRadius={isMyOwnMessage ? "" : "0"}
      borderBottomRightRadius={isMyOwnMessage ? "0" : ""}
      maxW="80%"
      alignSelf={isMyOwnMessage ? "end" : "start"}
      //   mt="auto"
    >
      <Text
        lineHeight="1.25"
        textStyle="sm"
        //
      >
        {messageText}
      </Text>
      <Text
        as="time"
        dateTime=""
        color={isMyOwnMessage ? "brand.100" : "brand.900"}
        textStyle="sm"
        fontSize={{ base: "0.75rem", lg: "0.875rem" }}
        userSelect="none"
      >
        {new Date(createdAt).toLocaleTimeString()}
        <Text as="span" fontSize="0.75em" whiteSpace="pre-wrap">
          {"    •    "}
        </Text>
        {new Date(createdAt).toLocaleDateString()}
      </Text>
    </Box>
  );
};
