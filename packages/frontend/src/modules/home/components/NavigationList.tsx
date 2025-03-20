import { Flex, Grid, HStack, Icon, Link, Text, VStack } from "@chakra-ui/react";
import { navigationData } from "../constants/navigationData";
import { Link as ReactRouterLink } from "react-router-dom";
import { FC } from "react";
import { CredentialRequestDTO } from "@coredin/shared";
import { NotificationDot } from ".";

export type NavigationProps = {
  wallet: string;
  isPostPage: boolean;
  pendingRequests: CredentialRequestDTO[] | undefined;
  unreadMessages: number;
  unseenTips: number;
  closeMobileMenu?: () => void;
};

export const NavigationList: FC<NavigationProps> = ({
  wallet,
  isPostPage,
  pendingRequests,
  unreadMessages,
  unseenTips,
  closeMobileMenu
}) => {
  return (
    <Grid
      as="ul"
      templateColumns="1"
      gap={{ base: "1.25em", lg: "2em" }}
      listStyleType="none"
    >
      {navigationData(wallet).map((item, index) => (
        <Flex
          as="li"
          key={`home-navigation-${index}`}
          // justify="center"
          // align="center"
          // border="1px solid red"
          onClick={closeMobileMenu}
        >
          <Link
            as={ReactRouterLink}
            to={item.link}
            fontSize="1.375rem"
            fontWeight="600"
            color={
              location.pathname.includes(item.link) && !isPostPage
                ? "brand.300"
                : "brand.900"
            }
            w="100%"
            _hover={{
              "& > div": {
                color: "brand.300"
              }
            }}
          >
            <HStack
              spacing="0.75em"
              w="100%"
              // border="1px solid white"
              position="relative"
            >
              <Icon as={item.icon} mx="0" fontSize="1.5rem" />
              <Text as="span">{`${item.title[0].toUpperCase()}${item.title.slice(1)}`}</Text>
              {item.title === "credentials" &&
                pendingRequests?.length !== 0 && (
                  <NotificationDot
                    ariaLabel={`${pendingRequests?.length} new credential requests.`}
                  />
                )}
              {item.title === "messages" && unreadMessages > 0 && (
                <NotificationDot
                  ariaLabel={`${unreadMessages} new messages.`}
                />
                //    {isLargerThanLg && (
                //     <Text
                //       as="span"
                //       color="brand.100"
                //       fontSize="0.5rem"
                //       mt="-1em"
                //       border="1px solid red"
                //     >
                //       {unreadMessages}
                //     </Text>
                //   )}
              )}
              {item.title === "wallet" && unseenTips > 0 && (
                <NotificationDot
                  ariaLabel={`${pendingRequests?.length} new received tips.`}
                />
              )}
            </HStack>
          </Link>
        </Flex>
      ))}
    </Grid>
  );
};
