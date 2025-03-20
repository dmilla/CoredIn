import { Box, Flex } from "@chakra-ui/react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { DisclaimerText } from "@/components";
import { Header, LoginButton, MainBackground } from "@/components";
import { useChain } from "@cosmos-kit/react";
import { chainInfo } from "@/dependencies";
import { useAuth, useLoggedInServerState } from "@/hooks";
import { USER_QUERIES } from "@/queries";

export const LoginRoot = () => {
  const { needsAuth } = useAuth();
  const chainContext = useChain(chainInfo.chainName);
  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(chainContext.address || "", needsAuth),
    {
      enabled: !!chainContext.address
    }
  );

  return (
    <Box
      maxH="100%"
      w="100%"
      bg="brand.100"
      position="fixed"
      overflow="auto"
      // border="5px solid green"
    >
      <Flex
        direction="column"
        justify="start"
        minH="100dvh"

        // bgImage={LandingBgDark35}
        // bgPosition="center"
        // border="2px solid red"
      >
        <Header>
          <LoginButton
            variant="primary"
            size="md"
            signInText="Sign in"
            username={userProfile?.username}
            py="0.43em" // Remove this if the text length is going to match the other login button on the page
          />
        </Header>
        <Box as="main" mb="auto">
          <Outlet />
          <ScrollRestoration />
        </Box>
        <Box
          mx="auto"
          py="2em"
          px={{ base: "1em", md: "2.5em", lg: "3.5em" }}
          maxW="800px"
        >
          <DisclaimerText textAlign="center" />
        </Box>
      </Flex>
      <MainBackground />
    </Box>
  );
};
