import {
  Box,
  Heading,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  VStack,
  useSteps
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  appearFromRightOneByOne,
  fadeInOneByOne,
  NAV_SECTIONS,
  ROADMAP_STEPS
} from "../constants";

export const Roadmap = () => {
  const { activeStep } = useSteps({
    index: 4,
    count: ROADMAP_STEPS.length
  });

  return (
    <VStack
      as="section"
      w="100%"
      id={NAV_SECTIONS.ROADMAP}
      // h="min-content"
      minH={{ base: "92vh", md: "89vh" }} // NOTE: Do not modify this only as the nav bar and other page sections also rely on vh to ensure content does not overlap.
      pt={{ base: "8vh", md: "11vh" }} // NOTE: Do not modify this only as the nav bar and other page sections also rely on vh to ensure content does not overlap.
      spacing="5em"
      overflowX="hidden"
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
          Our progress
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
      <Stepper
        index={activeStep}
        orientation="vertical"
        minH="600px"
        gap="1em"
        // border="1px solid red"
      >
        {ROADMAP_STEPS.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box
              flexShrink="0"
              w="600px"
              maxW="78vw"
              pl="1.5em"
              pb="3.125em"
              as={motion.div}
              variants={appearFromRightOneByOne}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0 }}
              custom={index}
            >
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator
              as={motion.div}
              variants={fadeInOneByOne}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0 }}
              custom={index}
            />
          </Step>
        ))}
      </Stepper>
    </VStack>
  );
};
