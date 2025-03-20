import { Box } from "@chakra-ui/react";
import { chainInfo } from "@/dependencies";
import { useChain } from "@cosmos-kit/react";
import { Profile } from "../components";

const LoginPage = () => {
  const chainContext = useChain(chainInfo.chainName);
  const isUserConnected = chainContext.isWalletConnected;
  // chainContext.isWalletConnected; // this shows if the user is connected
  return (
    <Box
      mx="auto"
      w="100%"
      maxW="1920px"
      px={{ base: "1.5em", md: "2.5em", lg: "3.5em", xl: "4em" }}
    >
      <Profile />
    </Box>
  );
};

export default LoginPage;
