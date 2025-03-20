import { CoredinClientContext } from "@/contexts/CoredinClientContext";
import { chainInfo } from "@/dependencies";
import { useContractRead, useCustomToast } from "@/hooks";
import { CONTRACT_QUERIES } from "@/queries";
import { formElementBorderStyles } from "@/themes";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
  Select,
  VStack
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import { useContext, useEffect, useState } from "react";

export const SubscriptionSettings = () => {
  const coredinClient = useContext(CoredinClientContext);
  const chainContext = useChain(chainInfo.chainName);
  const { successToast, errorToast } = useCustomToast();
  const { data: profileDid } = useContractRead(
    CONTRACT_QUERIES.getWalletDid(coredinClient!, chainContext.address || ""),
    { enabled: !!coredinClient && !!chainContext.address }
  );
  const { data: subscriptionPrice } = useContractRead(
    CONTRACT_QUERIES.getSubscriptionPrice(
      coredinClient!,
      profileDid?.did_info?.did ?? { value: "" }
    ),
    { enabled: !!coredinClient && !!profileDid?.did_info?.did }
  );
  const { data: subscriptionDays } = useContractRead(
    CONTRACT_QUERIES.getSubscriptionDuration(
      coredinClient!,
      profileDid?.did_info?.did ?? { value: "" }
    ),
    { enabled: !!coredinClient && !!profileDid?.did_info?.did }
  );
  const [subscriptionSettings, setSubscriptionSettings] = useState({
    price: "10",
    durationDays: 7
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (subscriptionPrice) {
      console.log(
        "Setting subscription price from chain value",
        subscriptionPrice
      );
      setSubscriptionSettings((prev) => ({
        price: subscriptionPrice
          ? (Number(subscriptionPrice.amount) / 1_000_000).toString()
          : "0", // Convert ucore to core
        durationDays: prev.durationDays
      }));
    }
  }, [subscriptionPrice]);

  useEffect(() => {
    if (subscriptionDays) {
      setSubscriptionSettings((prev) => ({
        price: prev.price,
        durationDays: parseInt(subscriptionDays)
      }));
    }
  }, [subscriptionDays]);

  const handleSubmit = () => {
    console.log(
      "Updating onchain subscription settings... to",
      subscriptionSettings
    );
    if (coredinClient) {
      setIsUpdating(true);
      coredinClient
        .setSubscription({
          price: {
            amount: (Number(subscriptionSettings.price) * 1_000_000).toString(),
            denom: chainInfo.feeDenom
          },
          duration: subscriptionSettings.durationDays.toString()
        })
        .then(() => {
          successToast("Updated onchain subscription settings successfully");
        })
        .catch((error) => {
          console.error(
            "Error subscribing to",
            profileDid?.did_info?.did,
            error
          );
          errorToast("Error updating onchain subscription settings");
        })
        .finally(() => {
          setIsUpdating(false);
        });
    }
  };

  return (
    <VStack spacing="2.5em" align="start">
      <Heading as="h2" fontFamily="body">
        Your subscription details
      </Heading>
      <VStack spacing="1.25em" align="start" w="100%">
        <FormControl>
          <FormLabel>Set the price of the subscription</FormLabel>
          <InputGroup>
            <Input
              type="number"
              min="0"
              placeholder="5.50"
              w="120px"
              {...formElementBorderStyles}
              onChange={(e) =>
                setSubscriptionSettings({
                  ...subscriptionSettings,
                  price: e.target.value
                })
              }
              value={subscriptionSettings.price}
            />
            <InputRightAddon
              color="brand.100"
              bg="brand.300"
              border="1px solid"
              borderColor="other.200"
              borderTopRightRadius="1.125em"
              borderBottomRightRadius="1.125em"
            >
              CORE
            </InputRightAddon>
          </InputGroup>
          <FormHelperText color="other.600">
            This is the price that users will be charged when subscribing to
            your profile. If you wish the subscription to be free, set the price
            to 0.
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Duration</FormLabel>
          <Select
            {...formElementBorderStyles}
            value={subscriptionSettings.durationDays}
            onChange={(e) =>
              setSubscriptionSettings({
                ...subscriptionSettings,
                durationDays: Number(e.target.value)
              })
            }
          >
            <option value="1">1 day</option>
            <option value="7">1 week</option>
            <option value="14">2 weeks</option>
            <option value="21">3 weeks</option>
            <option value="30">1 month</option>
            <option value="60">2 months</option>
            <option value="90">3 months</option>
          </Select>
          <FormHelperText color="other.600">
            This is the duration that users will be subscribed to your profile.
            After this period they will need to renew the subscription in order
            to get access to the subscription features again. 1 month equals to
            30 days.
          </FormHelperText>
        </FormControl>
      </VStack>

      <Text textStyle="sm">
        Please note, these changes will not affect your current subscribers.
      </Text>

      <Button
        variant="primary"
        size="md"
        w="100%"
        onClick={handleSubmit}
        isLoading={isUpdating}
      >
        Save
      </Button>
    </VStack>
  );
};
