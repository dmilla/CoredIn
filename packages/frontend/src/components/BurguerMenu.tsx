import { FC } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerFooter,
  DrawerCloseButton,
  Link,
  // Text,
  Flex,
  // useColorMode,
  useMediaQuery,
} from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
// import Logo from "@/assets/Logo.png";

export interface BurguerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BurguerMenu: FC<BurguerMenuProps> = ({ isOpen, onClose }) => {
  // const { colorMode, toggleColorMode } = useColorMode();
  const [isLargerThanLG] = useMediaQuery("(min-width: 62em)");

  // const ComingSoonBadge = (
  //   <Text
  //     ml={2}
  //     fontSize="xs"
  //     color="headingGrey"
  //     bg="bglight"
  //     px={2}
  //     borderRadius="md"
  //   >
  //     Coming Soon
  //   </Text>
  // );

  return (
    <>
      {!isLargerThanLG && (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />

          <DrawerContent>
            <Flex justify="space-between" align="center" my="2em" mx="1em">
              {/* There is a problem in positioning the X button on the left */}
              <DrawerCloseButton position="relative" mt="-6em" />
              {/* <Img src={Logo} h="36px" alt="Cored.in" /> */}
            </Flex>
            <Flex direction="column" gap="3em">
              <DrawerBody>
                <Flex flexDirection="column" gap={"1em"} alignItems="end">
                  <Link
                    as={ReactRouterLink}
                    to="/"
                    onClick={onClose}
                    fontWeight="600"
                  >
                    Home
                  </Link>
                </Flex>
              </DrawerBody>
              <DrawerFooter></DrawerFooter>
            </Flex>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};
