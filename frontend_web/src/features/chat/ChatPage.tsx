import { Check, ChevronDown, ChevronRight, ChevronUp, CircleAlert, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSendMessageMutation } from "@/features/chat/hooks/mutations/useSendMessageMutation";
import { useGetChatHistoryQuery } from "@/features/chat/hooks/queries/useGetChatQuery";
import styles from "@/features/chat/styles/ChatPage.module.css";
import { PATH } from "@/router/path";
import { AppApiError } from "@/shared/api/appApi";
import type { ChatRecommendItemResponseDto } from "@/shared/api/types/api.dto";
import { FloatingCameraButton } from "@/shared/commons/button/FloatingCameraButton";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

const QUICK_CHIP_LIST = ["지금 먹기 좋은 메뉴를 추천해줘", "고지방 식단 추천해줘"];

export default function ChatPage() {
  const navigate = useNavigate();
  const endAnchorRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [isAwaitingHistory, setIsAwaitingHistory] = useState(false);
  const [selectedMenuIdsByChatId, setSelectedMenuIdsByChatId] = useState<Record<number, number[]>>(
    {},
  );
  const [expandedCompleteCardByChatId, setExpandedCompleteCardByChatId] = useState<
    Record<number, boolean>
  >({});

  const { data, isPending: isHistoryPending, refetch } = useGetChatHistoryQuery();
  const { mutateAsync: sendMessageMutation, isPending: isSendPending } = useSendMessageMutation();

  const chatList = useMemo(() => {
    const rawList = data?.chat_list ?? [];
    return [...rawList].sort((a, b) => {
      const aTime = parseDateValue(a.createdAt);
      const bTime = parseDateValue(b.createdAt);

      if (aTime !== null && bTime !== null && aTime !== bTime) {
        return aTime - bTime;
      }

      if (aTime === null && bTime !== null) return -1;
      if (aTime !== null && bTime === null) return 1;
      return a.id - b.id;
    });
  }, [data]);

  const hasAnyConversation = chatList.length > 0 || pendingInput !== null;
  const isTypingPending = pendingInput !== null && (isSendPending || isAwaitingHistory);

  useEffect(() => {
    endAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chatList, isTypingPending, pendingInput]);

  const sendChatMessage = async (rawInput: string) => {
    const text = rawInput.trim();
    if (!text || isSendPending) return;

    setPendingInput(text);
    setInputValue("");
    setIsAwaitingHistory(true);

    try {
      await sendMessageMutation({ input: text });
      await refetch();
    } catch (error) {
      toast.warning(resolveErrorMessage(error));
      setInputValue(text);
    } finally {
      setPendingInput(null);
      setIsAwaitingHistory(false);
    }
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    await sendChatMessage(inputValue);
  };

  const handleSelectMenu = (chatId: number, menuId: number) => {
    setSelectedMenuIdsByChatId((prev) => {
      const selectedMenuIds = prev[chatId] ?? [];
      const isSelected = selectedMenuIds.includes(menuId);
      const nextSelected = isSelected
        ? selectedMenuIds.filter((value) => value !== menuId)
        : [...selectedMenuIds, menuId];

      return {
        ...prev,
        [chatId]: nextSelected,
      };
    });
  };

  const handleToggleCompleteExpanded = (chatId: number) => {
    setExpandedCompleteCardByChatId((prev) => ({
      ...prev,
      [chatId]: !prev[chatId],
    }));
  };

  return (
    <div className={styles.page}>
      <PageHeader title="채팅" onBack={() => navigate(PATH.HOME)} />

      <main className={styles.main}>
        {!hasAnyConversation && !isHistoryPending ? <EmptySection /> : null}
        {isHistoryPending && chatList.length === 0 && pendingInput === null ? (
          <p className={`${styles.loadingText} typo-body4`}>채팅을 불러오는 중이에요</p>
        ) : null}

        {hasAnyConversation ? (
          <div className={styles.chatTimeline}>
            {chatList.map((chatItem, index) => {
              const chatDate = parseDate(chatItem.createdAt);
              const previousItem = chatList[index - 1];
              const previousDate = previousItem ? parseDate(previousItem.createdAt) : null;
              const shouldShowDateDivider =
                chatDate !== null &&
                (previousDate === null || toDateKey(chatDate) !== toDateKey(previousDate));
              const selectedMenuIds = selectedMenuIdsByChatId[chatItem.id] ?? [];
              const selectedRecommendations = chatItem.response_payload.recommendations.filter(
                (item) => selectedMenuIds.includes(item.menu_id),
              );
              const isCompleteCardExpanded = expandedCompleteCardByChatId[chatItem.id] ?? false;

              return (
                <section key={chatItem.id} className={styles.conversationSection}>
                  {shouldShowDateDivider ? (
                    <div className={styles.dateDivider}>
                      <span className={`${styles.dateText} typo-caption`}>
                        {formatDateDividerText(chatDate)}
                      </span>
                    </div>
                  ) : null}

                  <div className={styles.userMessageGroup}>
                    <p className={`${styles.timeText} typo-caption`}>
                      {formatChatTime(chatItem.createdAt)}
                    </p>
                    <p className={`${styles.userBubble} typo-body3`}>{chatItem.input_text}</p>
                  </div>

                  <div className={styles.assistantMessageGroup}>
                    <p className={`${styles.assistantBubble} typo-body3`}>
                      {chatItem.response_payload.intro_message}
                    </p>

                    {chatItem.response_payload.recommendations.length > 0 ? (
                      <RecommendationSection
                        recommendations={chatItem.response_payload.recommendations}
                        selectedMenuIds={selectedMenuIds}
                        onSelectMenu={(menuId) => handleSelectMenu(chatItem.id, menuId)}
                      />
                    ) : null}

                    {selectedRecommendations.length > 0 ? (
                      <RecordCompleteCard
                        recommendations={selectedRecommendations}
                        expanded={isCompleteCardExpanded}
                        onToggleExpanded={() => handleToggleCompleteExpanded(chatItem.id)}
                      />
                    ) : null}
                  </div>
                </section>
              );
            })}

            {pendingInput !== null ? (
              <section className={styles.conversationSection} aria-live="polite">
                <div className={styles.userMessageGroup}>
                  <p className={`${styles.timeText} typo-caption`}>{formatChatTime(new Date())}</p>
                  <p className={`${styles.userBubble} typo-body3`}>{pendingInput}</p>
                </div>

                {isTypingPending ? (
                  <div className={styles.assistantMessageGroup}>
                    <div className={styles.typingBubble} aria-label="답변 생성 중">
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            <div ref={endAnchorRef} />
          </div>
        ) : null}
      </main>

      <footer className={styles.footer}>
        <FloatingCameraButton
          onClick={() => navigate(PATH.MENU_BOARD_CAMERA)}
          ariaLabel="메뉴판 사진 찍기"
          tone="primary"
          bottomOffset={135}
        />

        <ChatInput
          value={inputValue}
          isSendPending={isSendPending}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onSelectChip={(chip) => {
            void sendChatMessage(chip);
          }}
        />
      </footer>
    </div>
  );
}

function EmptySection() {
  return (
    <div className={styles.emptySection}>
      <img src="/icons/ChatFace.svg" />
      <p className={`typo-title1 ${styles.emptyTitle}`}>
        상황에 맞는
        <br />
        메뉴를 추천해드릴게요
      </p>
      <p className={`${styles.emptyText} typo-body4`}>
        <CircleAlert size={20} />
        오늘 먹은 메뉴를 기록하면 추천이 더 정확해져요
      </p>
    </div>
  );
}

function ChatInput({
  value,
  isSendPending,
  onChange,
  onSubmit,
  onSelectChip,
}: {
  value: string;
  isSendPending: boolean;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onSelectChip: (chip: string) => void;
}) {
  const isSendDisabled = value.trim().length === 0 || isSendPending;

  return (
    <div className={styles.chatInputContainer}>
      <section className={styles.chipSection}>
        {QUICK_CHIP_LIST.map((chip) => (
          <button
            key={chip}
            type="button"
            className={styles.chipContainer}
            onClick={() => onSelectChip(chip)}
            disabled={isSendPending}
          >
            <p className="typo-body3">{chip}</p>
          </button>
        ))}
      </section>

      <form className={styles.textInputContainer} onSubmit={onSubmit}>
        <button
          type="button"
          className={styles.plusIconContainer}
          onClick={() => {}}
          aria-label="첨부 기능 준비 중"
        >
          <Plus size={24} />
        </button>

        <div className={styles.textInputWrapper}>
          <input
            value={value}
            className={`${styles.textInput} typo-body3`}
            placeholder="맥도날드에 왔는데 뭐 먹을까?"
            onChange={(event) => onChange(event.target.value.slice(0, 500))}
            maxLength={500}
            disabled={isSendPending}
          />

          <button
            type="submit"
            className={`${styles.sendIconContainer} ${isSendDisabled ? styles.sendIconContainerDisabled : ""}`}
            disabled={isSendDisabled}
            aria-label="메시지 전송"
          >
            <ChevronUp size={24} />
          </button>
        </div>
      </form>
    </div>
  );
}

function RecommendationSection({
  recommendations,
  selectedMenuIds,
  onSelectMenu,
}: {
  recommendations: ChatRecommendItemResponseDto[];
  selectedMenuIds: number[];
  onSelectMenu: (menuId: number) => void;
}) {
  const topRecommendation = recommendations[0];
  const remaining = recommendations.slice(1);

  if (!topRecommendation) return null;

  const topIsSelected = selectedMenuIds.includes(topRecommendation.menu_id);
  const topBadgeText = topRecommendation.rank ? `${topRecommendation.rank}위` : "추천";
  const topBrandText = topRecommendation.brand?.trim() || "개인용";

  return (
    <div className={styles.recommendationSection}>
      <button
        type="button"
        className={`${styles.recommendCard} ${topIsSelected ? styles.recommendCardSelected : ""}`}
        onClick={() => onSelectMenu(topRecommendation.menu_id)}
        aria-pressed={topIsSelected}
      >
        <span className={`${styles.rankBadge} typo-label6`}>{topBadgeText}</span>

        <div className={styles.recommendContents}>
          <p className={`${styles.recommendMenuName} typo-title2`}>{topRecommendation.menu}</p>
          {/* {topIsSelected ? <CircleCheck size={28} /> : <CirclePlus size={28} />} */}

          <p className={`${styles.recommendSummary} typo-label4`}>
            {topRecommendation.one_line_summary}
          </p>

          <div className={styles.recommendMetaRow}>
            {topRecommendation.brand && (
              <span className={`${styles.recommendBrand} typo-label4`}>
                {topRecommendation.brand}
              </span>
            )}
            <span className={`${styles.recommendAmount} typo-label4`}>
              1{topRecommendation.amount}
            </span>
            <span className={`${styles.recommendCalories} typo-title2`}>
              {formatCalories(topRecommendation.calories)} kcal
            </span>
          </div>

          <span className={`${styles.recommendTag} typo-caption`}>{topBrandText}</span>
        </div>

        <div className="divider" />

        {!topIsSelected ? (
          <div className={styles.addAction}>
            <span className={`${styles.addActionText} typo-label3`}>오늘의 식사에 추가</span>
            <span>
              <Plus size={20} />
            </span>
          </div>
        ) : (
          <div className={styles.addActionSelected}>
            <span className="typo-label3">오늘의 식사에 추가 완료</span>
            <span>
              <Check size={20} />
            </span>
          </div>
        )}
      </button>

      {remaining.length > 0 ? (
        <button type="button" className={styles.moreRecommendCard} aria-label="추천 목록 더보기">
          <p className={`${styles.moreRecommendTitle} typo-body3`}>
            상위 추천 메뉴 2~{recommendations.length}위(총 {recommendations.length}개)
          </p>
          <span className={`${styles.moreRecommendAction} typo-label3`}>
            더보기
            <ChevronRight size={20} />
          </span>
        </button>
      ) : null}
    </div>
  );
}

function RecordCompleteCard({
  recommendations,
  expanded,
  onToggleExpanded,
}: {
  recommendations: ChatRecommendItemResponseDto[];
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const totalCalories = recommendations.reduce((sum, item) => sum + item.calories, 0);
  const summaryText = getRecordSummaryText(recommendations);

  return (
    <article className={styles.recordCompleteCard}>
      <p className={`${styles.recordCompleteTitle} typo-title2`}>🎉 기록 완료!</p>

      <button
        type="button"
        className={styles.recordCompleteSummaryButton}
        onClick={onToggleExpanded}
        aria-expanded={expanded}
      >
        <span className={`${styles.recordCompleteSummaryText} typo-title3`}>{summaryText}</span>

        <span className={styles.recordCompleteCaloriesWrapper}>
          <span className={`${styles.recordCompleteCalories} typo-title2`}>
            {formatCalories(totalCalories)} kcal
          </span>
          <ChevronDown
            size={20}
            className={`${styles.recordCompleteChevron} ${expanded ? styles.recordCompleteChevronExpanded : ""}`}
          />
        </span>
      </button>

      {expanded ? (
        <ul className={styles.recordCompleteDetailList}>
          {recommendations.map((item) => (
            <li key={item.menu_id} className={styles.recordCompleteDetailItem}>
              <span className="typo-body3">{item.menu}</span>
              <span className={`${styles.recordCompleteDetailCalories} typo-body3`}>
                {formatCalories(item.calories)} kcal
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.recordCompleteActionRow}>
        <button
          type="button"
          className={`${styles.recordActionButton} ${styles.recordActionButtonNeutral}`}
        >
          기록 취소
        </button>
        <button
          type="button"
          className={`${styles.recordActionButton} ${styles.recordActionButtonPrimary}`}
        >
          수정하기
        </button>
      </div>
    </article>
  );
}

function getRecordSummaryText(recommendations: ChatRecommendItemResponseDto[]) {
  if (recommendations.length === 0) return "선택한 메뉴 없음";
  if (recommendations.length === 1) return recommendations[0].menu;
  return `${recommendations[0].menu} 외 ${recommendations.length - 1}개`;
}

function parseDateValue(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function parseDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDividerText(date: Date) {
  const weekday = date.toLocaleDateString("ko-KR", {
    weekday: "long",
  });

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekday}`;
}

function formatChatTime(dateLike: Date | string) {
  const date = typeof dateLike === "string" ? parseDate(dateLike) : dateLike;
  if (!date) return "시간 미상";
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCalories(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });
}

function resolveErrorMessage(error: unknown) {
  if (error instanceof AppApiError && error.message.trim().length > 0) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "메시지 전송에 실패했어요. 잠시 후 다시 시도해주세요.";
}
