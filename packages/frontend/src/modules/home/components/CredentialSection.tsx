import { Box, Button, Flex, Heading, Icon } from "@chakra-ui/react";
import { CredentialDTO } from "@coredin/shared";
import { FC } from "react";
import { Credential } from "./Credential";
import { FaPlus } from "react-icons/fa6";
import MerkleTree from "merkletreejs";
import { Link as ReactRouterLink } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export type CredentialSectionProps = {
  profileWallet: string;
  section: string;
  credentials: CredentialDTO[];
  tree: MerkleTree;
  showEdit: boolean;
};

export const CredentialSection: FC<CredentialSectionProps> = ({
  profileWallet,
  section,
  credentials,
  tree,
  showEdit
}) => {
  if (credentials.length === 0) {
    return;
  }

  return (
    <Box as="section" w="100%">
      <Flex justify="space-between" align="center" mb="0.75em">
        <Heading
          as="h2"
          fontFamily="body"
          fontSize={{ base: "1.25rem", lg: "1.75rem" }}
          color="brand.900"
        >
          {section.toUpperCase()}
        </Heading>
        {showEdit && (
          <Button
            as={ReactRouterLink}
            to={ROUTES.CREDENTIALS.REQUEST.path}
            variant="empty"
            color="other.600"
            aria-label={`Add ${section}.`}
          >
            <Icon as={FaPlus} fontSize="1.5rem" />
          </Button>
        )}
      </Flex>
      {credentials.map((cred, index) => (
        <Credential
          key={`credential-${section}-${index}`}
          profileWallet={profileWallet}
          credential={cred}
          tree={tree}
          showOptions={showEdit}
        />
      ))}
    </Box>
  );
};
