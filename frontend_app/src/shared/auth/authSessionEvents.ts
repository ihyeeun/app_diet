type AuthExpiredListener = () => void;

const authExpiredListeners = new Set<AuthExpiredListener>();

export function subscribeAuthExpired(listener: AuthExpiredListener) {
  authExpiredListeners.add(listener);

  return () => {
    authExpiredListeners.delete(listener);
  };
}

export function emitAuthExpired() {
  authExpiredListeners.forEach((listener) => {
    listener();
  });
}
