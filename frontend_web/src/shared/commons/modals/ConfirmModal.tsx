import * as React from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { BaseAlertModal } from "./BaseAlertModal";
import { Button } from "@/shared/commons/button/Button";

type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: React.ReactNode;
  description?: React.ReactNode;

  cancelText?: string;
  confirmText?: string;

  confirmVariant?: "primary" | "danger";
  confirmDisabled?: boolean;

  /**
   * confirm 누르면 즉시 닫을지 여부
   * - true: confirm 클릭 시 닫힘(간단한 동작)
   * - false: 서버 요청 성공 시점에 직접 onOpenChange(false) 해줘야 함
   */
  closeOnConfirm?: boolean;

  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  cancelText = "취소",
  confirmText = "확인",
  confirmVariant = "primary",
  confirmDisabled = false,
  closeOnConfirm = true,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <BaseAlertModal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      {/* 취소는 무조건 닫기 */}
      <AlertDialog.Close
        render={(props) => (
          <Button {...props} variant="secondary">
            {cancelText}
          </Button>
        )}
      />

      {/* 확인 */}
      {closeOnConfirm ? (
        <AlertDialog.Close
          render={(props) => (
            <Button
              {...props}
              variant={confirmVariant}
              disabled={confirmDisabled}
              onClick={(e) => {
                props.onClick?.(e); // 닫기 동작 유지
                void onConfirm(); // 로직 실행
              }}
            >
              {confirmText}
            </Button>
          )}
        />
      ) : (
        // ✅ 서버 성공 후 닫기 패턴: 여기서는 닫지 않음
        <Button
          variant={confirmVariant}
          disabled={confirmDisabled}
          onClick={async () => {
            try {
              await onConfirm();
              onOpenChange(false);
            } catch (error) {
              // 에러는 onConfirm 내부에서 처리하거나 여기서 처리
              console.error(error);
            }
          }}
        >
          {confirmText}
        </Button>
      )}
    </BaseAlertModal>
  );
}
