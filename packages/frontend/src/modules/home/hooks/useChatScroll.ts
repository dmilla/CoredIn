import { useRef, useEffect } from "react";
import { PostDTO } from "@coredin/shared/dist/@types";

export const useChatScroll = (conversation: PostDTO[]) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [conversation]);

  return ref;
};
