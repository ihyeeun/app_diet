import { Sheet } from "react-modal-sheet";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} detent="content">
      <Sheet.Container>
        {/* <Sheet.Header /> */}
        <Sheet.Content>
          <div>
            {title ? <div>{title}</div> : null}

            {children}
          </div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop onTap={onClose} />
    </Sheet>
  );
}
