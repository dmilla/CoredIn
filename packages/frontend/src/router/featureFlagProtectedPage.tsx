import RenderIfFeatureFlagEnabled from "@/components/RenderIfFeatureFlagEnabled";
import ResourceNotFoundPage from "@/modules/error/views/resourceNotFoundPage";
import { FEATURE_FLAG } from "@coredin/shared";
import { PropsWithChildren } from "react";

interface FeatureFlagProtectedPageProps {
  featureFlag: FEATURE_FLAG;
}

const FeatureFlagProtectedPage = ({
  children,
  featureFlag
}: PropsWithChildren<FeatureFlagProtectedPageProps>) => {
  return (
    <RenderIfFeatureFlagEnabled
      featureFlag={featureFlag}
      fallback={<ResourceNotFoundPage />}
    >
      {children}
    </RenderIfFeatureFlagEnabled>
  );
};

export default FeatureFlagProtectedPage;
