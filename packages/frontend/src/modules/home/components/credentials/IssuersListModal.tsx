import {
  Avatar,
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from "@chakra-ui/react";
import { CredentialDTO, UserProfile } from "@coredin/shared";
import { FC } from "react";

type IssuersListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  issuers?: UserProfile[];
  state: CredentialDTO;
  setState: React.Dispatch<React.SetStateAction<CredentialDTO>>;
};

export const IssuersListModal: FC<IssuersListModalProps> = ({
  isOpen,
  onClose,
  issuers,
  state,
  setState
}) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>List of available issuers</ModalHeader>
        <ModalCloseButton />
        <ModalBody p="0">
          <VStack
            as="ul"
            display="block"
            role="listbox"
            id="issuers-listbox"
            listStyleType="none"
            align="start"
            borderRadius="1em"
          >
            {issuers?.map((issuer) => (
              <Flex
                as="li"
                role="option"
                key={`issuer-${issuer.issuerDid}`}
                value={issuer.issuerDid}
                // outline="1px solid yellow"
                direction="row"
                gap="0.5em"
                align="center"
                py="1.25em"
                px="1em"
                borderLeft="1px solid"
                borderLeftColor="transparent"
                borderBottom="1px solid"
                borderBottomColor="brand.100"
                _last={{ borderBottom: "none" }}
                cursor="pointer"
                _hover={{
                  color: "brand.500",
                  borderLeftColor: "brand.500"
                }}
                onClick={() => {
                  onClose();
                  setState({
                    ...state,
                    issuer: issuer.issuerDid || ""
                  });
                }}
              >
                <Avatar
                  name={issuer.username}
                  src={issuer.avatarUrl}
                  bg="brand.100"
                  color={issuer.avatarFallbackColor || "brand.500"}
                  border={issuer.avatarUrl || "1px solid #b0b0b0"}
                  size={{ base: "sm", sm: "md", lg: "md" }}
                />
                <VStack align="start" spacing="0em">
                  <Text as="span">{issuer.username}</Text>
                  <Box
                    color="other.600"
                    textOverflow="ellipsis"
                    display="inline"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    maxW={{ base: "250px", sm: "310px" }}
                    // border="1px solid red"
                  >
                    <Text
                      as="span"
                      display="block"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      overflow="hidden"
                    >
                      {issuer.issuerDid}
                    </Text>
                  </Box>
                </VStack>
              </Flex>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
