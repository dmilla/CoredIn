import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { MessagePreviewCard } from "../components";
import { useLoggedInServerState } from "@/hooks";
import { FEED_QUERIES } from "@/queries/FeedQueries";

const MessagesPage = () => {
  const { data: messages } = useLoggedInServerState(FEED_QUERIES.getMessages());

  return (
    <VStack spacing="0.5em" w="100%" layerStyle="cardBox" align="start">
      <Heading as="h1" fontFamily="body" color="brand.900">
        Messages
      </Heading>
      <Text textStyle="sm" mb="1em" mt="-0.75em">
        Send messages to the people you are subscribed to through their profile
        pages.
      </Text>
      <VStack as="ul" spacing="0.5em" w="100%">
        {messages &&
          messages.map((message) => (
            <Box
              as="li"
              w="100%"
              key={`message-${message.creatorUsername}-${message.createdAt}`}
            >
              <MessagePreviewCard initialMessage={message} />
            </Box>
          ))}
      </VStack>
    </VStack>
  );
};

export default MessagesPage;
