import {
  Button,
  ButtonProps,
  Img,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import React, { useEffect } from "react";
import { FC } from "react";
import { chainInfo, persistentStorageService } from "@/dependencies";
import { ConnectedWalletKey } from "@/constants";
import { ROUTES } from "@/router/routes";
import {
  Link as ReactRouterLink,
  useNavigate,
  useSearchParams
} from "react-router-dom";

interface LoginButtonProps extends ButtonProps {
  variant: "primary" | "empty";
  size?: "sm" | "md";
  signInText: string;
  username?: string;
}

export const LoginButton: FC<LoginButtonProps> = ({
  variant,
  size = "md",
  signInText,
  username,
  ...props
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchParams] = useSearchParams();
  const chainContext = useChain(chainInfo.chainName);
  const navigate = useNavigate();

  useEffect(() => {
    if (chainContext.address) {
      persistentStorageService.save(ConnectedWalletKey, chainContext.address);

      return;
    }

    persistentStorageService.remove(ConnectedWalletKey);
  }, [chainContext.address, chainContext.isWalletConnected]);

  const handleDisconnectWallet = React.useCallback(() => {
    if (chainContext.isWalletConnected) {
      chainContext.disconnect();
    }
  }, [chainContext]);

  const wallets =
    searchParams.get("mobile") !== "true"
      ? chainContext.walletRepo.wallets.filter(
          (wallet) => !wallet.walletInfo.name.includes("mobile")
        )
      : chainContext.walletRepo.wallets;

  if (chainContext.isWalletConnected) {
    return (
      <Stack
        direction={{ base: "column", sm: "row" }}
        spacing={{ base: "0em", sm: "0.75em" }}
        align={{ base: "end", sm: "center" }}
      >
        {username && (
          <Link
            as={ReactRouterLink}
            to={
              username && chainContext.address
                ? ROUTES.USER.buildPath(chainContext.address)
                : "#"
            }
            _hover={{ textDecoration: "none" }}
            color="brand.500"
            fontSize={{ base: "0.85rem", md: "1rem" }}
            maxW={{ base: "12ch", sm: "none" }}
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
          >
            {username}
          </Link>
        )}
        <Button
          bg="none"
          color="other.600"
          variant={variant}
          size="xs"
          _hover={{
            bg: "none",
            color: "brand.900"
          }}
          onClick={handleDisconnectWallet}
        >
          <Text fontFamily="inherit" fontSize="inherit" mt="auto">
            Sign Out
          </Text>
        </Button>
      </Stack>
    );
  } else {
    return (
      <>
        <Button
          as={ReactRouterLink}
          variant={variant}
          size={size}
          onClick={() => {
            location.pathname !== ROUTES.LOGIN.path &&
              navigate(ROUTES.LOGIN.path);
            location.pathname === ROUTES.LOGIN.path && onOpen();
          }}
          {...props}
        >
          {signInText}
        </Button>

        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize={{ base: "1.25rem", lg: "1.5rem" }}
              textTransform="uppercase"
              color="brand.500"
            >
              Connect Wallet
            </ModalHeader>
            <ModalCloseButton
              size="xl"
              top="24px"
              right="24px"
              color="brand.900"
            />
            <ModalBody>
              <VStack as="ul" gap="1em" align="start">
                {wallets.map((wallet) => {
                  return (
                    <li key={`wallet-${wallet.walletInfo.prettyName}`}>
                      <Button
                        variant="empty"
                        size="md"
                        color="brand.900"
                        textTransform="none"
                        onClick={
                          wallet.walletInfo.name === "leap-capsule-social-login"
                            ? () => {
                                onClose();
                                // Add a small delay to avoid both modals rendering at same time and getting the focus error in the console
                                setTimeout(
                                  () => window.openCapsuleModal(),
                                  300
                                );
                              }
                            : () => {
                                if (wallet.walletInfo.name.includes("mobile")) {
                                  onClose();
                                  chainContext.openView();
                                  setTimeout(() => {
                                    [...document.getElementsByTagName("button")]
                                      .find(
                                        (button) =>
                                          button.getAttribute("title") ===
                                          wallet.walletInfo.prettyName
                                      )
                                      ?.click();
                                  }, 100);
                                } else {
                                  wallet.connect();
                                }
                              }
                        }
                        key={wallet.walletName}
                        leftIcon={
                          <Img
                            src={
                              typeof wallet.walletInfo.logo === "string"
                                ? wallet.walletInfo.logo
                                : wallet.walletInfo.logo?.minor
                            }
                            maxW="1.5rem"
                            borderRadius="50%"
                            mr="0.5em"
                          />
                        }
                      >
                        {wallet.walletInfo.prettyName}
                      </Button>
                    </li>
                  );
                })}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }
};
