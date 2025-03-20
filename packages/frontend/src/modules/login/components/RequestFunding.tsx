import { ChangeNowIframe } from "@/components";
import { chainInfo } from "@/dependencies";
import { useCustomToast } from "@/hooks";
import { CopyIcon } from "@chakra-ui/icons";
import { VStack, Heading, Flex, Box } from "@chakra-ui/layout";
import { Button, Text, Link } from "@chakra-ui/react";
import { MAINNET_CHAIN_ID } from "@coredin/shared";
import React from "react";

interface RequestFundingProps {
  address: string;
}

export const RequestFunding: React.FC<RequestFundingProps> = ({ address }) => {
  const { successToast } = useCustomToast();

  const isMainnet = chainInfo.chainId === MAINNET_CHAIN_ID;

  return (
    <VStack spacing="2em">
      <Heading as="h2" color="brand.900">
        Get CORE tokens to register
      </Heading>
      <Flex as="ol" direction="column" gap="0.5em">
        <VStack as="li" spacing="1em" layerStyle="cardBox" px="1.5em">
          <Text color="brand.900">1. Copy your wallet address:</Text>
          <>
            <Button
              variant="empty"
              size="sm"
              color="brand.900"
              wordBreak="break-word"
              whiteSpace="normal"
              aria-label="Copy wallet address."
              onClick={() => {
                navigator.clipboard.writeText(address);
                successToast("Wallet copied to clipboard");
              }}
            >
              {address}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              wordBreak="break-word"
              whiteSpace="normal"
              leftIcon={<CopyIcon mr="0.5em" />}
              onClick={() => {
                navigator.clipboard.writeText(address);
                successToast("Wallet copied to clipboard");
              }}
            >
              Copy
            </Button>
          </>
        </VStack>
        {isMainnet && (
          <>
            <Box as="li" layerStyle="cardBox">
              <VStack spacing="1em">
                <Text color="brand.900" textAlign="center">
                  2. Purchase CORE tokens to your copied wallet address
                </Text>
                <ChangeNowIframe />
              </VStack>
            </Box>
            <Box as="li" layerStyle="cardBox">
              <Text color="brand.900" textAlign="center">
                3. Wait for the purchase to complete
              </Text>
            </Box>
          </>
        )}
        {!isMainnet && (
          <>
            <Box as="li" layerStyle="cardBox">
              <Text color="brand.900" textAlign="center">
                2. Go to{" "}
                <Link
                  href="https://docs.coreum.dev/docs/tools/faucet"
                  isExternal
                  color="brand.500"
                  textDecoration="underline"
                >
                  Coreum Faucet
                </Link>{" "}
                and click{" "}
                <Text as="span" fontWeight="700">
                  Testnet
                </Text>
                .
              </Text>
            </Box>
            <Box as="li" layerStyle="cardBox">
              <Text color="brand.900" textAlign="center">
                3. Paste your wallet address into the input field and click{" "}
                <Text as="span" fontWeight="700">
                  Request Fund
                </Text>
                .
              </Text>
            </Box>
          </>
        )}
        <Box as="li" layerStyle="cardBox">
          <Text color="brand.900" textAlign="center">
            4. Come back to this page and refresh if nothing has changed.
          </Text>
        </Box>
      </Flex>
    </VStack>
  );
};
