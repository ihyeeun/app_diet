export interface UseMutationCallback {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void; //요청이 발송 되었을 때
  onSettled?: () => void; //요청이 종료 되었을 때
}
