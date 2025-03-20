import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Box,
  Button
} from "@chakra-ui/react";
import { ChangeNowIframe } from "@/components";
import { useCustomToast } from "@/hooks";

type TopupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  address: string;
};

export const TopupModal: React.FC<TopupModalProps> = ({
  isOpen,
  onClose,
  address
}) => {
  const { successToast } = useCustomToast();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Top-up wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box maxW="100%" mb="1.5em">
            <Text color="brand.900">Your connected wallet:</Text>
            <Button
              variant="empty"
              size="sm"
              color="brand.900"
              wordBreak="break-word"
              whiteSpace="normal"
              aria-label="Copy wallet address."
              fontSize="0.875rem"
              onClick={() => {
                navigator.clipboard.writeText(address);
                successToast("Wallet copied to clipboard");
              }}
            >
              {address}
            </Button>
          </Box>
          <ChangeNowIframe />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
