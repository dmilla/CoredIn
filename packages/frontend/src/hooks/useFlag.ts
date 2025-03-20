import { BaseServerStateKeys } from "@/constants";
import { chainInfo, featureFlagService } from "@/dependencies";
import { FEATURE_FLAG } from "@coredin/shared";
import { useServerState } from "./useServerState";
import { useChain } from "@cosmos-kit/react";

const FEATURE_FLAG_QUERIES = {
  getFlag: (flag: FEATURE_FLAG, user?: string) => ({
    queryKey: [
      BaseServerStateKeys.FEATURE_FLAGS,
      flag,
      user || "anonymous_user"
    ],
    queryFn: () => featureFlagService.getFlag(flag, user)
  })
};

export const useFlag = (featureFlag: FEATURE_FLAG): boolean => {
  const chainContext = useChain(chainInfo.chainName);

  const { data: isEnabled } = useServerState(
    FEATURE_FLAG_QUERIES.getFlag(featureFlag, chainContext.address)
  );

  return isEnabled || false;
};
