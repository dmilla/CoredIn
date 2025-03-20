import { Box, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { Chat, Post } from "../components";
import { useLoggedInServerState } from "@/hooks";
import { FEED_QUERIES } from "@/queries/FeedQueries";

export const PostPage = () => {
  const { wallet, id } = useParams();
  const { data: postDetail, isLoading: isDetailLoading } =
    useLoggedInServerState(FEED_QUERIES.get(parseInt(id || "0"), wallet!), {
      enabled: !!id && !!wallet,
      refetchInterval: 5000,
      refetchIntervalInBackground: true
    });

  if (!id || !wallet) {
    return "This post does not exist.";
  }
  // console.log(postDetail);

  return (
    <>
      {postDetail?.recipients && postDetail.recipients.length > 0 ? (
        <Chat message={postDetail} />
      ) : (
        <Box layerStyle="cardBox">
          {postDetail && <Post post={postDetail} />}
          {!postDetail && <Text>Post not found...</Text>}
        </Box>
      )}
    </>
  );
};
