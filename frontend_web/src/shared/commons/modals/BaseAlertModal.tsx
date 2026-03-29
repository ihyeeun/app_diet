import "./BaseAlertModal.css";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import * as React from "react";

type BaseAlertModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
};

export function BaseAlertModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: BaseAlertModalProps) {
  const actionCount = React.Children.toArray(children).filter(Boolean).length;

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="modal-backdrop" />

        <AlertDialog.Popup className="modal-popup">
          <div className="modal-surface">
            <AlertDialog.Title className="modal-title">{title}</AlertDialog.Title>

            {description ? (
              <AlertDialog.Description className="modal-description">
                {description}
              </AlertDialog.Description>
            ) : null}
          </div>
          <div className="modal-actions" data-actions={actionCount}>
            {children}
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
