import {
  Button,
  Flex,
  IconButton,
  Icon,
  Text,
  useTheme,
  useMediaQuery
} from "@chakra-ui/react";
import { FC } from "react";
import { FaHeart, FaLink, FaRegComment, FaRegHeart } from "react-icons/fa6";
import { PiHandCoins } from "react-icons/pi";
import { PostDTO } from "@coredin/shared";
import { useCustomToast } from "@/hooks";

type PostActionBarProps = {
  post: PostDTO;
  opened: boolean;
  isLiked: boolean;
  isDetailLoading: boolean;
  handleComment: () => void;
  handleLike: () => void;
  handleTip: () => void;
  isLiking: boolean;
  postUrl: string;
};

export const ActionBar: FC<PostActionBarProps> = ({
  post,
  opened,
  isLiked,
  isDetailLoading,
  handleComment,
  handleLike,
  handleTip,
  isLiking,
  postUrl
}) => {
  const theme = useTheme();
  const [isLargerThanSm] = useMediaQuery(
    `(min-width: ${theme.breakpoints.sm})`
  );
  const { successToast } = useCustomToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + postUrl);
    successToast("Post URL copied to clipboard");
  };

  return (
    <>
      <Flex
        w="100%"
        ml="auto"
        justify="start"
        gap={{ base: "none", sm: "1em" }}
        // border="1px solid red"
      >
        <Button
          variant="empty"
          aria-label="Like the post."
          color={isLiked ? "brand.400" : "other.600"}
          _hover={{ color: "brand.400" }}
          // border="1px solid red"
          pr="8px"
          leftIcon={
            isLiked ? (
              <FaHeart fontSize={isLargerThanSm ? "1.25rem" : "0.875rem"} />
            ) : (
              <FaRegHeart fontSize={isLargerThanSm ? "1.25rem" : "0.875rem"} />
            )
          }
          onClick={handleLike}
        >
          <Text
            as="span"
            fontSize={{ base: "0.875rem", sm: "1rem" }}
            opacity={isLiking ? 0 : 1}
            transition={"opacity 1s"}
          >
            {post.likes}
          </Text>
        </Button>

        <IconButton
          icon={
            <FaRegComment fontSize={isLargerThanSm ? "1.25rem" : "0.875rem"} />
          }
          variant="empty"
          aria-label="Add comment."
          color={opened ? "brand.300" : "other.600"}
          onClick={handleComment}
          isLoading={isDetailLoading}
          // border="1px solid red"
        />

        <IconButton
          icon={<FaLink fontSize={isLargerThanSm ? "1.25rem" : "1rem"} />}
          variant="empty"
          aria-label="Share."
          color="other.600"
          onClick={handleShare}
          // border="1px solid red"
        />

        <Button
          variant="empty"
          aria-label="Send tip to promote this post."
          color="other.600"
          leftIcon={
            <Icon
              as={PiHandCoins}
              fontSize={isLargerThanSm ? "1.5rem" : "1.25rem"}
            />
          }
          onClick={handleTip}
          px="10px"
          ml="auto"
          // border="1px solid red"
        >
          <Text as="span" fontSize={{ base: "0.875rem", sm: "1rem" }}>
            {post.tips ? `${(post.tips / 1000000.0).toFixed(2)}` : "0.00"}
          </Text>
        </Button>
      </Flex>
    </>
  );
};
