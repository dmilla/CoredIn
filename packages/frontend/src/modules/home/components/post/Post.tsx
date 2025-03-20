import {
  useFlag,
  useLoggedInServerState,
  useMutableServerState
} from "@/hooks";
import { USER_QUERIES } from "@/queries";
import { FEED_MUTATIONS } from "@/queries/FeedMutations";
import { FEED_QUERIES } from "@/queries/FeedQueries";
import { Text, VStack, Tag, Flex } from "@chakra-ui/react";
import { FEATURE_FLAG, PostDTO, PostInfo } from "@coredin/shared";
import { useChain } from "@cosmos-kit/react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import { Content, TippingModal } from "./components";
import { useParams } from "react-router-dom";
import { BaseServerStateKeys } from "@/constants";
import { CoredinClientContext } from "@/contexts/CoredinClientContext";
import { coin } from "@cosmjs/amino";
import { NewReply } from "./components";
import { chainInfo } from "@/dependencies";

export type PostProps = {
  post: PostDTO;
  isParent?: boolean;
  isReply?: boolean;
};

export const Post: React.FC<PostProps> = ({ post, isParent, isReply }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: like, isPending: isLiking } = useMutableServerState(
    FEED_MUTATIONS.likePost()
  );
  const { mutateAsync: deletePost, isPending: isDeleting } =
    useMutableServerState(FEED_MUTATIONS.deletePost());
  const { mutateAsync: hidePost } = useMutableServerState(
    FEED_MUTATIONS.hidePost()
  );
  const { mutateAsync: tipPost } = useMutableServerState(
    FEED_MUTATIONS.tipPost()
  );
  const chainContext = useChain(chainInfo.chainName);
  const coredinClient = useContext(CoredinClientContext);

  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(chainContext.address || ""),
    {
      enabled: !!chainContext.address
    }
  );
  const [isLiked, setIsLiked] = React.useState(
    userProfile?.likedPosts.includes(post.id) || false
  );

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState(10);

  const { id: postId } = useParams();
  const [opened, setOpened] = React.useState(
    isParent ?? Number(postId) === post.id ?? false
  );
  const { data: postDetail, isLoading: isDetailLoading } =
    useLoggedInServerState(FEED_QUERIES.get(post.id, post.creatorWallet), {
      enabled: opened
    });

  const [isBoosted, setIsBoosted] = React.useState(
    post.boostedUntil && new Date(post.boostedUntil) > new Date()
  );
  const [remainingTime, setRemainingTime] = useState("");
  const canHide = useFlag(FEATURE_FLAG.HIDE_POSTS);

  useEffect(() => {
    setIsLiked(userProfile?.likedPosts.includes(post.id) || false);
  }, [userProfile?.likedPosts]);

  useEffect(() => {
    const updateRemainingTime = () => {
      if (post.boostedUntil) {
        const now = new Date();
        const boostedUntil = new Date(post.boostedUntil);
        if (boostedUntil > now) {
          const diff = boostedUntil.getTime() - now.getTime();
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
          setIsBoosted(true);
        } else {
          setIsBoosted(false);
          setRemainingTime("");
        }
      }
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [post.boostedUntil]);

  const handleLike = () => {
    console.log(post);
    like({ postId: post.id, liked: !isLiked }).then(() => {
      queryClient.invalidateQueries({
        queryKey: [BaseServerStateKeys.FEED]
      });
      queryClient.invalidateQueries({
        queryKey: [BaseServerStateKeys.POST]
      });
      // queryClient.invalidateQueries({
      //   queryKey: [BaseServerStateKeys.USER]
      // });
    });
    setIsLiked((prev) => !prev);
  };

  const handleComment = async () => {
    if (isParent) {
      return;
    }

    setOpened(!opened);
  };

  const handleDelete = async () => {
    await deletePost({ postId: post.id }).then(() => {
      queryClient.invalidateQueries();
    });
  };

  const handleHide = async () => {
    await hidePost({ postId: post.id }).then(() => {
      queryClient.invalidateQueries();
    });
  };

  const handleTipClick = async () => {
    setIsTipModalOpen(true);
  };

  const handleTip = async (): Promise<boolean> => {
    const tipCoins = coin(tipAmount * 1.05 * 1_000_000, chainInfo.feeDenom);

    const postInfo: PostInfo = {
      id: post.id.toString(),
      author: post.creatorWallet,
      created_on: "0",
      hash: "", // Correctly hash the post content
      post_type: "Microblog",
      vault: tipCoins
    };

    try {
      const tx = await coredinClient?.tipPostAuthor(
        { postInfo },
        "auto",
        undefined,
        [tipCoins]
      );

      if (tx && tx.transactionHash) {
        await tipPost({
          postId: post.id,
          tip: tipCoins,
          txHash: tx.transactionHash
        });
        queryClient.invalidateQueries();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error tipping post:", error);
      return false;
    }
  };
  return (
    <>
      {isBoosted && (
        <Flex justify="start" w="100%" mb="-10px">
          <Flex justify="end" w="100%">
            <Tag
              size="sm"
              color="brand.100"
              backgroundColor="brand.300"
              animation="pulse 2s infinite"
              borderBottomRadius="0"
              borderTopRadius="10"
            >
              Boost duration: {remainingTime}
            </Tag>
          </Flex>
        </Flex>
      )}
      <VStack
        align="start"
        spacing="0.5em"
        w="100%"
        h="max-content"
        layerStyle="cardBox"
        py="1em"
        // borderTopLeftRadius={isBoosted ? "0" : undefined}
        borderTopRightRadius={isBoosted ? "0" : undefined}
        borderColor={isBoosted ? "brand.300" : "brand.100"}
        _hover={{
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease-in-out"
        }}
        transition="all 0.3s ease-in-out"
      >
        {postDetail?.parent && !isReply && (
          <Content
            post={postDetail.parent}
            showOptions={
              postDetail.parent.creatorWallet === chainContext.address
            }
            canHide={canHide}
            key={postDetail.parent.id}
            isDeleting={isDeleting}
            handleDelete={handleDelete}
            handleHide={handleHide}
            opened={opened}
            isLiked={isLiked}
            isLiking={isLiking}
            isDetailLoading={isDetailLoading}
            handleComment={handleComment}
            handleLike={handleLike}
            handleTip={handleTip}
          />
        )}
        {postDetail && !postDetail.parent && post.replyToPostId && (
          <Text>
            This post is a reply to a post that has been deleted by its author
          </Text>
        )}
        <Content
          post={post}
          showOptions={post.creatorWallet === chainContext.address}
          canHide={canHide}
          isDeleting={isDeleting}
          handleDelete={handleDelete}
          handleHide={handleHide}
          opened={opened}
          isLiked={isLiked}
          isLiking={isLiking}
          isDetailLoading={isDetailLoading}
          handleComment={handleComment}
          handleLike={handleLike}
          handleTip={handleTipClick}
        />
        {opened && !isParent && <NewReply replyToPostId={post.id} />}
        {opened &&
          postDetail &&
          postDetail.replies.map((reply) => (
            <Post key={reply.id} post={reply} isReply={true} />
          ))}
      </VStack>
      <TippingModal
        tipAmount={tipAmount}
        setTipAmount={setTipAmount}
        handleTip={handleTip}
        isTipModalOpen={isTipModalOpen}
        setIsTipModalOpen={setIsTipModalOpen}
      />
    </>
  );
};
