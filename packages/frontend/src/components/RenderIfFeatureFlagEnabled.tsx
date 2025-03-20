import { useFlag } from "@/hooks";
import { FEATURE_FLAG } from "@coredin/shared";
import { PropsWithChildren } from "react";

interface RenderIfFeatureFlagEnabledProps {
  featureFlag: FEATURE_FLAG;
  fallback: JSX.Element;
}

const RenderIfFeatureFlagEnabled = ({
  children,
  featureFlag,
  fallback
}: PropsWithChildren<RenderIfFeatureFlagEnabledProps>) => {
  const isEnabled = useFlag(featureFlag);

  return isEnabled ? children : fallback;
};

export default RenderIfFeatureFlagEnabled;
