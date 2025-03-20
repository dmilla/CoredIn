import { Button, VStack } from "@chakra-ui/react";
import { CredentialSection, CredentialSectionProps } from "./CredentialSection";
import { FC } from "react";
import { FaPlus } from "react-icons/fa6";
import { Link as ReactRouterLink } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export type CredentialsContainerProps = {
  profileWallet: string;
  sections: CredentialSectionProps[];
  showRequestButton: boolean;
};

export const CredentialsContainer: FC<CredentialsContainerProps> = ({
  profileWallet,
  sections,
  showRequestButton
}) => {
  return (
    <VStack align="start" spacing="3em">
      {showRequestButton && (
        <Button
          as={ReactRouterLink}
          to={ROUTES.CREDENTIALS.REQUEST.path}
          variant="empty"
          size="sm"
          leftIcon={<FaPlus fontSize="1rem" />}
          iconSpacing="1em"
        >
          Request new credential
        </Button>
      )}
      {sections.map((section, index) => {
        return (
          <CredentialSection
            profileWallet={profileWallet}
            showEdit={showRequestButton}
            key={`credential-section-${index}`}
            section={section.section}
            credentials={section.credentials}
            tree={section.tree}
          />
        );
      })}
    </VStack>
  );
};
