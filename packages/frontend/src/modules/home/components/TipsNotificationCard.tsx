import { ROUTES } from "@/router/routes";
import { Avatar, Flex, Link, Text } from "@chakra-ui/react";
import { TipDTO } from "@coredin/shared";
import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";

export type TipsNotificationCardProps = {
  tip: TipDTO;
  direction: "sent" | "received";
};

// TODO: adapt the styling for when we get the notification working (similar to MessagePreviewCard)
export const TipsNotificationCard: React.FC<TipsNotificationCardProps> = ({
  tip,
  direction
}) => {
  const [username, avatar, avatarFallbackColor, profileWallet] =
    direction === "received"
      ? [
          tip.tipperUsername,
          tip.tipperAvatar,
          tip.tipperAvatarFallbackColor,
          tip.tipperWallet
        ]
      : [
          tip.receiverUsername,
          tip.receiverAvatar,
          tip.receiverAvatarFallbackColor,
          tip.receiverWallet
        ];
  return (
    <Flex
      as="article"
      gap={{ base: "0.75em", sm: "1.125em" }}
      direction="row"
      py="1em"
      border={
        "1px solid #E6E6E6"
        //   initialMessage.unread ? "2px solid #00AA54" : "1px solid #E6E6E6"
      }
      layerStyle="cardBox"
      // w="100%"
    >
      <Link
        as={ReactRouterLink}
        to={ROUTES.USER.buildPath(profileWallet)}
        _hover={{ textDecoration: "none" }}
      >
        <Avatar
          name={username}
          src={avatar}
          bg="brand.100"
          color={avatarFallbackColor}
          border={
            "1px solid #b0b0b0"
            //   isInitialisedByMe
            //     ? initialMessage.recipients?.[0].avatarUrl ||
            //       "1px solid #b0b0b0"
            //     : initialMessage.creatorWallet !== chainContext.address
            //       ? initialMessage.creatorAvatar || "1px solid #b0b0b0"
            //       : "1px solid #b0b0b0"
          }
          size={{ base: "sm", sm: "md" }}
        />
      </Link>
      <Flex
        direction="column"
        // align="start"
        // border="1px solid red"
        w="100%"

        //
      >
        <Text as="span" color="brand.900" textStyle="md">
          <Link
            as={ReactRouterLink}
            to={ROUTES.USER.buildPath(profileWallet)}
            w="100%"
            _hover={{ textDecoration: "none" }}
          >
            <Text as="span" fontWeight="700">
              {`${username} `}
            </Text>
          </Link>
          {" tipped for "}
          <Text
            as="span"
            fontWeight="700"
          >{` ${parseInt(tip.amount) / 1000000.0} ${tip.denom}`}</Text>
        </Text>
        <Text
          as="time"
          dateTime=""
          color="other.600"
          textStyle="sm"
          userSelect="none"
        >
          {new Date(tip.createdAt).toLocaleTimeString()}
          <Text as="span" fontSize="0.75em" whiteSpace="pre-wrap">
            {"    •    "}
          </Text>
          {new Date(tip.createdAt).toLocaleDateString()}
        </Text>
      </Flex>
      <Link
        as={ReactRouterLink}
        to={ROUTES.USER.POST.buildPath(profileWallet, tip.postId)}
        flexShrink="0"
        mt="auto"
      >
        View post
      </Link>
    </Flex>
  );
};
