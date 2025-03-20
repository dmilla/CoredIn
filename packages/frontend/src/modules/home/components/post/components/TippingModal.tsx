import confetti from "canvas-confetti";
import { useCustomToast } from "@/hooks";
import { formElementBorderStyles } from "@/themes";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr
} from "@chakra-ui/react";
import { FC, useState } from "react";

type TippingModalProps = {
  tipAmount: number;
  setTipAmount: (amount: number) => void;
  handleTip: () => Promise<boolean>;
  isTipModalOpen: boolean;
  setIsTipModalOpen: (open: boolean) => void;
};

export const TippingModal: FC<TippingModalProps> = ({
  tipAmount,
  setTipAmount,
  handleTip,
  isTipModalOpen,
  setIsTipModalOpen
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { successToast, errorToast } = useCustomToast();

  const onTip = async () => {
    setIsLoading(true);
    try {
      const success = await handleTip();
      if (success) {
        setIsTipModalOpen(false);
        successToast("Tip sent successfully");
        sendConfetti();
      } else {
        errorToast("Failed to send tip");
      }
    } catch (error) {
      console.error("Error sending tip:", error);
      errorToast("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const sendConfetti = () => {
    const scalar = 2;
    const coredinLogo = confetti.shapeFromPath({
      path: "M408.643 437.066C308.942 476.966 231.48 545.206 186.613 623.445C160.176 669.56 179.393 728.422 227.628 750.727C419.909 839.629 678.012 736.295 755.957 539.281C775.505 489.851 748.847 433.958 697.906 418.821C611.485 393.119 508.345 397.166 408.643 437.066Z M245.313 28.6195C245.037 28.73 244.761 28.8405 244.471 28.951C193.943 49.3084 172.863 109.801 199.576 157.283C287.171 312.988 518.299 414.609 692.977 374.806C746.556 362.597 776.941 305.779 757.628 254.305C683.493 56.6558 449.328 -56.4563 245.313 28.6195Z M253.775 293.901C236.559 250.839 208.479 215.317 173.842 189.117C128.16 154.562 61.9085 170.638 37.4317 222.43C-10.0448 322.918 -13.0957 446.43 32.3375 550.676C55.6132 604.097 123.066 622.065 169.548 586.943C257.35 520.609 297.454 400.44 253.775 293.901Z"
    });

    const defaults = {
      spread: 360,
      ticks: 180,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [coredinLogo],
      colors: ["#FBB030", "#FF550F", "#7F02FE"],
      scalar
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
        shapes: [coredinLogo]
      });
      confetti({
        ...defaults,
        particleCount: 5,
        shapes: [coredinLogo]
      });
      confetti({
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: [coredinLogo]
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  const commissionAmount = tipAmount * 0.05;
  const totalAmount = tipAmount + commissionAmount;

  return (
    <Modal
      isOpen={isTipModalOpen}
      onClose={() => setIsTipModalOpen(false)}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send Tip</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Enter the amount of CORE you'd like to tip.</FormLabel>
            <Flex m="10">
              <InputGroup justifyContent="center" alignItems="center">
                <Input
                  textAlign="center"
                  alignContent="center"
                  type="number"
                  min="0"
                  placeholder="5.50"
                  w="120px"
                  {...formElementBorderStyles}
                  value={tipAmount}
                  onChange={(e) => setTipAmount(Number(e.target.value))}
                />
                <InputRightAddon
                  color="brand.100"
                  bg="brand.300"
                  border="1px solid"
                  borderColor="other.200"
                  borderTopRightRadius="1.125em"
                  borderBottomRightRadius="1.125em"
                >
                  CORE
                </InputRightAddon>
              </InputGroup>
            </Flex>
          </FormControl>
          <TableContainer whiteSpace="normal" mt="1.5em">
            <Table variant="unstyled" layout="fixed" fontSize="sm">
              <Tbody>
                <Tr>
                  <Td pl="0" pb="0" w="60%">
                    Author gets:
                  </Td>
                  <Td px="0" pb="0" textAlign="right">
                    {tipAmount ? tipAmount.toFixed(2) : "0.00"} CORE
                  </Td>
                </Tr>
                <Tr borderBottom="1px solid black">
                  <Td pl="0" pb="1em" pt="0" w="60%">
                    Platform commission 5%:
                  </Td>
                  <Td px="0" pb="1em" pt="0" textAlign="right">
                    {tipAmount ? commissionAmount.toFixed(2) : "0.00"} CORE
                  </Td>
                </Tr>
                <Tr>
                  <Td pl="0" pt="1em" pb="0.5em" w="60%" fontSize="xl">
                    Total to pay:
                  </Td>
                  <Td
                    px="0"
                    pt="1em"
                    pb="0.5em"
                    textAlign="right"
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    {tipAmount ? totalAmount.toFixed(2) : "0.00"} CORE
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button
            variant="primary"
            isDisabled={tipAmount === 0 || isLoading}
            onClick={onTip}
            isLoading={isLoading}
          >
            Pay {totalAmount.toFixed(2)} CORE
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
