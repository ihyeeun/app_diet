import { useEffect } from "react";

import { useChatMealDraftStore } from "@/features/chat/stores/chatMealDraft.store";
import { PATH } from "@/router/path";

const CHAT_FLOW_PATH_SET = new Set([PATH.CHAT, PATH.RECOMMEND_RESULT, PATH.RECOMMEND_DETAIL]);

export function useClearChatDraftOnFlowExit() {
  const clearAllDrafts = useChatMealDraftStore((state) => state.clearAllDrafts);

  useEffect(() => {
    return () => {
      const nextPath = window.location.pathname;
      if (CHAT_FLOW_PATH_SET.has(nextPath)) {
        return;
      }

      clearAllDrafts();
    };
  }, [clearAllDrafts]);
}
