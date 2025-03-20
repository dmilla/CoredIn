import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  Link,
  Tag,
  Text,
  Tooltip,
  VisuallyHidden,
  useDisclosure
} from "@chakra-ui/react";
import { UserProfile } from "@coredin/shared";
import { FaCheckDouble, FaPen } from "react-icons/fa6";
import { Link as ReactRouterLink } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import React, { useContext, useState } from "react";
import { CoredinClientContext } from "@/contexts/CoredinClientContext";
import { prettifyDid } from "../helpers/prettifyDid";
import { CopyIcon } from "@chakra-ui/icons";
import { NewMessage, SubscriptionModal } from ".";
import { useContractRead, useCustomToast } from "@/hooks";
import { CONTRACT_QUERIES, USER_QUERIES } from "@/queries";
import { useQueryClient } from "@tanstack/react-query";
import { BaseServerStateKeys } from "@/constants";

type UserHeaderProps = {
  userProfile: UserProfile;
  isOwnProfile: boolean;
  profileWallet: string;
  userWallet: string;
};

export const UserHeader: React.FC<UserHeaderProps> = ({
  userProfile,
  isOwnProfile,
  profileWallet,
  userWallet
}) => {
  const coredinClient = useContext(CoredinClientContext);
  const { successToast, errorToast } = useCustomToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isTooltipOpen,
    onOpen: onTooltipOpen,
    onClose: onTooltipClose
  } = useDisclosure();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const queryClient = useQueryClient();
  const { data: profileDid } = useContractRead(
    CONTRACT_QUERIES.getWalletDid(coredinClient!, profileWallet),
    { enabled: !!coredinClient }
  );
  const { data: subscriptionInfo, refetch } = useContractRead(
    CONTRACT_QUERIES.getSubscriptionInfo(
      coredinClient!,
      profileDid?.did_info?.did ?? { value: "" },
      userWallet
    ),
    {
      enabled: !!coredinClient && !!profileDid?.did_info?.did
    }
  );
  const { data: subscriptionPrice } = useContractRead(
    CONTRACT_QUERIES.getSubscriptionPrice(
      coredinClient!,
      profileDid?.did_info?.did ?? { value: "" }
    ),
    { enabled: !!coredinClient && !!profileDid?.did_info?.did }
  );

  const { data: subscriptionDays } = useContractRead(
    CONTRACT_QUERIES.getSubscriptionDuration(
      coredinClient!,
      profileDid?.did_info?.did ?? { value: "" }
    ),
    { enabled: !!coredinClient && !!profileDid?.did_info?.did }
  );

  const handleSubscribe = () => {
    console.log("Subscribing to", profileDid?.did_info?.did);
    if (coredinClient && subscriptionPrice && profileDid?.did_info) {
      setIsSubscribing(true);
      console.log("price", subscriptionPrice);
      coredinClient
        .subscribe(
          {
            did: profileDid?.did_info?.did || { value: "" }
          },
          "auto",
          undefined,
          subscriptionPrice.amount === "0" ? [] : [subscriptionPrice]
        )
        .then(() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [BaseServerStateKeys.USER_FEED]
          });
          queryClient.invalidateQueries({
            queryKey: [BaseServerStateKeys.FEED]
          });
          queryClient.invalidateQueries({
            queryKey: USER_QUERIES.getUser(userWallet).queryKey
          });
          successToast(`Subscribed to ${userProfile.username}`);
        })
        .catch((error) => {
          console.error(
            "Error subscribing to",
            profileDid?.did_info?.did,
            error
          );
          errorToast(`Error subscribing to ${userProfile.username}`);
        })
        .finally(() => {
          setIsSubscribing(false);
        });
    }
    onClose();
  };

  const copyDid = () => {
    if (profileDid?.did_info) {
      navigator.clipboard.writeText(profileDid.did_info.did.value);
      successToast("User DID copied to clipboard");
    }
  };

  const subscriptionInfoValidUntil = new Date(
    subscriptionInfo?.valid_until
      ? parseInt(subscriptionInfo.valid_until) / 1000000 // Contract timestamp in nanoseconds!
      : Date.now() - 1
  );

  const isSubscribed = subscriptionInfo?.valid_until
    ? subscriptionInfoValidUntil > new Date()
    : false;

  const formatPrice = (ucore: string): string => {
    return (Number(ucore) / 1_000_000).toString();
  };

  return (
    <Box layerStyle="cardBox" py="1em" w="100%">
      <Box
        h={{ base: "75px", sm: "90px", lg: "125px" }}
        w="100%"
        bg={userProfile.backgroundColor || "brand.200"}
        borderTopRadius="0.75em"
      ></Box>
      <Flex
        justify="space-between"
        mx="1em"
        // border="1px solid red"
        align="center"
        mt={{ base: "-2.5em", sm: "-3em", lg: "-4em" }}
      >
        <Avatar
          name={userProfile.username}
          src={userProfile.avatarUrl}
          bg="brand.100"
          color={userProfile.avatarFallbackColor || "brand.500"}
          size={{ base: "lg", sm: "xl", lg: "2xl" }}
          // ml="0.5em"
          border="2px solid #141413"
        />
        {isOwnProfile && (
          <Link
            as={ReactRouterLink}
            to={ROUTES.SETTINGS.path}
            aria-label="Edit profile."
            variant="empty"
            size="sm"
            color="other.600"
            mt="3.5em"
            // mt={{ base: "-3rem", md: "-4.5rem" }}
            _hover={{
              textDecoration: "none",
              color: "brand.300"
            }}
          >
            <Icon as={FaPen} size="0.875rem" />
            <Text as="span" ml="0.375em">
              Edit
            </Text>
          </Link>
        )}
      </Flex>
      <Flex direction="column" gap="1.5em" px="1.125em" pt="1.75em" pb="2.5em">
        <HStack justify="space-between">
          <VisuallyHidden>
            <Heading as="h1">{userProfile.username}'s profile page</Heading>
          </VisuallyHidden>
          <Text as="span" color="brand.900" textStyle="md">
            {`@${userProfile.username}`}
          </Text>
          {userProfile.issuerDid && (
            <Tooltip
              hasArrow
              label={`${userProfile.issuerDid}`}
              maxW="500px"
              isOpen={isTooltipOpen}
            >
              <Badge
                variant="verified"
                onMouseEnter={onTooltipOpen}
                onMouseLeave={onTooltipClose}
              >
                Issuer
              </Badge>
            </Tooltip>
          )}
        </HStack>

        {profileDid?.did_info?.did && (
          <Button
            variant="empty"
            size="sm"
            color="other.600"
            alignSelf="start"
            rightIcon={<CopyIcon ml="0.5em" />}
            aria-label="Copy user DID."
            mt="-1em"
            onClick={copyDid}
          >
            {prettifyDid(profileDid.did_info.did)}
          </Button>
        )}

        <Text textStyle="sm" wordBreak="break-word">
          {userProfile.bio}
        </Text>

        {userProfile.skillTags.length > 0 && (
          <Flex gap="0.5em" flexWrap="wrap">
            {userProfile.skillTags.map((skill) => (
              <Tag key={skill} variant="primary" size="md">
                {skill}
              </Tag>
            ))}
          </Flex>
        )}

        {!isOwnProfile &&
          !isSubscribed &&
          subscriptionPrice &&
          subscriptionDays && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onOpen}
                isLoading={isSubscribing}
              >
                Subscribe for {formatPrice(subscriptionPrice.amount)} CORE
              </Button>
              <SubscriptionModal
                isOpen={isOpen}
                onClose={onClose}
                username={userProfile.username}
                subscriptionPrice={formatPrice(subscriptionPrice.amount)}
                subscriptionDurationDays={parseInt(subscriptionDays)}
                handleSubscribe={handleSubscribe}
              />
            </>
          )}

        {isSubscribed && (
          <Flex
            justify="space-between"
            direction={{ base: "column-reverse", sm: "row" }}
            gap="1em"
          >
            <HStack>
              <Icon as={FaCheckDouble} color="brand.500" />
              <Text as="span" textStyle="sm" color="brand.500">
                Subscribed until {subscriptionInfoValidUntil.toLocaleString()}
              </Text>
            </HStack>
            <Button variant="primary" onClick={onOpen}>
              New message
            </Button>
            {/* <NewMessageModal
              isOpen={isOpen}
              onClose={onClose}
              toUsername={userProfile.username}
            /> */}
            <NewMessage
              isOpen={isOpen}
              onClose={onClose}
              toUsername={userProfile.username}
              recipientWallet={profileWallet}
            />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
