import {
  useAuth,
  useCustomToast,
  useLoggedInServerState,
  useMutableServerState
} from "@/hooks";
import { USER_MUTATIONS, USER_QUERIES } from "@/queries";
import { Box, Center } from "@chakra-ui/layout";
import { ProfileInfo, GetDIDResponse } from "@coredin/shared";
import { useContext, useEffect, useState } from "react";
import { Spinner } from "@chakra-ui/spinner";
import { CoredinClientContext } from "@/contexts/CoredinClientContext";
import { useChain } from "@cosmos-kit/react";
import { Navigate, useSearchParams } from "react-router-dom";
import { NotRegisteredProfile, RequireWalletConnection } from ".";
import { ROUTES } from "@/router/routes";
import { chainInfo } from "@/dependencies";

export const Profile = () => {
  const chainContext = useChain(chainInfo.chainName);
  const [queryParams] = useSearchParams();
  const coredinClient = useContext(CoredinClientContext);
  const { needsAuth } = useAuth();
  const { data: userProfile, isLoading } = useLoggedInServerState(
    USER_QUERIES.getUser(chainContext.address || "", needsAuth),
    {
      enabled: !!chainContext.address
    }
  );
  const { mutateAsync: updateProfile } = useMutableServerState(
    USER_MUTATIONS.updateProfile()
  );
  const [onchainProfile, setOnchainProfile] = useState<ProfileInfo | null>(
    null
  );
  const [usernameInput, setUsernameInput] = useState<string>(
    userProfile?.username || ""
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingContract, setIsLoadingContract] = useState(true);
  const [isErrorUsername, setIsErrorUsername] = useState(false);
  const { errorToast } = useCustomToast();

  const updateOnchainProfile = () => {
    if (chainContext.address) {
      console.log("getting onchain profile");
      coredinClient
        ?.getWalletDID({ wallet: chainContext.address })
        .then((registered_did: GetDIDResponse) => {
          console.log(registered_did);
          if (registered_did.did_info) {
            setOnchainProfile(registered_did.did_info);
          }
          setIsLoadingContract(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoadingContract(false);
        });
    } else {
      setOnchainProfile(null);
    }

    console.log("On chain DID...", onchainProfile?.did);
    console.log("userProfile DID...", userProfile?.did);
    console.log("userProfile DID...", userProfile?.did);
  };

  useEffect(updateOnchainProfile, [
    chainContext.address,
    chainContext.isWalletConnected,
    coredinClient
  ]);

  const registerProfile = () => {
    if (
      userProfile &&
      (onchainProfile === null || onchainProfile?.did !== userProfile.did) &&
      usernameInput.length > 2
    ) {
      setIsRegistering(true);
      console.log("Contract address...", coredinClient?.contractAddress);
      console.log("Registering profile onchain...", userProfile.did);
      coredinClient
        ?.register({
          did: userProfile.did!,
          username: usernameInput
        })
        .then((result) => {
          console.log(result);
          updateOnchainProfile();
          // This forces the backend to retrieve the new username from the blockchain
          updateProfile({
            profile: {}
          });
          setIsRegistering(false);
        })
        .catch((error: Error) => {
          console.log("error while registering");
          console.error(error);
          updateOnchainProfile();
          setIsRegistering(false);
          if (error.message.includes("Name has been taken")) {
            setIsErrorUsername(true);
          } else {
            errorToast("Something went wrong while registering");
          }
        });
    }
  };

  const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check if the input contains only letters (uppercase and lowercase)
    if ((/^[a-zA-Z0-9]+$/.test(value) || value === "") && value.length <= 64) {
      setUsernameInput(value);
    }
  };

  return (
    <Box>
      {(isLoadingContract || isLoading) && chainContext.address && (
        <Center mt="32px">
          <Spinner size="xl" color="brand.500" />
        </Center>
      )}
      {!chainContext.address && <RequireWalletConnection />}
      {!isLoadingContract &&
        userProfile &&
        (!onchainProfile ||
          onchainProfile?.did.value !== userProfile.did?.value) && (
          <NotRegisteredProfile
            did={userProfile.did!}
            handleChangeUserName={handleChangeUserName}
            usernameInput={usernameInput}
            registerProfile={registerProfile}
            isRegistering={isRegistering}
            isErrorUsername={isErrorUsername}
          />
        )}
      {onchainProfile &&
        chainContext.isWalletConnected &&
        userProfile &&
        onchainProfile.did.value === userProfile.did?.value && (
          <Navigate
            to={
              queryParams.get("redirect") ??
              (userProfile.username === ""
                ? ROUTES.SETTINGS.path
                : ROUTES.HOME.path)
            }
          />
        )}
    </Box>
  );
};
