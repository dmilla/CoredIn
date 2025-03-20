import { useLocation } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { FC } from "react";
import { useLoggedInServerState } from "@/hooks";
import { ISSUER_QUERIES } from "@/queries/IssuerQueries";
import { CredentialRequestStatus } from "@coredin/shared";
import { FEED_QUERIES } from "@/queries/FeedQueries";
import { useState, useEffect } from "react";
import useSound from "use-sound";
import NotificationSound from "@/assets/sounds/coredin-notification-long-pop.mp3";
import { NavigationList } from "./NavigationList";
import { USER_QUERIES } from "@/queries";

type NavigationDesktopProps = {
  wallet: string;
};

export const NavigationDesktop: FC<NavigationDesktopProps> = ({ wallet }) => {
  const location = useLocation();
  const { data: pendingRequests } = useLoggedInServerState(
    ISSUER_QUERIES.getRequests(CredentialRequestStatus.PENDING)
  );
  const { data: messages } = useLoggedInServerState(
    FEED_QUERIES.getMessages(),
    { refetchInterval: 5000, refetchIntervalInBackground: true }
  );
  const { data: tips } = useLoggedInServerState(USER_QUERIES.getTips(), {
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const unreadMessages =
    messages?.filter((message) => message.unread).length || 0;

  const unseenTips =
    tips?.receivedTips.filter((tip) => !tip.isViewed).length || 0;

  const isPostPage = location.pathname.includes("posts");
  const [lastNotifiedMessageId, setLastNotifiedMessageId] = useState<number>(0);
  const [playNotification] = useSound(NotificationSound);

  useEffect(() => {
    const lastUnreadMessage = messages
      ?.filter((message) => message.unread)
      .at(-1);
    if (!lastUnreadMessage) return;
    if (lastUnreadMessage.id !== lastNotifiedMessageId) {
      playNotification();
      setLastNotifiedMessageId(lastUnreadMessage.id);
    }
  }, [JSON.stringify(messages)]);

  return (
    <Box
      as="nav"
      w="100%"
      layerStyle="cardBox"
      borderBottomRadius="1.125em"
      pl="2em"
      zIndex="1"
      py="1.5em"
      // border="1px solid red"
    >
      <NavigationList
        wallet={wallet}
        isPostPage={isPostPage}
        pendingRequests={pendingRequests}
        unreadMessages={unreadMessages}
        unseenTips={unseenTips}
      />
    </Box>
  );
};
