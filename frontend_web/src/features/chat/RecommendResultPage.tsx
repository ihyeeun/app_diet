import { PlusCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useGetChatHistoryQuery } from "@/features/chat/hooks/queries/useGetChatQuery";
import styles from "@/features/chat/styles/RecommendResultPage.module.css";
import { getRecommendDetailPath, getSafeChatId } from "@/features/chat/utils/recommendNavigation";
import { PATH } from "@/router/path";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";

export default function RecommendResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = getSafeChatId(searchParams.get("chatId"));
  const { data, isPending } = useGetChatHistoryQuery();

  const chatItem = useMemo(() => {
    if (chatId === null) return null;
    return data?.chat_list.find((item) => item.id === chatId) ?? null;
  }, [chatId, data?.chat_list]);

  useEffect(() => {
    if (chatId === null) {
      navigate(PATH.CHAT, { replace: true });
      return;
    }

    if (isPending) {
      return;
    }

    if (!chatItem || chatItem.response_payload.recommendations.length === 0) {
      navigate(PATH.CHAT, { replace: true });
    }
  }, [chatId, chatItem, isPending, navigate]);

  if (chatId === null) {
    return null;
  }

  if (isPending && !chatItem) {
    return (
      <section className={styles.page}>
        <PageHeader title="메뉴 추천 결과" onBack={() => navigate(PATH.CHAT)} />
        <main className={styles.main}>
          <p className={`${styles.loadingText} typo-body4`}>추천 결과를 불러오는 중이에요</p>
        </main>
      </section>
    );
  }

  if (!chatItem || chatItem.response_payload.recommendations.length === 0) {
    return null;
  }

  return (
    <section className={styles.page}>
      <PageHeader title="메뉴 추천 결과" onBack={() => navigate(PATH.CHAT)} />

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.intro}>
            <p className={`${styles.introMessage} typo-title2`}>
              <span className={styles.primaryText}>닉네임님</span>을 위한 메뉴를 추천해드려요!
            </p>

            <img src="/icons/Recommend.svg" />
          </div>

          <ul className={styles.resultList}>
            {chatItem.response_payload.recommendations.map((item) => (
              <li key={item.menu_id}>
                <button
                  type="button"
                  className={styles.resultCard}
                  onClick={() => navigate(getRecommendDetailPath(chatItem.id, item.menu_id))}
                >
                  <span className={`${styles.rankBadge} typo-label6`}>{item.rank}위</span>

                  <div className={styles.cardBody}>
                    <div className={styles.textGroup}>
                      <div className={styles.titleRow}>
                        <p className={`${styles.menuName} typo-title2`}>{item.menu}</p>
                        <PlusCircle size={24} className={styles.icon} />
                      </div>

                      <p className={`${styles.summary} typo-label4`}>{item.one_line_summary}</p>

                      <div className={styles.metaRow}>
                        {item.brand && (
                          <span className={`${styles.tertiaryText} typo-label4`}>{item.brand}</span>
                        )}
                        <span className={`${styles.secondaryText} typo-label4`}>
                          1{item.amount}
                        </span>
                        <span className={`${styles.calories} typo-title2`}>
                          {formatCalories(item.calories)} kcal
                        </span>
                      </div>
                    </div>

                    {/* TODO 개인용 컬럼 값 추가하기 */}
                    {/* <span className={`${styles.brand} typo-label4`}>개인용</span> */}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <Button
          variant="filled"
          size="medium"
          color="primary"
          onClick={() => {}}
          fullWidth
          state="disabled"
        >
          기록할 메뉴를 선택해주세요
        </Button>
      </footer>
    </section>
  );
}

function formatCalories(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });
}
