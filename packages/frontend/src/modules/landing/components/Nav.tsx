import { Flex, Link, useMediaQuery, useTheme, Box } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import { chainInfo } from "@/dependencies";
import { useAuth, useLoggedInServerState } from "@/hooks";
import { Header, LoginButton } from "@/components";
import { USER_QUERIES } from "@/queries";
import { useChain } from "@cosmos-kit/react";
import { NAV_SECTIONS } from "../constants";
import { useSectionInView } from "../hooks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Nav = () => {
  const currentSection = useSectionInView();
  const theme = useTheme();
  const [isLargerThanLg] = useMediaQuery(
    `(min-width: ${theme.breakpoints.lg})`
  );
  const { needsAuth } = useAuth();
  const chainContext = useChain(chainInfo.chainName);
  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(chainContext.address || "", needsAuth),
    {
      enabled: !!chainContext.address
    }
  );

  return (
    <Header>
      {isLargerThanLg && (
        <Box
          as="nav"
          w="60%"
          maxW="540px"
          // border="1px solid red"
          //
        >
          <Flex
            as="ul"
            justify="space-between"
            gap="1.5em"
            listStyleType="none"
          >
            {Object.values(NAV_SECTIONS).map((item, index) => {
              return (
                <Box as="li" key={`menu-section-li-${index}`}>
                  <Link
                    as={ReactRouterLink}
                    to={`#${item}`}
                    textDecoration="none"
                    fontSize={{ md: "0.875rem", lg: "1.125rem" }}
                    lineHeight="1.25"
                    textTransform="uppercase"
                    color={currentSection === item ? "brand.300" : "brand.900"}
                    _hover={{ color: "brand.300" }}
                  >
                    {item === NAV_SECTIONS.WHY_COREDIN ? "Why cored.in?" : item}
                  </Link>
                </Box>
              );
            })}
          </Flex>
        </Box>
      )}
      <LoginButton
        variant="primary"
        size="md"
        signInText="Sign in"
        username={userProfile?.username}
        py="0.43em" // Remove this if the text length is going to match the other login button on the page
      />
    </Header>
  );
};
