import { Sheet } from "react-modal-sheet";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  className,
  children,
}: BottomSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} detent="content" className={className}>
      <Sheet.Container
        style={{
          paddingBottom: "var(--safe-area-bottom)",
          background: "#fff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Sheet.Header />
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
