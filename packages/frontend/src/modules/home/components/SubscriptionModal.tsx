import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr
} from "@chakra-ui/react";
import { FC } from "react";

type SubscriptionModalProps = Omit<ModalProps, "children"> & {
  username: string;
  subscriptionPrice: string;
  subscriptionDurationDays: number;
  handleSubscribe: () => void;
};

export const SubscriptionModal: FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  username,
  subscriptionPrice,
  subscriptionDurationDays,
  handleSubscribe
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Subscription</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text textStyle="sm" mb="1em">
            By subscribing to this profile you will be able to see their private
            posts and credentials.
          </Text>

          <TableContainer whiteSpace="normal" mb="1em">
            <Table variant="unstyled" layout="fixed">
              <Tbody>
                <Tr>
                  <Td pl="0" pb="0">
                    Username:
                  </Td>
                  <Td px="0" pb="0">
                    {username}
                  </Td>
                </Tr>
                <Tr>
                  <Td pl="0" pb="0">
                    Price:
                  </Td>
                  <Td px="0" pb="0">
                    {subscriptionPrice} CORE
                  </Td>
                </Tr>
                <Tr>
                  <Td pl="0" pb="0">
                    Duration:
                  </Td>
                  <Td px="0" pb="0">
                    {subscriptionDurationDays} days
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="empty"
            color="other.600"
            size="sm"
            onClick={onClose}
            mr="1.5em"
          >
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubscribe}>
            Subscribe
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
