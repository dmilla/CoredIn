import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { ADVANTAGES_DATA, NAV_SECTIONS } from "../constants";
import { AdvantageCard } from ".";

export const Advantages = () => {
  return (
    <VStack
      as="section"
      w="100%"
      id={NAV_SECTIONS.ADVANTAGES}
      // h="min-content"
      minH={{ base: "92vh", md: "89vh" }} // NOTE: Do not modify this only as the nav bar and other page sections also rely on vh to ensure content does not overlap.
      pt={{ base: "8vh", md: "11vh" }} // NOTE: Do not modify this only as the nav bar and other page sections also rely on vh to ensure content does not overlap.
      spacing="5em"
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
          The cored.in advantages
        </Heading>
        <Text
          fontSize={{ base: "2.5rem", md: "3.5rem", lg: "4rem", xl: "4.5rem" }}
          fontWeight="700"
          lineHeight="1.25"
          color="brand.900"
        >
          Powerful tech under the hood
        </Text>
      </Box>
      <Flex
        direction={{ base: "column", xl: "row" }}
        justify="center"
        align={{ base: "center", xl: "stretch" }}
        gap={{ base: "1.5em", md: "3.75em" }}
        // border="1px solid white"
        w="100%"
        maxW="1620px"
      >
        {ADVANTAGES_DATA.map((advantage, index) => (
          <AdvantageCard
            key={index}
            heading={advantage.heading}
            text={advantage.text}
            image={advantage.image}
            alt={advantage.alt}
            index={index}
            link={advantage.link}
          />
        ))}
      </Flex>
    </VStack>
  );
};
