import { chainInfo } from "@/dependencies";
import {
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  VisuallyHidden
} from "@chakra-ui/react";
import { DID } from "@coredin/shared";
import { useChain } from "@cosmos-kit/react";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { RequestFunding } from ".";

interface ProfileRegistrationProps {
  did: DID;
  handleChangeUserName: (e: ChangeEvent<HTMLInputElement>) => void;
  usernameInput: string;
  registerProfile: () => void;
  isRegistering: boolean;
  isErrorUsername: boolean;
}

const MIN_BALANCE = 0.1;

export const NotRegisteredProfile: FC<ProfileRegistrationProps> = ({
  did,
  handleChangeUserName,
  usernameInput,
  registerProfile,
  isRegistering,
  isErrorUsername
}) => {
  const chainContext = useChain(chainInfo.chainName);
  const [balance, setBalance] = useState(0);
  const [isBalanceLoaded, setIsBalanceLoaded] = useState(false);

  const getBalance = async () => {
    if (!chainContext.address) {
      setBalance(0);
      setIsBalanceLoaded(false);
      return;
    }

    const client = await chainContext.getCosmWasmClient();
    const coin = await client.getBalance(
      chainContext.address,
      chainInfo.feeDenom
    );

    // TODO - REVIEW DECIMALS AFTER TESTNET, utestcore has 6 decimals!
    setBalance(Number((BigInt(coin.amount) * 1000000n) / 1000000n) / 1000000);
    setIsBalanceLoaded(true);
  };

  useEffect(() => {
    const interval = setInterval(getBalance, 5000);

    return () => clearInterval(interval);
  }, [chainContext.address]);

  if (!isBalanceLoaded) {
    return (
      <Center mt="32px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <HStack
      w="100%"
      maxW="1200px"
      minH="50vh"
      layerStyle="cardBox"
      mx="auto"
      mt="52px"
      justify="center"
      textAlign="center"
    >
      <VisuallyHidden>
        <Heading as="h1">Get started</Heading>
      </VisuallyHidden>
      {balance < MIN_BALANCE ? (
        <RequestFunding address={chainContext.address || ""} />
      ) : (
        <VStack spacing="8em" maxW="700px" mx="auto">
          <Heading
            as="h2"
            fontSize={{ base: "1rem", md: "1.25rem" }}
            color="brand.900"
          >
            Here is your new Decentralised Identifier (DID):
            <Text
              as="span"
              display="block"
              color="brand.900"
              mt="0.5em"
              wordBreak="break-all"
            >
              {did?.value}
            </Text>
          </Heading>
          <FormControl isInvalid={isErrorUsername}>
            <VisuallyHidden>
              <FormLabel as="label">Enter a username</FormLabel>
            </VisuallyHidden>
            <Input
              variant="flushed"
              placeholder="Enter username"
              onChange={handleChangeUserName}
              value={usernameInput}
              focusBorderColor="brand.300"
              errorBorderColor="brand.400"
              py="0.875em"
              textAlign="center"
              fontSize={{ base: "1.25rem", md: "1.75rem" }}
              color="brand.300"
            />
            <FormErrorMessage
              justifyContent="center"
              fontSize="1rem"
              color="brand.400"
            >
              This username already exists
            </FormErrorMessage>
            <FormHelperText fontSize="1rem" my="1em" color="other.200">
              At least 3 characters required, only letters and numbers allowed.
            </FormHelperText>
          </FormControl>

          <VStack spacing="1em">
            <Button
              mt="2em"
              isDisabled={usernameInput.length < 3}
              onClick={registerProfile}
              size="md"
              variant="primary"
              isLoading={isRegistering}
            >
              REGISTER
            </Button>
            <Text color="other.600" textStyle="sm">
              Please note that you will not be able to change your username
              later
            </Text>
          </VStack>
        </VStack>
      )}
    </HStack>
  );
};
