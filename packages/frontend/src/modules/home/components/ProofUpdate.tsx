import { Button, Text, VStack } from "@chakra-ui/react";
import { FC } from "react";

type ProofUpdateProps = {
  updateMerkleRoot: () => void;
  isUpdateRootDisabled: boolean;
};

export const ProofUpdate: FC<ProofUpdateProps> = ({
  updateMerkleRoot,
  isUpdateRootDisabled
}) => {
  return (
    <VStack spacing="2em" w="100%" layerStyle="cardBox">
      <Text color="brand.900" textStyle="md" textAlign="center">
        We've noticed a change in your credentials. To ensure your subscribers
        can verify them, please update the onchain, privacy-preserving proof
        associated with your profile.
      </Text>
      <Button
        variant="primary"
        w="100%"
        onClick={updateMerkleRoot}
        isDisabled={isUpdateRootDisabled}
      >
        Update
      </Button>
    </VStack>
  );
};
