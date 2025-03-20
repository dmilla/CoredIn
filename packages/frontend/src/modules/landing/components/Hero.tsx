import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  useMediaQuery,
  useTheme
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { fadeInWithDelayAnimation, NAV_SECTIONS } from "../constants";
import { LogoIconColor } from "@/components";
import { Link as ReactRouterLink } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export const Hero = () => {
  const theme = useTheme();
  const [isLargerThanMd] = useMediaQuery(
    `(min-width: ${theme.breakpoints.md})`
  );

  return (
    <Flex
      as="section"
      id={NAV_SECTIONS.HOME}
      w="100%"
      maxW="1620px"
      mx="auto"
      minH="100vh"
      direction="column"
      align="start"
      justify={{ base: "start", sm: "center" }}
      gap="4em" // needed for mobile
      mt={{ base: "0em", md: "-4.5em" }}
      pt={{ base: "8vh", md: "11vh" }}
      pb={{ base: "1em", md: "2.5em" }} // TODO
      color="brand.900"
      // border="1px solid red"
      position="relative"
    >
      <Flex
        direction="column"
        justify="center"
        gap="1.5em"
        // border="1px solid yellow"
        //
      >
        <Heading
          as="h1"
          fontSize={{ base: "3rem", md: "4.125rem", xl: "5.25rem" }}
          textAlign="left"
          fontWeight="700"
        >
          Your Expertise,{" "}
          <Text as="span" fontWeight="400">
            Verified.
          </Text>
          <Text as="span" display="block">
            Your Career,{" "}
            <Text as="span" fontWeight="400">
              Amplified.
            </Text>
          </Text>
        </Heading>
        <Flex direction="column" gap="1.5em">
          <Text
            fontWeight="300"
            fontSize={{ base: "1rem", md: "1.25rem" }}
            lineHeight="1.25"
            maxW="636px"
          >
            Connect with industry leaders, showcase your skills, and unlock
            exclusive opportunities. Your career journey, elevated and
            protected.
          </Text>
          <HStack spacing="1em">
            <Button
              variant="primary"
              as={ReactRouterLink}
              to={ROUTES.LOGIN.path}
            >
              Join coredin
            </Button>
            <Text
              as="span"
              color="brand.300"
              fontWeight="300"
              fontSize="0.875rem"
              lineHeight="1.25"
            >
              Your Trusted Professional Network
            </Text>
          </HStack>
        </Flex>
      </Flex>

      {isLargerThanMd && (
        <Box
          position="absolute"
          right={{ md: "24px" }}
          zIndex="-1"
          // border="1px solid white"
          w="47%"
        >
          <LogoIconColor w="100%" h="auto" />
        </Box>
      )}

      <Box
        as={motion.div}
        variants={fadeInWithDelayAnimation}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0 }}
        layerStyle="transparentBox"
        alignSelf="center"
        maxW="810px"
        py="1.5em"
        px="1em"
        position={{ base: "static", lg: "absolute" }}
        bottom="1em"
      >
        <Text
          fontWeight="300"
          fontSize={{ base: "1rem", md: "1.25rem" }}
          lineHeight="1.25"
          textAlign="center"
        >
          Elevate your career with a verified digital identity. Control your
          data, customize your visibility, and connect confidently in a curated,
          spam-free environment. Showcase your expertise and unlock authentic
          opportunities on a platform built on trust.
        </Text>
      </Box>
    </Flex>
  );
};
