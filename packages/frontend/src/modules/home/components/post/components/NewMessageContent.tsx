import { AutoResizeTextarea } from "@/components";
import {
  Avatar,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Select
} from "@chakra-ui/react";
import { Dispatch, FC, SetStateAction } from "react";
import { SubscriptionInfo, UserProfile } from "@coredin/shared";
import { formElementBorderStyles } from "@/themes";

export type NewMessageProps = {
  postContent: string;
  setPostContent: Dispatch<SetStateAction<string>>;
  handlePost: () => void;
  isLoading: boolean;
  subscriptions: SubscriptionInfo[];
  recipients: string[];
  setRecipients: (recipients: string[]) => void;
  userProfile: UserProfile;
};

export const NewMessageContent: FC<NewMessageProps> = ({
  postContent,
  setPostContent,
  handlePost,
  isLoading,
  recipients,
  setRecipients,
  userProfile,
  subscriptions
}) => {
  // const { isOpen, onOpen, onClose } = useDisclosure();

  // CURRENTLY NOT USED BY NATALIA

  return (
    <Flex
      direction="column"
      align="start"
      gap="1.125em"
      w="100%"
      h="max-content"
      layerStyle="cardBox"
      // outline="1px solid red"
      // p="1.125em"
      py="1em"
    >
      <Flex align="start" gap="1.125em" w="100%">
        <Avatar
          name={userProfile.username}
          src={userProfile.avatarUrl}
          size={{ base: "sm", sm: "md" }}
          bg="brand.100"
          color={userProfile.avatarFallbackColor || "brand.500"}
          border={userProfile.avatarUrl || "1px solid #b0b0b0"}
        />

        <AutoResizeTextarea
          placeholder="Share your thoughts"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          variant="unstyled"
          borderRadius="0.5em"
          p="0.5em"
        />
      </Flex>
      <HStack alignSelf="end" spacing="1.5em">
        <FormControl>
          <FormLabel>Recipient</FormLabel>
          <Select
            {...formElementBorderStyles}
            value={recipients}
            onChange={(e) => setRecipients([e.target.value])}
            // multiple // TODO - enable multiple selection, it currently breaks styling
          >
            {subscriptions.map((sub) => (
              <option
                key={sub.subscribed_to_wallet}
                value={sub.subscribed_to_wallet}
              >
                {sub.subscribed_to_wallet}
              </option>
            ))}
          </Select>
          <FormHelperText color="other.600">
            Only selected users will be able to see this message.
          </FormHelperText>
        </FormControl>
        <Button
          variant="primary"
          size="sm"
          alignSelf="end"
          onClick={handlePost}
          isLoading={isLoading}
          isDisabled={!postContent || recipients.length === 0}
        >
          Message
        </Button>
      </HStack>
    </Flex>
  );
};
