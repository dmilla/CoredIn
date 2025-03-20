import { BaseServerStateKeys } from "@/constants";
import { CoredinClientContext } from "@/contexts/CoredinClientContext";
import { useCustomToast, useMutableServerState } from "@/hooks";
import { USER_MUTATIONS } from "@/queries";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Button,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { CredentialDTO } from "@coredin/shared";
import { useChain } from "@cosmos-kit/react";
import { useQueryClient } from "@tanstack/react-query";
import MerkleTree from "merkletreejs";
import { FC, useContext, useRef } from "react";
import { FaEllipsis, FaTrash } from "react-icons/fa6";
import { Link as ReactRouterLink } from "react-router-dom";
import { generateProof } from "../helpers/generateProof";
import { ROUTES } from "@/router/routes";
import { CredentialContent } from "./credentials";
import { chainInfo } from "@/dependencies";

type CredentialProps = {
  profileWallet: string;
  credential: CredentialDTO;
  tree: MerkleTree;
  showOptions: boolean;
};

export const Credential: FC<CredentialProps> = ({
  profileWallet,
  credential,
  tree,
  showOptions
}) => {
  const {
    id,
    title,
    subjectDid,
    establishment,
    startDate,
    endDate,
    verified,
    issuer,
    issuerWallet,
    issuerUsername
  } = credential;
  const chainContext = useChain(chainInfo.chainName);
  const coredinClient = useContext(CoredinClientContext);
  const { mutateAsync, isPending: isDeleting } = useMutableServerState(
    USER_MUTATIONS.deleteCredential(id)
  );
  const { successToast } = useCustomToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const verifyLeaf = () => {
    if (chainContext.address) {
      console.log("verifying leaf...");
      const { leaf, proof } = generateProof(credential, tree);
      coredinClient
        ?.verifyCredential({
          did: { value: subjectDid },
          credentialHash: leaf,
          merkleProofs: proof
        })
        .then((result: boolean) => {
          console.log(result);
          if (result) {
            successToast("Credential successfully verified onchain");
          }
        });
    }
  };

  const handleDelete = () => {
    mutateAsync({ permanent: true }).then(() => {
      successToast("Credential deleted successfully");
      queryClient.invalidateQueries({
        queryKey: [BaseServerStateKeys.USER]
      });
    });
    onClose();
  };

  return (
    <HStack
      as="article"
      align="start"
      borderBottom="2px solid"
      borderBottomColor="brand.100"
      _last={{ borderBottom: "none", pb: "0" }}
      py="1.5em"
      // border="1px solid red"
    >
      <VStack
        align="start"
        spacing="1em"
        color={verified ? "brand.900" : "other.200"}
        w="100%"
      >
        {verified && issuer && issuerWallet !== profileWallet && (
          <Badge cursor="pointer" onClick={verifyLeaf} variant="verified">
            Verified
          </Badge>
        )}
        <CredentialContent
          title={title}
          establishment={establishment}
          startDate={startDate}
          endDate={endDate}
        />

        {verified &&
          issuer &&
          (issuerWallet === profileWallet ? (
            <Text fontSize={{ base: "0.875rem", lg: "1rem" }} lineHeight="1.5">
              The credential is self-issued
            </Text>
          ) : (
            <Text fontSize={{ base: "0.875rem", lg: "1rem" }} lineHeight="1.5">
              {`Verified by `}
              <Link
                to={ROUTES.USER.buildPath(credential.issuerWallet)}
                as={ReactRouterLink}
                _hover={{ color: "brand.300" }}
                wordBreak="break-word"
              >
                @{issuerUsername}
              </Link>
            </Text>
          ))}
      </VStack>
      {showOptions && (
        <Menu placement="bottom-end" autoSelect={false}>
          <MenuButton
            as={IconButton}
            variant="empty"
            color="other.600"
            aria-label="See menu."
            icon={<FaEllipsis fontSize="1.5rem" />}
            size="lg"
            isLoading={isDeleting}
            mt="-0.675em"
          />
          <MenuList>
            <MenuItem
              onClick={onOpen}
              // border="1px solid red"
              icon={<FaTrash color="red" />}
            >
              <Text as="span" color="red">
                Delete
              </Text>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        motionPreset="slideInBottom"
        isCentered
        closeOnEsc
        closeOnOverlayClick
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize={{ base: "1.25rem", lg: "1.5rem" }}
              fontWeight="700"
              textTransform="uppercase"
            >
              Delete credential
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>Are you sure? You can't undo this action afterwards.</Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant="empty"
                color="other.600"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                bg="brand.400"
                onClick={handleDelete}
                ml="1.5em"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </HStack>
  );
};
