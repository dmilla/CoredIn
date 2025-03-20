import { useLoggedInServerState } from "@/hooks";
import { USER_QUERIES } from "@/queries";
import { ROUTES } from "@/router/routes";
import { formElementBorderStyles } from "@/themes";
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  VisuallyHidden,
  Text,
  Flex,
  Avatar,
  VStack,
  Box,
  ModalCloseButton
} from "@chakra-ui/react";
import { FC, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

type SearchModalType = {
  isSearchModalOpen: boolean;
  onSearchModalClose: () => void;
};

export const SearchModal: FC<SearchModalType> = ({
  isSearchModalOpen,
  onSearchModalClose
}) => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const { data: users } = useLoggedInServerState(
    USER_QUERIES.search(searchInput),
    {
      enabled: !!searchInput
    }
  );

  return (
    <Modal onClose={onSearchModalClose} isOpen={isSearchModalOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton
          top="-4em"
          right="0em"
          bg="#FFFFFFBF"
          color="brand.900"
          borderRadius="50%"
        />
        <ModalBody p="0">
          <FormControl>
            <VisuallyHidden>
              <FormLabel>Start typing a username.</FormLabel>
            </VisuallyHidden>
            <InputGroup>
              <InputLeftElement>
                <FaMagnifyingGlass />
              </InputLeftElement>
              <Input
                type="text"
                {...formElementBorderStyles}
                placeholder="Start typing a username"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </InputGroup>
          </FormControl>
          {users && (
            <VStack
              as="ul"
              display="block"
              listStyleType="none"
              align="start"
              borderRadius="1em"
              mt="1.5em"
            >
              {users.map((user) => {
                return (
                  <Flex
                    as="li"
                    key={`issuer-${user.did}`}
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
                      navigate(ROUTES.USER.buildPath(user.wallet));
                      onSearchModalClose();
                    }}
                  >
                    <Avatar
                      name={user.username}
                      src={user.avatarUrl}
                      bg="brand.100"
                      color={user.avatarFallbackColor || "brand.500"}
                      border={user.avatarUrl || "1px solid #b0b0b0"}
                      size={{ base: "sm", sm: "md", lg: "md" }}
                    />
                    <VStack align="start" spacing="0em">
                      <Text as="span">{user.username}</Text>
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
                          {user.issuerDid}
                        </Text>
                      </Box>
                    </VStack>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
