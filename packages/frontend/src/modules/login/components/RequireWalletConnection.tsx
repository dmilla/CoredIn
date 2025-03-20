import { LoginButton } from "@/components";
import {
  VStack,
  Text,
  Heading,
  Link,
  Box,
  HStack,
  Center
} from "@chakra-ui/react";
import { SUPPORTED_WALLETS } from "../constants";
import {
  CapsuleProvider,
  OAuthMethod
} from "@leapwallet/cosmos-social-login-capsule-provider";
import { CustomCapsuleModalView } from "@leapwallet/cosmos-social-login-capsule-provider-ui";
// Note: Import the necessary styles for the Leap Capsule Provider UI
import "@leapwallet/cosmos-social-login-capsule-provider-ui/styles.css";
import { useState } from "react";
import { chainInfo } from "@/dependencies";
import { useChain } from "@cosmos-kit/react";

export const RequireWalletConnection = () => {
  const chainContext = useChain(chainInfo.chainName);
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);

  // Load capsule API_KEY and ENV
  const env = import.meta.env.VITE_CAPSULE_ENV;
  const apiKey = import.meta.env.VITE_CAPSULE_KEY;

  // Define options for the CapsuleProvider
  const options = {
    env,
    apiKey,
    opts: {
      emailPrimaryColor: "#ff5733",
      homepageUrl: "https://cored.in",
      portalTheme: {
        backgroundColor: "#ffffff",
        foregroundColor: "#ff5733"
        // borderRadius: "lg"
      }
    }
  };
  // Create a new CapsuleProvider instance with the options
  const capsuleProvider = new CapsuleProvider(options);

  const capsuleWallet = chainContext.walletRepo.wallets.find(
    (wallet) => wallet.walletInfo.name === "leap-capsule-social-login"
  );

  return (
    <>
      <VStack
        minH="66vh"
        align="center"
        justify="center"
        spacing="10vh"
        textAlign="center"
        maxW="600px"
        mx="auto"
        pt="2vh"
        // border="1px solid red"
      >
        <Heading
          as="h1"
          fontSize={{ base: "3rem", md: "4rem" }}
          fontWeight="700"
          lineHeight="1.25"
        >
          Connect your wallet to begin
        </Heading>
        <VStack spacing="1rem" fontSize={{ base: "1rem", md: "1.25rem" }}>
          <LoginButton variant="primary" size="md" signInText="Sign in" />
          <Text
            color="brand.900"
            fontSize={{ base: "1rem", md: "1.25rem" }}
            mt="4vh"
          >
            Don't have a wallet yet? We support the following:
          </Text>
          <HStack
            as="ul"
            listStyleType="none"
            spacing={{ base: "1.5em", md: "1em" }}
          >
            {SUPPORTED_WALLETS.map((wallet) => (
              <Box as="li" key={`supported-wallet-${wallet.title}`}>
                <Link
                  href={wallet.href}
                  isExternal
                  color="brand.900"
                  _hover={{
                    color: "brand.300"
                  }}
                  _focus={{
                    color: "brand.300"
                  }}
                >
                  {wallet.title}
                </Link>
              </Box>
            ))}
          </HStack>
          <VStack gap="0.5em" mt="1em">
            <Heading
              as="h2"
              fontSize={{ base: "1.25rem", md: "1.5rem" }}
              fontWeight="500"
              // lineHeight="1.25"
            >
              You can also use your email or social login.
            </Heading>
            <Link
              href="https://www.usecapsule.com/"
              isExternal
              color="brand.900"
              _hover={{
                color: "brand.300"
              }}
              _focus={{
                color: "brand.300"
              }}
            >
              (Powered by Capsule wallet)
            </Link>
          </VStack>
        </VStack>
      </VStack>
      <Center className="leap-ui" position="absolute">
        {/* Step 12: Render the CustomCapsuleModalView component */}
        <CustomCapsuleModalView
          oAuthMethods={[
            OAuthMethod.APPLE,
            OAuthMethod.DISCORD,
            OAuthMethod.FACEBOOK,
            OAuthMethod.GOOGLE,
            OAuthMethod.TWITTER
          ]}
          capsule={capsuleProvider.getClient()}
          showCapsuleModal={showCapsuleModal}
          setShowCapsuleModal={setShowCapsuleModal}
          theme="light"
          onAfterLoginSuccessful={() => {
            console.log("Login with email successful");
            capsuleWallet?.connect();
          }}
          onLoginFailure={() => {
            console.error("Unable to login via email with capsule");
          }}
        />
      </Center>
    </>
  );
};
