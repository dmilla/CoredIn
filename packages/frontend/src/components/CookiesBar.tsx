import { Flex, Text, Button, Box, ButtonGroup } from "@chakra-ui/react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { FEATURE_FLAG } from "@coredin/shared";
import { useFlag } from "@/hooks";
import { motion } from "framer-motion";

export const COOKIES_ACCEPTANCE_COOKIE_NAME = "CookiesConsent";

export const CookiesBar = () => {
  const isEnabled = useFlag(FEATURE_FLAG.COOKIES);
  const [cookies, setCookie, removeCookie] = useCookies([
    COOKIES_ACCEPTANCE_COOKIE_NAME
  ]);
  const [rejected, setRejected] = useState(false);

  if (!isEnabled) {
    return false;
  }

  return (
    <>
      {!cookies.CookiesConsent && !rejected && (
        <Box
          as={motion.div}
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1,
            transition: { duration: 2, delay: 2 }
          }}
          color="brand.200"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="brand.200"
          backdropFilter="blur(12px)"
          position="sticky"
          bottom="0"
          zIndex="10"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap="1em"
            justify="space-between"
            align="center"
            textAlign={{ base: "center", md: "left" }}
            maxW="1400px"
            mx="auto"
            px={{ base: "1.5em", md: "2.5em", lg: "3.5em", xl: "4em" }}
            py="0.5em"
          >
            <Text fontWeight="700">
              This website uses cookies to improve the user experience.
            </Text>
            <ButtonGroup spacing="2em">
              <Button
                variant="empty"
                size="sm"
                color="brand.200"
                onClick={() => {
                  removeCookie(COOKIES_ACCEPTANCE_COOKIE_NAME);
                  setRejected(true);
                }}
              >
                Reject
              </Button>
              <Button
                variant="empty"
                size="sm"
                color="brand.200"
                onClick={() => setCookie(COOKIES_ACCEPTANCE_COOKIE_NAME, true)}
              >
                Accept
              </Button>
            </ButtonGroup>
          </Flex>
        </Box>
      )}
    </>
  );
};
