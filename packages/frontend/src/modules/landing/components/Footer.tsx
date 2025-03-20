// import { BackToTop } from "@/modules/landing/components/BackToTop";
import { SocialMedia } from "@/components";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { fadeInAnimation } from "../constants";
import { ROUTES } from "@/router/routes";
import { useNavigate } from "react-router";

export const Footer = () => {
  const navigate = useNavigate();
  return (
    <Box
      as={motion.footer}
      w="100%"
      h="min-content"
      minH="50vh"
      initial="initial"
      whileInView="animate"
      variants={fadeInAnimation}
      viewport={{ once: true, amount: 0.3 }}
      color="brand.900"
      // border="1px solid red"
    >
      <Flex
        flexDirection="column"
        justify="center"
        align="center"
        gap="5em"
        pt="5em"
        mb="7.5em"
        px="1em"
        mt="7em"
      >
        <Button
          variant={"primary"}
          fontSize={{ base: "2rem", md: "3rem" }}
          textAlign="center"
          onClick={() => navigate(ROUTES.LOGIN.path)}
        >
          JOIN COREDIN
        </Button>
        <SocialMedia size="3rem" gap="3.5em" />
      </Flex>
      <Text textAlign="center" p="1.5em">
        All rights reserved — cored.in &copy;{" "}
        <Text as="span">{new Date().getFullYear()}</Text>
      </Text>
    </Box>
  );
};
