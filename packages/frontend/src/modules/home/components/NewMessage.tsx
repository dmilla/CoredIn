import { BaseServerStateKeys } from "@/constants";
import {
  useCustomToast,
  useLoggedInServerState,
  useMutableServerState
} from "@/hooks";
import { FEED_MUTATIONS } from "@/queries/FeedMutations";
import { CreatePostDTO, PostVisibility } from "@coredin/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useChain } from "@cosmos-kit/react";
import { USER_QUERIES } from "@/queries";
import { NewMessageModal } from ".";
import { chainInfo } from "@/dependencies";

export type NewMessageProps = {
  isOpen: boolean;
  onClose: () => void;
  toUsername: string;
  replyToPostId?: number;
  recipientWallet: string;
};

export const NewMessage: React.FC<NewMessageProps> = ({
  replyToPostId,
  isOpen,
  onClose,
  toUsername,
  recipientWallet
}) => {
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");
  const { mutateAsync, isPending } = useMutableServerState(
    FEED_MUTATIONS.publish()
  );
  const { address } = useChain(chainInfo.chainName);
  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(address || ""),
    { enabled: !!address }
  );
  const { successToast, errorToast } = useCustomToast();

  const handleMessage = async () => {
    console.log(postContent);
    const post: CreatePostDTO = {
      text: postContent,
      visibility: PostVisibility.RECIPIENTS,
      recipientWallets: [recipientWallet]
    };
    await mutateAsync({ post });
    await queryClient.invalidateQueries({
      queryKey: replyToPostId
        ? [BaseServerStateKeys.POST] // todo - handle single post refresh!
        : [BaseServerStateKeys.MESSAGES_FEED]
    });
    setPostContent("");
    onClose();
    successToast("Message sent");
  };

  return (
    <>
      {userProfile && isOpen && (
        <NewMessageModal
          isOpen={isOpen}
          onClose={onClose}
          toUsername={toUsername}
          postContent={postContent}
          setPostContent={setPostContent}
          handleMessage={handleMessage}
          isLoading={isPending}
        />
      )}
    </>
  );
};
