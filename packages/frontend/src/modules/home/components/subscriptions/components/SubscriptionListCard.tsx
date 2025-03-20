import { Avatar, Flex, Link, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useLoggedInServerState } from "@/hooks";
import { USER_QUERIES } from "@/queries";
import { ROUTES } from "@/router/routes";
import { Link as ReactRouterLink } from "react-router-dom";

type SubscriptionListCardProps = {
  profileWallet: string;
  expirationTimestamp: string;
};

export const SubscriptionListCard: React.FC<SubscriptionListCardProps> = ({
  profileWallet,
  expirationTimestamp
}) => {
  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(profileWallet)
  );

  return (
    <Flex
      as="li"
      direction="row"
      gap="0.5em"
      align="center"
      // justify="start"
      w="100%"
      py="1em"
      px="1em"
      borderLeft="1px solid"
      borderLeftColor="transparent"
      borderBottom="1px solid"
      borderBottomColor="brand.100"
      _last={{ borderBottom: "none", pb: "0" }}
      _hover={{
        color: "brand.500",

        borderLeftColor: "brand.500"
      }}
    >
      <Avatar
        src={userProfile?.avatarUrl}
        name={userProfile?.username}
        bg="brand.100"
        color={userProfile?.avatarFallbackColor || "brand.500"}
        border={userProfile?.avatarUrl || "1px solid #b0b0b0"}
        size="md"
      />
      <VStack
        align="start"
        spacing="0em"
        textOverflow="ellipsis"
        display="inline"
        whiteSpace="nowrap"
        overflow="hidden"
        maxW={{ base: "170px", sm: "300px" }}
      >
        {userProfile?.username && (
          <Link
            as={ReactRouterLink}
            to={ROUTES.USER.buildPath(profileWallet)}
            _hover={{ textDecoration: "none" }}
          >
            <Text
              as="span"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              overflow="hidden"
            >
              @{userProfile.username}
            </Text>
          </Link>
        )}
        {/* <Text
          as="span"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          overflow="hidden"
        >
          Subscribed to:
          {info.subscribed_to}
        </Text> */}
        <Text
          color="other.600"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          overflow="hidden"
          textStyle="sm"
        >
          Expires:
          <Text as="span">
            {new Date(parseInt(expirationTimestamp) / 1000000).toLocaleString()}
          </Text>
        </Text>
      </VStack>

      {/* <ButtonGroup
        display="flex"
        flexDir="column"
        ml="auto"
        variant="empty"
        size="xs"
      >
        <Button color="other.600" _hover={{ color: "brand.400" }}>
          Remove
        </Button>
        <Button>Renew</Button>
      </ButtonGroup> */}
    </Flex>
  );
};
