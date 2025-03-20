import { Heading, VStack, Text, Link, Box, Image } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FC } from "react";
import { fadeInOneByOne } from "../constants";

interface AdvantageProps {
  heading: string;
  text: string;
  index: number;
  image?: string;
  alt?: string;
  link?: string;
}

export const AdvantageCard: FC<AdvantageProps> = ({
  heading,
  text,
  index,
  image,
  alt,
  link
}) => {
  return (
    <Box
      as={motion.div}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInOneByOne}
      custom={index}
      layerStyle="cardBox"
      // borderColor="red"
      maxW="500px"
      px="2em"
      py="2.75em"
      alignSelf={{ base: "unset", xl: "stretch" }}
    >
      <VStack spacing="1.5em" h="100%" textAlign="center" color="brand.900">
        {link ? (
          <Link
            href={link}
            isExternal
            onClick={() => console.log(link)}
            aria-label={`Link to ${alt} website.`}
            // border="1px solid red"
          >
            <Image
              src={image}
              alt=""
              w="100%"
              maxW="150px"
              mx="auto"
              h={{ base: "50px", md: "60px" }}
              objectFit="contain"
            />
          </Link>
        ) : (
          <Box
            w="100%"
            maxW="150px"
            mx="auto"
            h={{ base: "60px", md: "60px" }}
            // border="1px solid red"
            //
          >
            <Image
              src={image}
              alt={alt}
              // border="1px solid white"
              w="100%"
              h={{ base: "60px", md: "70px" }}
              objectFit="contain"
            />
          </Box>
        )}
        <Heading
          as="h3"
          fontSize={{ base: "1.5rem", md: "2.5rem", xl: "3rem" }}
          lineHeight="1.25"
          fontWeight="700"
          whiteSpace={{ base: "none", md: "pre-line" }}
        >
          {heading}
        </Heading>
        <Text
          whiteSpace="pre-line"
          fontSize="1rem"
          lineHeight="1.5"
          fontWeight="400"
        >
          {text}
        </Text>
      </VStack>
    </Box>
  );
};
