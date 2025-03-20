import { CoredinClientContext } from "@/contexts/CoredinClientContext";
import {
  useAuth,
  useContractRead,
  useCustomToast,
  useLoggedInServerState
} from "@/hooks";
import { CONTRACT_QUERIES, USER_QUERIES } from "@/queries";
import {
  BoxProps,
  Button,
  HStack,
  Icon,
  Link,
  Text,
  VStack
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import { useCallback, useContext } from "react";
import { FaArrowRightFromBracket, FaIdCard } from "react-icons/fa6";
import { prettifyDid } from "../helpers/prettifyDid";
import { CopyIcon } from "@chakra-ui/icons";
import { ROUTES } from "@/router/routes";
import { Link as ReactRouterLink } from "react-router-dom";
import { chainInfo } from "@/dependencies";

type UserSignOutProps = BoxProps & {
  isMobile?: boolean;
};

export const UserSignOut = ({ isMobile, ...props }: UserSignOutProps) => {
  const chainContext = useChain(chainInfo.chainName);
  const { needsAuth } = useAuth();
  const { data: userProfile } = useLoggedInServerState(
    USER_QUERIES.getUser(chainContext.address || "", needsAuth),
    {
      enabled: !!chainContext.address
    }
  );
  const handleDisconnectWallet = useCallback(() => {
    if (chainContext.isWalletConnected) {
      chainContext.disconnect();
    }
  }, [chainContext]);
  const coredinClient = useContext(CoredinClientContext);
  const { successToast } = useCustomToast();
  const { data: walletDid } = useContractRead(
    CONTRACT_QUERIES.getWalletDid(coredinClient!, chainContext.address || ""),
    { enabled: !!coredinClient && !!chainContext.address }
  );

  const copyDid = () => {
    if (walletDid?.did_info) {
      navigator.clipboard.writeText(walletDid.did_info.did.value);
      successToast("DID copied to clipboard");
    }
  };

  return (
    <HStack
      spacing="1em"
      align="start"
      layerStyle={isMobile ? "" : "cardBox"}
      p={isMobile ? "" : "2em"}
      w="100%"
      {...props}
    >
      <Icon as={FaIdCard} fontSize="1.5rem" />
      <VStack align="start" spacing="1.5em">
        <Link
          as={ReactRouterLink}
          to={
            userProfile?.username && chainContext.address
              ? ROUTES.USER.buildPath(chainContext.address)
              : "#"
          }
          _hover={{ textDecoration: "none" }}
        >
          <Text as="span" color="brand.900" fontSize="1rem">
            {`${userProfile?.username || "No username"}`}
          </Text>
        </Link>
        <Button
          variant="empty"
          fontSize="0.825rem"
          mt="-1.75em"
          color="brand.900"
          rightIcon={<CopyIcon ml="0.5em" />}
          onClick={copyDid}
        >
          {walletDid?.did_info && prettifyDid(walletDid.did_info.did)}
        </Button>
        <Button
          variant="empty"
          size="xs"
          color="other.600"
          onClick={handleDisconnectWallet}
          rightIcon={<FaArrowRightFromBracket />}
        >
          <Text as="span" mt="3px" mr="0.5em">
            Sign out
          </Text>
        </Button>
      </VStack>
    </HStack>
  );
};
