import { Toast } from "@base-ui/react/toast";
import "./AppToast.css";

export function AppToastViewport() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal>
      <Toast.Viewport className="app-toast-viewport">
        {toasts.map((item) => (
          <Toast.Root
            key={item.id}
            toast={item}
            className="app-toast"
            swipeDirection={["right", "down"]}
          >
            <Toast.Content className="app-toast-content">
              {item.title ? <Toast.Title className="app-toast-title" /> : null}
              {item.description ? (
                <Toast.Description className="app-toast-description" />
              ) : null}
            </Toast.Content>
            {item.actionProps ? <Toast.Action className="app-toast-action" /> : null}
            <Toast.Close className="app-toast-close" aria-label="알림 닫기">
              ×
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
