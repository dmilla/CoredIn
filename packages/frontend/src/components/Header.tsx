import { Logo } from "@/components";
import { ROUTES } from "@/router/routes";
import { Box, Flex, Link } from "@chakra-ui/react";
import { FC } from "react";
import { Link as ReactRouterLink } from "react-router-dom";

type HeaderProps = {
  username?: string;
  children?: React.ReactNode;
};

export const Header: FC<HeaderProps> = ({ username, children }) => {
  return (
    <Box
      as="header"
      position="sticky"
      top={{ base: "1rem", md: "1.5rem", lg: "1.75rem" }}
      zIndex="10"
      px={{ base: "0.5em", sm: "1em", lg: "2.5em" }}
      mb={{ base: "1em", sm: "2em", lg: "0" }}
    >
      <Flex
        justify="space-between"
        alignItems="center"
        gap="1.5em"
        maxW="1840px"
        mx="auto"
        bg="#FFFFFFBF"
        backdropFilter="blur(12px)"
        border="1px solid #E7E7E740"
        borderRadius="1.125em"
        boxShadow="
          5px 4px 14px 0px #1414130D,
          18px 17px 25px 0px #1414130A,
          41px 38px 34px 0px #14141305,
          72px 68px 40px 0px #14141303,
          113px 106px 43px 0px #14141300"
        p={{ base: "0.688em", xl: "1em" }}
      >
        <Link
          as={ReactRouterLink}
          to={username ? ROUTES.HOME.path : ROUTES.ROOT.path}
          aria-label={username ? "Home page." : "Main page."}
          _hover={{
            textDecoration: "none"
          }}
          flexShrink="0"
        >
          <Logo
            w={{ base: "120px", md: "148px" }}
            h="auto"
            aspectRatio="6.17 / 1"
          />
        </Link>

        {children}
      </Flex>
    </Box>
  );
};
