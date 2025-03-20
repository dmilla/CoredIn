import { Box, Text, useToast } from "@chakra-ui/react";

export const useCustomToast = () => {
  const toast = useToast();

  const successToast = (message: string) => {
    toast({
      status: "success",
      duration: 1500,
      position: "bottom",
      isClosable: true,
      render: () => (
        <Box
          color="brand.100"
          p="1em 2em"
          bg="brand.300"
          borderRadius="3em"
          textAlign="center"
          // position="relative"
          onClick={() => toast.closeAll()}
          cursor="default"
        >
          <Text as="span" textStyle="sm">
            {message}
          </Text>
          {/* <IconButton
            icon={<CloseIcon fontSize="0.625rem" />}
            py="0.5em"
            px="0.25em"
            variant="empty"
            color="inherit"
            _hover={{ color: "inherit" }}
            position="absolute"
            top="1px"
            right="2px"
            aria-label="Close the pop-up notifications."
            onClick={() => toast.closeAll()}
          /> */}
        </Box>
      )
    });
  };

  const errorToast = (message: string) => {
    toast({
      status: "error",
      duration: 1500,
      position: "bottom",
      isClosable: true,
      render: () => (
        <Box
          color="brand.100"
          p="1em 2em"
          bg="brand.400"
          borderRadius="3em"
          textAlign="center"
          // position="relative"
          onClick={() => toast.closeAll()}
          cursor="default"
        >
          <Text as="span" textStyle="sm">
            {message}
          </Text>
          {/* <IconButton
            icon={<CloseIcon fontSize="0.625rem" />}
            py="0.5em"
            px="0.25em"
            variant="empty"
            color="inherit"
            _hover={{ color: "inherit" }}
            position="absolute"
            top="1px"
            right="2px"
            aria-label="Close the pop-up notifications."
            onClick={() => toast.closeAll()}
          /> */}
        </Box>
      )
    });
  };

  return { successToast, errorToast };
};
