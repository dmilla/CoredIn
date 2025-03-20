import { Box, Flex } from "@chakra-ui/react";
import { CookiesBar, MainBackground } from "@/components";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Footer, Nav } from "../components";

export const Root = () => {
  return (
    <Box
      maxH="100%"
      w="100%"
      bg="brand.100"
      position="fixed"
      overflow="auto"
      id="landing-root"
    >
      <Flex direction="column" justify="start">
        <Nav />
        <Box as="main" zIndex="0">
          <Outlet />
          <ScrollRestoration />
        </Box>
        <Footer />
        <CookiesBar />
      </Flex>
      <MainBackground />
    </Box>
  );
};
