import { chainInfo } from "@/dependencies";
import { ROUTES } from "@/router/routes";
import { Avatar, Flex, Icon, Link, Text } from "@chakra-ui/react";
import { PostDTO } from "@coredin/shared";
import { useChain } from "@cosmos-kit/react";
import { FC } from "react";
import { FaDownLong, FaUpLong } from "react-icons/fa6";
import { Link as ReactRouterLink } from "react-router-dom";

type MessagePreviewCardProps = {
  initialMessage: PostDTO;
};

export const MessagePreviewCard: FC<MessagePreviewCardProps> = ({
  initialMessage
}) => {
  const chainContext = useChain(chainInfo.chainName);
  const messageUrl = ROUTES.USER.POST.buildPath(
    initialMessage.creatorWallet,
    initialMessage.id
  );

  const isInitialisedByMe =
    initialMessage.creatorWallet === chainContext.address;

  return (
    <Link
      as={ReactRouterLink}
      to={messageUrl}
      _hover={{ textDecoration: "none" }}
    >
      <Flex
        as="article"
        gap="0.5em"
        direction="column"
        py="1em"
        border={
          initialMessage.unread ? "2px solid #00AA54" : "1px solid #E6E6E6"
        }
        layerStyle="cardBox"
        _hover={{
          bg: "brand.100"
        }}
      >
        <Flex
          gap={{ base: "0.75em", sm: "1.125em" }}
          position="relative"
          //   border="1px solid red"
          //
        >
          <Avatar
            name={
              isInitialisedByMe
                ? initialMessage.recipients?.[0].username
                : initialMessage.creatorUsername
            }
            src={
              isInitialisedByMe
                ? initialMessage.recipients?.[0].avatarUrl
                : initialMessage.creatorAvatar
            }
            bg="brand.100"
            color={
              isInitialisedByMe
                ? initialMessage.recipients?.[0].creatorFallbackColor
                : initialMessage.creatorAvatarFallbackColor || "brand.500"
            }
            border={
              isInitialisedByMe
                ? initialMessage.recipients?.[0].avatarUrl ||
                  "1px solid #b0b0b0"
                : initialMessage.creatorWallet !== chainContext.address
                  ? initialMessage.creatorAvatar || "1px solid #b0b0b0"
                  : "1px solid #b0b0b0"
            }
            size={{ base: "sm", sm: "md" }}
          />
          <Flex
            direction="column"
            // border="1px solid red"
            w="100%"

            //
          >
            <Text as="span" color="brand.900" textStyle="md">
              {isInitialisedByMe
                ? initialMessage.recipients?.[0].username
                : initialMessage.creatorUsername}
            </Text>
            <Text
              color="brand.900"
              textStyle="sm"
              //   border="1px solid blue"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              maxW="75%"
            >
              {initialMessage.text}
            </Text>
          </Flex>
          <Icon
            as={isInitialisedByMe ? FaUpLong : FaDownLong}
            aria-label={
              isInitialisedByMe
                ? "You initialised this chat."
                : "Your subscriber initialised this chat."
            }
            color={isInitialisedByMe ? "brand.300" : "brand.200"}
            position="absolute"
            top="0"
            right="0"
          />
        </Flex>
        <Text
          as="time"
          dateTime=""
          color="other.600"
          textStyle="sm"
          ml={{ base: "3.125em", sm: "4.125em" }}
          userSelect="none"
        >
          {new Date(initialMessage.createdAt).toLocaleTimeString()}
          <Text as="span" fontSize="0.75em" whiteSpace="pre-wrap">
            {"    •    "}
          </Text>
          {new Date(initialMessage.createdAt).toLocaleDateString()}
        </Text>
      </Flex>
    </Link>
  );
};
