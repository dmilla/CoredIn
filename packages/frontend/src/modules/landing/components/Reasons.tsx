import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { NAV_SECTIONS, REASONS_DATA } from "../constants";
import { ReasonCard } from "./ReasonCard";

export const Reasons = () => {
  return (
    <VStack
      as="section"
      w="100%"
      id={NAV_SECTIONS.WHY_COREDIN}
      // h="min-content"
      minH={{ base: "92vh", md: "89vh" }} // NOTE: Do not modify this only as the nav bar and other page sections also rely on vh to ensure content does not overlap.
      pt={{ base: "8vh", md: "11vh" }} // NOTE: Do not modify this only as the nav bar and other page sections also rely on vh to ensure content does not overlap.
      spacing="3.125em"
      // border="1px solid red"
    >
      <Box textAlign="center">
        <Heading
          as="h2"
          // fontSize={{ base: "3rem", md: "4.5rem", xl: "5rem" }}
          fontSize={{
            base: "1.25rem",
            md: "1.5rem",
            lg: "1.75rem",
            xl: "2.25rem"
          }}
          fontWeight="400"
          lineHeight="1.25"
          color="brand.500"
          textTransform="uppercase"
        >
          Why cored.in?
        </Heading>
        <Text
          fontSize={{ base: "2.5rem", md: "3.5rem", lg: "4rem", xl: "4.5rem" }}
          fontWeight="700"
          lineHeight="1.25"
          color="brand.900"
        >
          Your success toolkit
        </Text>
      </Box>
      <Flex
        as="ul"
        w="100%"
        maxW="1220px"
        justify="center"
        flexWrap="wrap"
        gap={{ base: "1.5em", md: "3.75em" }}
      >
        {REASONS_DATA.map((reason, index) => {
          return (
            <ReasonCard
              key={`landing-reason-${index}`}
              title={reason.title}
              description={reason.description}
              index={index}
            />
          );
        })}
      </Flex>
    </VStack>
  );
};
