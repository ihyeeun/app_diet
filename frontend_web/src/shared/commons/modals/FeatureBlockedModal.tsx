import { CheckButtonModal } from "@/shared/commons/modals/CheckButtonModal";
import {
  type FeatureGuardTarget,
  getFeatureGuardCopy,
} from "@/shared/guards/featureGuard";

type FeatureBlockedModalProps = {
  open: boolean;
  feature: FeatureGuardTarget | null;
  onOpenChange: (open: boolean) => void;
};

export function FeatureBlockedModal({ open, feature, onOpenChange }: FeatureBlockedModalProps) {
  const copy = feature ? getFeatureGuardCopy(feature) : null;

  return (
    <CheckButtonModal
      open={open}
      onOpenChange={onOpenChange}
      title={copy?.title ?? ""}
      description={copy?.description}
      confirmText="확인"
    />
  );
}
