import { Box, BoxProps } from "@chakra-ui/react";
import { LogoIconColor } from ".";
import { toBottom, toLeft, toRight, toUp } from "@/constants";
import { motion } from "framer-motion";

const MotionBox = motion<Omit<BoxProps, "transition">>(Box);

export const MainBackground = () => {
  return (
    <Box
      w="100%"
      maxW="1920px"
      h="100dvh"
      filter="blur(14px) saturate(0%) opacity(35%)"
      //   border="5px solid red"
      position="fixed"
      top="0"
      left="50%"
      transform="translateX(-50%)"
      zIndex="-100"
      aria-hidden="true"
    >
      <MotionBox
        as={motion.div}
        {...toRight}
        h="100px"
        w="auto"
        position="absolute"
        top="1vh"
        left="810px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toBottom}
        h="100px"
        w="auto"
        position="absolute"
        top="2vh"
        right="250px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toLeft}
        h="80px"
        w="auto"
        position="absolute"
        top="20vh"
        left="520px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toUp}
        h="150px"
        w="auto"
        position="absolute"
        top="39vh"
        left="110px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toRight}
        h="80px"
        w="auto"
        position="absolute"
        top="37vh"
        right="630px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toBottom}
        h="130px"
        w="auto"
        position="absolute"
        top="46vh"
        left="750px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toLeft}
        h="200px"
        w="auto"
        position="absolute"
        top="46vh"
        right="300px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toUp}
        h="80px"
        w="auto"
        position="absolute"
        top="62vh"
        left="550px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toRight}
        h="100px"
        w="auto"
        position="absolute"
        top="85vh"
        left="360px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toBottom}
        h="100px"
        w="auto"
        position="absolute"
        top="77vh"
        right="760px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
      <MotionBox
        as={motion.div}
        {...toLeft}
        h="100px"
        w="auto"
        position="absolute"
        top="84vh"
        right="410px"
      >
        <LogoIconColor w="100%" h="100%" />
      </MotionBox>
    </Box>
  );
};
