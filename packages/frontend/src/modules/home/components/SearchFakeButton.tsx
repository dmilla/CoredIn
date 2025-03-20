import { formElementBorderStyles } from "@/themes";
import { Button, Text } from "@chakra-ui/react";
import { FC } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

type SearchFakeButtonProps = {
  onSearchModalOpen: () => void;
};

export const SearchFakeButton: FC<SearchFakeButtonProps> = ({
  onSearchModalOpen
}) => {
  return (
    <Button
      {...formElementBorderStyles}
      borderColor="#E6E6E6" // same as in layerStyle="cardBox"
      w="100%"
      bg="#FFFFFFBF" // same as in layerStyle="cardBox"
      backdropFilter="blur(14px)"
      color="other.600"
      fontSize={{ base: "0.875rem", lg: "1rem" }}
      fontWeight="400"
      textTransform="none"
      leftIcon={<FaMagnifyingGlass />}
      onClick={onSearchModalOpen}
    >
      <Text as="span" mr="auto">
        Search users
      </Text>
    </Button>
  );
};
