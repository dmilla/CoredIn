import { AutoResizeTextarea } from "@/components";
import { ROUTES } from "@/router/routes";
import { ArrowBackIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure
} from "@chakra-ui/react";
import { FC, useContext, useRef, useState } from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import { ChatMessage } from ".";
import { FaArrowUp, FaEllipsis, FaTrash } from "react-icons/fa6";
import { useChatScroll } from "../hooks";
import { CreatePostDTO, PostDetailDTO, PostVisibility } from "@coredin/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
  useContractRead,
  useCustomToast,
  useMutableServerState
} from "@/hooks";
import { FEED_MUTATIONS } from "@/queries/FeedMutations";
import { BaseServerStateKeys } from "@/constants";
import { useChain } from "@cosmos-kit/react";
import { CONTRACT_QUERIES } from "@/queries";
import { CoredinClientContext } from "@/contexts/CoredinClientContext";
import { chainInfo } from "@/dependencies";

type ChatProps = {
  message: PostDetailDTO;
};

export const Chat: FC<ChatProps> = ({ message }) => {
  const conversation = [message, ...message.replies];
  const ref = useChatScroll(conversation);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutableServerState(
    FEED_MUTATIONS.publish()
  );
  const { mutateAsync: deletePost, isPending: isDeleting } =
    useMutableServerState(FEED_MUTATIONS.deletePost());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isTooltipOpen,
    onOpen: onTooltipOpen,
    onClose: onTooltipClose
  } = useDisclosure();
  const coredinClient = useContext(CoredinClientContext);
  const { data: profileDid } = useContractRead(
    CONTRACT_QUERIES.getWalletDid(
      coredinClient!,
      message.recipients?.[0].wallet
    ),
    { enabled: !!coredinClient }
  );
  const { data: subscriptionInfo } = useContractRead(
    CONTRACT_QUERIES.getSubscriptionInfo(
      coredinClient!,
      profileDid?.did_info?.did ?? { value: "" },
      message.creatorWallet
    ),
    {
      enabled: !!coredinClient && !!profileDid?.did_info?.did
    }
  );
  const chainContext = useChain(chainInfo.chainName);
  const cancelRef = useRef(null);
  const { successToast } = useCustomToast();
  const navigate = useNavigate();

  const creatorIsTheLoggedInUser =
    message.creatorWallet === chainContext.address;

  const subscriptionInfoValidUntil = new Date(
    subscriptionInfo?.valid_until
      ? parseInt(subscriptionInfo.valid_until) / 1000000 // Contract timestamp in nanoseconds!
      : Date.now() - 1
  );

  const hasActiveSubscription = subscriptionInfoValidUntil > new Date();

  const handleSendMessage = async () => {
    const post: CreatePostDTO = {
      text: newMessage,
      visibility: PostVisibility.PRIVATE,
      replyToPostId: message.id
    };
    await mutateAsync({ post });
    await queryClient.invalidateQueries({
      queryKey: [BaseServerStateKeys.POST]
    });
    setNewMessage("");
  };

  const handleDelete = async () => {
    console.log("message id", message.id);
    await deletePost({ postId: message.id }).then(() => {
      queryClient.invalidateQueries();
    });
    navigate(ROUTES.MESSAGES.path);
    successToast("Message deleted successfully");
  };
  console.log("message", message);

  return (
    <Flex
      layerStyle="cardBox"
      p="1em"
      direction="column"
      gap="1em"
      h={{ base: "72dvh", sm: "78dvh", lg: "91vh" }}
      //   border="1px solid red"
    >
      <Flex
        justify="space-between"
        align="center"
        // border="1px solid black"
        //
      >
        <Link
          as={ReactRouterLink}
          to={ROUTES.MESSAGES.path}
          _hover={{ textDecoration: "none" }}
        >
          <Icon as={ArrowBackIcon} />
        </Link>
        <HStack spacing="0.5em">
          <Link
            as={ReactRouterLink}
            to={
              creatorIsTheLoggedInUser
                ? ROUTES.USER.buildPath(message.recipients?.[0].wallet)
                : ROUTES.USER.buildPath(message.creatorWallet)
            }
            _hover={{ textDecoration: "none" }}
          >
            <HStack>
              <Avatar
                name={
                  creatorIsTheLoggedInUser
                    ? message.recipients?.[0].username
                    : message.creatorUsername
                }
                src={
                  creatorIsTheLoggedInUser
                    ? message.recipients?.[0].avatarUrl
                    : message.creatorAvatar
                }
                bg="brand.100"
                color={
                  creatorIsTheLoggedInUser
                    ? message.recipients?.[0].creatorFallbackColor
                    : message.creatorAvatarFallbackColor || "brand.500"
                }
                border={
                  !creatorIsTheLoggedInUser && message.creatorAvatar
                    ? "none"
                    : creatorIsTheLoggedInUser &&
                        message.recipients?.[0].avatarUrl
                      ? "none"
                      : "1px solid #b0b0b0"
                }
                size={{ base: "xs", sm: "sm" }}
              />
              <Text as="span" textStyle="sm">
                {creatorIsTheLoggedInUser
                  ? message.recipients?.[0].username
                  : message.creatorUsername}
              </Text>
            </HStack>
          </Link>
          <Tooltip
            label={
              hasActiveSubscription
                ? creatorIsTheLoggedInUser
                  ? `Your subscription expires on ${subscriptionInfoValidUntil.toLocaleString()}`
                  : `This user's subscription expires on ${subscriptionInfoValidUntil.toLocaleString()}`
                : creatorIsTheLoggedInUser
                  ? `Your subscription expired on ${subscriptionInfoValidUntil.toLocaleString()}`
                  : `This user's subscription expired on ${subscriptionInfoValidUntil.toLocaleString()}`
            }
            isOpen={isTooltipOpen}
            //
          >
            <Button
              as={InfoOutlineIcon}
              aria-label="Show info about this chat."
              variant="empty"
              color="brand.200"
              _hover={{ color: "brand.200" }}
              size={{ base: "0.875rem", lg: "1rem" }} // === textStyle="sm"
              onMouseEnter={onTooltipOpen}
              onMouseLeave={onTooltipClose}
            />
          </Tooltip>
        </HStack>
        {creatorIsTheLoggedInUser && (
          <Menu placement="bottom-end" autoSelect={false}>
            <MenuButton
              as={IconButton}
              variant="empty"
              color="other.600"
              aria-label="See menu."
              icon={<FaEllipsis fontSize="1.5rem" />}
              size="lg"
              h="24px"
              isLoading={isDeleting}
            />
            <MenuList>
              <MenuItem onClick={onOpen} icon={<FaTrash color="red" />}>
                <Text as="span" color="red">
                  Delete
                </Text>
              </MenuItem>
            </MenuList>
          </Menu>
        )}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          motionPreset="slideInBottom"
          isCentered
          closeOnEsc
          closeOnOverlayClick
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader
                fontSize={{ base: "1.25rem", lg: "1.5rem" }}
                fontWeight="700"
                textTransform="uppercase"
              >
                Delete message
              </AlertDialogHeader>

              <AlertDialogBody>
                <Text>
                  Are you sure? You can't undo this action afterwards.
                </Text>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  variant="empty"
                  color="other.600"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  bg="brand.400"
                  onClick={handleDelete}
                  ml="1.5em"
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
      <Flex
        ref={ref}
        as="section"
        direction="column"
        gap="0.5em"
        layerStyle="cardBox"
        p="1em"
        pb="0"
        h="100%"
        overflow="auto"
      >
        {conversation.map((chatMessage) => (
          <ChatMessage
            key={chatMessage.id}
            messageText={chatMessage.text}
            isMyOwnMessage={chatMessage.creatorWallet === chainContext.address}
            createdAt={chatMessage.createdAt}
          />
        ))}
      </Flex>
      {hasActiveSubscription ? (
        <Flex
          gap="0.75em"
          // border="1px solid green"
          //
        >
          <AutoResizeTextarea
            maxH="160px"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            variant="primary"
            size="sm"
            h="100%"
            onClick={handleSendMessage}
            isLoading={isPending}
            isDisabled={!newMessage}
            aria-label="post"
            px="0"
          >
            <Icon as={FaArrowUp} />
          </Button>
        </Flex>
      ) : (
        <Center
          flexDirection="column"
          gap="0.5em"
          bg="brand.400"
          borderRadius="1.125em"
          textAlign="center"
          px="1em"
          py="1em"
        >
          <Text color="brand.100" textStyle="md">
            There is no active subscription
          </Text>
          <Text color="brand.900" textStyle="sm">
            Subscribe to this user's profile to be able to send a message in
            this chat
          </Text>
        </Center>
      )}
    </Flex>
  );
};
