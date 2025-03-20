import { FC, useRef } from "react";
import { PostDTO, PostVisibility } from "@coredin/shared";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Button,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import { FaBan, FaEllipsis, FaTrash } from "react-icons/fa6";
import { ActionBar } from "./ActionBar";
import { Link as ReactRouterLink } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import RichTextEditorQuillHook from "../../RichTextEditorQuillHook";

export type PostContentProps = {
  post: PostDTO;
  handleDelete?: () => void;
  isDeleting?: boolean;
  opened: boolean;
  isLiked: boolean;
  isLiking: boolean;
  isDetailLoading: boolean;
  showOptions: boolean;
  canHide: boolean;
  handleHide: () => void;
  handleComment: () => void;
  handleLike: () => void;
  handleTip: () => void;
};

export const Content: FC<PostContentProps> = ({
  post,
  handleDelete,
  isDeleting,
  opened,
  isLiked,
  isLiking,
  isDetailLoading,
  showOptions,
  handleComment,
  handleLike,
  handleTip,
  canHide,
  handleHide
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const postUrl = ROUTES.USER.POST.buildPath(post.creatorWallet, post.id);

  return (
    <Flex
      direction="column"
      gap={{ base: "0.75em", sm: "1.125em" }}
      w="100%"
      align="start"
    >
      <Flex
        justify="space-between"
        w="100%"
        gap={{ base: "0.75em", sm: "1.125em" }}
      >
        <Link
          as={ReactRouterLink}
          to={ROUTES.USER.buildPath(post.creatorWallet)}
        >
          <Avatar
            name={post.creatorUsername}
            src={post.creatorAvatar}
            bg="brand.100"
            color={post.creatorAvatarFallbackColor || "brand.500"}
            border={post.creatorAvatar || "1px solid #b0b0b0"}
            size={{ base: "sm", sm: "md" }}
          />
        </Link>
        <VStack
          alignItems="left"
          justify="space-between"
          spacing="0em"
          w="100%"
        >
          <Link
            as={ReactRouterLink}
            to={ROUTES.USER.buildPath(post.creatorWallet)}
            _hover={{ textDecoration: "none" }}
          >
            <Text
              color="brand.900"
              textStyle="md"
              lineHeight="1em"
              maxW={{
                base: "14ch",
                sm: "24ch",
                md: "36ch",
                lg: "28ch",
                xl: "32ch"
              }}
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              overflow="hidden"
            >
              {post.creatorUsername}
            </Text>
          </Link>
          <Link
            as={ReactRouterLink}
            to={ROUTES.USER.POST.buildPath(post.creatorWallet, post.id)}
            _hover={{ textDecoration: "none" }}
            aria-label="Open the post."
          >
            <Text
              as="time"
              dateTime=""
              color="other.600"
              textStyle="xs"
              userSelect="none"
            >
              {new Date(post.createdAt).toLocaleDateString()}
              <Text as="span" fontSize="0.75em" whiteSpace="pre-wrap">
                {"  •  "}
              </Text>
              {new Date(post.createdAt).toLocaleTimeString()}
            </Text>
          </Link>
        </VStack>

        {post.visibility === PostVisibility.RECIPIENTS && (
          <HStack>
            <Text as="span" color="other.600" textStyle="sm">
              {`Recipient: ${post.recipients?.map((recipient) => recipient.username).join(", ")}`}
            </Text>
            {post.recipients?.map((recipient) => (
              <Avatar
                key={recipient.wallet}
                name={recipient.username}
                src={recipient.avatarUrl}
                bg="brand.100"
                color={recipient.avatarFallbackColor || "brand.500"}
                border={recipient.avatarUrl || "1px solid #b0b0b0"}
                size={{ base: "sm", sm: "md" }}
              />
            ))}
          </HStack>
        )}
        {(showOptions || canHide) && (
          <Menu autoSelect={false} placement="bottom-end">
            <MenuButton
              as={IconButton}
              variant="empty"
              color="other.600"
              aria-label="See menu."
              icon={<FaEllipsis fontSize="1.5rem" />}
              size="lg"
              isLoading={isDeleting}
              ml="auto"
              mt="-0.5em"
            />
            <MenuList>
              {showOptions && (
                <MenuItem onClick={onOpen} icon={<FaTrash color="red" />}>
                  <Text as="span" color="red">
                    Delete
                  </Text>
                </MenuItem>
              )}
              {canHide && (
                <MenuItem onClick={handleHide} icon={<FaBan color="orange" />}>
                  <Text as="span" color="orange">
                    Hide (WARNING: MODERATION ACTION!)
                  </Text>
                </MenuItem>
              )}
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
                Delete post
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
                  onClick={() => {
                    if (handleDelete) {
                      handleDelete();
                      onClose();
                    }
                  }}
                  ml="1.5em"
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>

      {post.skillTags.length > 0 && (
        <Link
          as={ReactRouterLink}
          to={ROUTES.USER.POST.buildPath(post.creatorWallet, post.id)}
          _hover={{ textDecoration: "none" }}
          w="100%"
          aria-label="Open the post."
        >
          <Flex gap="0.5em" flexWrap="wrap">
            {post.skillTags.map((skill) => (
              <Tag key={skill} variant="primary" size="md">
                {skill}
              </Tag>
            ))}
          </Flex>
        </Link>
      )}

      <RichTextEditorQuillHook
        value={post.text}
        id={post.id.toString()}
        readOnly={true}
        preview={true}
      />

      <ActionBar
        post={post}
        opened={opened}
        isLiked={isLiked}
        isLiking={isLiking}
        isDetailLoading={isDetailLoading}
        handleComment={handleComment}
        handleLike={handleLike}
        handleTip={handleTip}
        postUrl={postUrl}
      />
    </Flex>
  );
};
