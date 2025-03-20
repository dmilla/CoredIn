import {
  DisclaimerText,
  Header,
  Logo,
  MainBackground,
  SocialMedia
} from "@/components";
import { chainInfo } from "@/dependencies";
import { useAuth, useLoggedInServerState } from "@/hooks";
import {
  MobileMenu,
  NavigationDesktop,
  SearchFakeButton,
  SearchModal,
  UserSignOut
} from "@/modules/home/components";
import { USER_QUERIES } from "@/queries";
import { ROUTES } from "@/router/routes";
import {
  Box,
  Grid,
  Link,
  useDisclosure,
  useMediaQuery,
  useTheme,
  VStack
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import {
  Navigate,
  Outlet,
  ScrollRestoration,
  useLocation
} from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import StickyBox from "react-sticky-box";

export const HomeRoot = () => {
  const theme = useTheme();
  const [isLargerThanLg] = useMediaQuery(
    `(min-width: ${theme.breakpoints.lg})`
  );
  const {
    isOpen: isSearchModalOpen,
    onOpen: onSearchModalOpen,
    onClose: onSearchModalClose
  } = useDisclosure();
  const location = useLocation();
  const chainContext = useChain(chainInfo.chainName);
  const { needsAuth } = useAuth();
  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(chainContext.address || "", needsAuth),
    {
      enabled: !!chainContext.address
    }
  );
  if (!chainContext.isWalletConnected) {
    return (
      <Navigate
        to={
          ROUTES.LOGIN.path + "?redirect=" + location.pathname + location.search
        }
      />
    );
  }

  return (
    <Box
      w="100%"
      maxW="1920px"
      mx="auto"
      bg="brand.100"
      position="relative"
      zIndex="0"
    >
      {!isLargerThanLg && userProfile && (
        <Header username={userProfile.username}>
          <MobileMenu />
        </Header>
      )}

      <Grid
        pt={{ base: "1.5em", sm: "1em", xl: "1.5em" }}
        pb={{ base: "4.5em", lg: "1.5em" }}
        px={{ base: "0.5em", sm: "1em", xl: "2.5em" }}
        templateColumns={{
          base: "100%",
          lg: "minmax(250px, 300px) minmax(450px, 1fr) minmax(200px, 300px)"
        }}
        gap={{ base: "8px", lg: "24px" }}
        // border="1px solid green"
        alignItems="flex-start" // important for the StickyBox to work
      >
        {!isLargerThanLg && (
          <>
            <SearchFakeButton onSearchModalOpen={onSearchModalOpen} />

            <VStack
              as="aside"
              h="max-content"
              layerStyle="cardBox"
              py="1em"
              spacing="0.25em"
            >
              <DisclaimerText size="xs" textAlign="center" />
              <SocialMedia showOnlyDiscord size="1.75rem" color="other.600" />
            </VStack>
          </>
        )}
        {isLargerThanLg && (
          <StickyBox offsetTop={24} offsetBottom={24}>
            <VStack
              spacing="1.25em"
              // border="1px solid red"
              //
            >
              <Box layerStyle="cardBox" p="2em" w="100%">
                <Link
                  as={ReactRouterLink}
                  to={
                    chainContext.address ? ROUTES.HOME.path : ROUTES.ROOT.path
                  }
                  aria-label={
                    chainContext.address ? "Home page." : "Main page."
                  }
                  _hover={{ textDecoration: "none" }}
                >
                  <Logo w="148px" h="auto" aspectRatio="6.17 / 1" />
                </Link>
              </Box>
              <NavigationDesktop wallet={chainContext.address || ""} />
              <UserSignOut />
            </VStack>
          </StickyBox>
        )}

        <Box as="main">
          <Outlet />
          <ScrollRestoration />
        </Box>

        {isLargerThanLg && (
          <VStack spacing="1.25em">
            <SearchFakeButton onSearchModalOpen={onSearchModalOpen} />

            <VStack
              as="aside"
              h="max-content"
              layerStyle="cardBox"
              py="1em"
              spacing="0.75em"
            >
              <DisclaimerText size="xs" textAlign="center" />
              <SocialMedia showOnlyDiscord size="1.75rem" color="other.600" />
            </VStack>
          </VStack>
        )}
      </Grid>

      <SearchModal
        isSearchModalOpen={isSearchModalOpen}
        onSearchModalClose={onSearchModalClose}
      />

      <MainBackground />
    </Box>
  );
};
