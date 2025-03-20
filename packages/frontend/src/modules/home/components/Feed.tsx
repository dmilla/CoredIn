import { Box, Text, VStack } from "@chakra-ui/react";
import { Post } from ".";
import { PostDTO } from "@coredin/shared";
import { FC } from "react";

export type FeedProps = {
  posts: PostDTO[];
};

export const Feed: FC<FeedProps> = ({ posts }) => {
  return (
    <VStack spacing="0.5em" w="100%">
      {posts.length > 0 ? (
        posts.map((post) => <Post key={`post-${post.id}`} post={post} />)
      ) : (
        <Box p="1em" w="100%">
          <Text textStyle="sm" color="other.600">
            There is no activity here yet.
          </Text>
        </Box>
      )}
    </VStack>
  );
};
