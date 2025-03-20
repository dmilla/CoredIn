import { formElementBorderStyles } from "@/themes";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
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
  Text
} from "@chakra-ui/react";
import { FC, useState } from "react";
import { useChain } from "@cosmos-kit/react";
import { chainInfo } from "@/dependencies";

type TransferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
};

export const TransferModal: FC<TransferModalProps> = ({
  isOpen,
  onClose,
  balance
}) => {
  const { address, getSigningCosmWasmClient } = useChain(chainInfo.chainName);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [toAddress, setToAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const isInvalidTransferAmount = transferAmount && transferAmount > balance;

  const handleClose = () => {
    onClose();
    setTransferAmount(0);
    setToAddress("");
    setMemo("");
  };

  const handleSend = async () => {
    if (!address || !toAddress) {
      return;
    }

    setIsSending(true);
    try {
      // Sign and broadcast somehow fails with capsule..
      // signAndBroadcast([msg], fee, memo);
      const client = await getSigningCosmWasmClient();
      await client.sendTokens(
        address,
        toAddress,
        [
          {
            denom: chainInfo.feeDenom,
            // TODO - move decimals to shared...
            amount: (transferAmount * 1000000).toString()
          }
        ],
        "auto",
        memo
      );
    } catch (error) {
      console.error(error);
    }

    setIsSending(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transfer to another wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="2em">
            <Flex direction="column-reverse" gap="0em">
              <Heading
                as="h2"
                color="other.200"
                fontSize="1rem"
                textTransform="uppercase"
              >
                Wallet balance
              </Heading>
              <Text as="span" fontSize="2rem" fontWeight="700">
                {`${balance} CORE`}
              </Text>
            </Flex>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <InputGroup justifyContent="center" alignItems="center">
                <Input
                  textAlign="center"
                  alignContent="center"
                  type="number"
                  min="0"
                  max={`${balance}`}
                  placeholder={`${balance}`}
                  {...formElementBorderStyles}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  isInvalid={isInvalidTransferAmount || false}
                />
                <InputRightAddon
                  color="brand.100"
                  bg={"brand.300"}
                  border="1px solid"
                  borderColor="other.200"
                  borderTopRightRadius="1.125em"
                  borderBottomRightRadius="1.125em"
                >
                  CORE
                </InputRightAddon>
              </InputGroup>
              {/* {isInvalidTransferAmount && (
                <FormHelperText color="brand.400">
                  Transfer amount cannot be greater than your current balance
                </FormHelperText>
              )} */}
            </FormControl>
            <FormControl>
              <FormLabel>Wallet address</FormLabel>
              <Input
                type="text"
                {...formElementBorderStyles}
                placeholder={`${chainInfo.bech32Prefix}...`}
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>
                Memo (Required for CEXes and other services)
              </FormLabel>
              <Input
                type="text"
                {...formElementBorderStyles}
                placeholder={`Memo...`}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </FormControl>
          </Flex>
        </ModalBody>

        <ModalFooter mt="1.5em">
          <Button
            variant="empty"
            color="other.600"
            size="sm"
            onClick={handleClose}
            mr="1.5em"
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            isDisabled={isInvalidTransferAmount || !toAddress}
            isLoading={isSending}
          >
            Transfer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
