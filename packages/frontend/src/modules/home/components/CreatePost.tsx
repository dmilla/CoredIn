import { BaseServerStateKeys } from "@/constants";
import {
  useCustomToast,
  useLoggedInServerState,
  useMutableServerState
} from "@/hooks";
import { USER_QUERIES } from "@/queries";
import { FEED_MUTATIONS } from "@/queries/FeedMutations";
import { ROUTES } from "@/router/routes";
import { formElementBorderStyles } from "@/themes";
import {
  Avatar,
  Button,
  Flex,
  Link,
  useDisclosure,
  useMediaQuery,
  useTheme
} from "@chakra-ui/react";
import {
  CreatePostDTO,
  PostRequestType,
  PostVisibility,
  SkillTag
} from "@coredin/shared";
import { useChain } from "@cosmos-kit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Link as ReactRouterLink,
  useLocation,
  useParams
} from "react-router-dom";
import { CreatePostModal } from "./CreatePostModal";
import { chainInfo } from "@/dependencies";

export const CreatePost = () => {
  const queryClient = useQueryClient();
  const chainContext = useChain(chainInfo.chainName);
  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(chainContext.address || ""),
    { enabled: !!chainContext.address }
  );
  const {
    mutateAsync,
    isPending,
    error: publishError
  } = useMutableServerState(FEED_MUTATIONS.publish());
  const { errorToast } = useCustomToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postContent, setPostContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>(
    PostVisibility.PUBLIC
  );
  const [requestType, setRequestType] = useState<PostRequestType | undefined>(
    undefined
  );
  const [skillTags, setSkillTags] = useState<SkillTag[]>([]);
  const theme = useTheme();
  const [isLargerThanSm] = useMediaQuery(
    `(min-width: ${theme.breakpoints.sm})`
  );

  const { "*": embedURL } = useParams();
  const location = useLocation();

  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const isYouTubeURL = (url: string) => {
    return youtubeRegex.test(url);
  };

  const sanitizeYouTubeURL = (url: string) => {
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url; // prevent embedding invalid URLs
  };

  useEffect(() => {
    if (publishError) {
      errorToast(publishError.message);
    }
  }, [publishError]);

  useEffect(() => {
    const url = embedURL + location.search;
    if (url && isYouTubeURL(url)) {
      const sanitizedURL = sanitizeYouTubeURL(url);

      console.log("sanitizedURL", sanitizedURL);
      const embedHTML = `<iframe class="ql-video ql-align-center" frameborder="0" allowfullscreen="true" src="${sanitizedURL}" data-blot-formatter-id="lgupr" width="500px" height="300px""></iframe>`;
      setPostContent(embedHTML);
      onOpen();
    }
  }, [embedURL, location]);

  const handlePost = async () => {
    const post: CreatePostDTO = {
      text: postContent,
      visibility,
      requestType,
      skillTags
    };
    // console.log("post", post);
    await mutateAsync({ post });
    await queryClient.invalidateQueries({
      queryKey: [BaseServerStateKeys.FEED]
    });
    resetModalContent();
    onClose();
  };

  const resetModalContent = () => {
    setRequestType(undefined);
    setVisibility(PostVisibility.PUBLIC);
    setSkillTags([]);
    setPostContent("");
  };

  return (
    <>
      <Flex gap="1.125em" layerStyle="cardBox" w="100%">
        <Link
          as={ReactRouterLink}
          to={ROUTES.USER.buildPath(userProfile?.wallet || "")}
        >
          <Avatar
            name={userProfile?.username}
            src={userProfile?.avatarUrl}
            size={{ base: "sm", sm: "md" }}
            bg="brand.100"
            color={userProfile?.avatarFallbackColor || "brand.500"}
            border={userProfile?.avatarUrl || "1px solid #b0b0b0"}
          />
        </Link>
        <Button
          w="100%"
          h="48px"
          bg="none"
          {...formElementBorderStyles}
          _active={{
            bg: "transparent"
          }}
          color="other.600"
          fontSize={{ base: "0.875rem", lg: "1rem" }}
          fontWeight="400"
          textTransform="none"
          justifyContent="start"
          onClick={onOpen}
        >
          {isLargerThanSm
            ? "Create a post or share a work opportunity"
            : "Create a post"}
        </Button>
      </Flex>

      <CreatePostModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          resetModalContent();
        }}
        setPostContent={setPostContent}
        setRequestType={setRequestType}
        setVisibility={setVisibility}
        userProfile={userProfile}
        requestType={requestType}
        visibility={visibility}
        skillTags={skillTags || []}
        setSkillTags={(newTags: SkillTag[]) => setSkillTags(newTags)}
        postContent={postContent}
        handlePost={handlePost}
        isPending={isPending}
      />
    </>
  );
};
