import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VisuallyHidden
} from "@chakra-ui/react";
import { ProfileSettings, SubscriptionSettings } from "../components";

const SettingsPage = () => {
  return (
    <Box w="100%">
      <VisuallyHidden>
        <Heading as="h1">Settings</Heading>
      </VisuallyHidden>
      <Tabs isFitted size="md" variant="unstyled">
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Subscription</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ProfileSettings />
          </TabPanel>
          <TabPanel>
            <SubscriptionSettings />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SettingsPage;
