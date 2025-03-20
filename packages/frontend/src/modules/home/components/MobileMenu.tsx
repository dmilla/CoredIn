import {
  Button,
  Center,
  Modal,
  ModalCloseButton,
  ModalContent,
  useDisclosure
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa6";
import { NavigationList, UserSignOut } from ".";
import { useChain } from "@cosmos-kit/react";
import { chainInfo } from "@/dependencies";

export const MobileMenu = () => {
  const chainContext = useChain(chainInfo.chainName);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        rightIcon={<FaBars />}
        aria-label="Menu."
        bg="none"
        _hover={{ bg: "none" }}
        _active={{ bg: "none" }}
        onClick={onOpen}
      />
      {isOpen && (
        <Modal size="full" isOpen={isOpen} onClose={onClose}>
          <ModalContent as="nav" h="100%">
            <ModalCloseButton />
            <Center
              flexDirection="column"
              gap="12%"
              px="2em"
              h="100%"
              alignItems={{ base: "flex-start", sm: "center" }}
            >
              <NavigationList
                wallet={chainContext.address || ""}
                isPostPage={false}
                pendingRequests={undefined}
                unreadMessages={0}
                unseenTips={0}
                closeMobileMenu={onClose}
              />

              <UserSignOut isMobile w="max-content" />
            </Center>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
