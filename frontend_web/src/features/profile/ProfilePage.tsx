import { Pencil, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionCard from "@/features/home/components/cards/ActionCard";
import { useGetProfileQuery } from "@/features/profile/hooks/queries/useProfileQuery";
import styles from "@/features/profile/styles/ProfilePage.module.css";
import { PATH } from "@/router/path";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";

const DEFAULT_STEPS = 36000;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile } = useGetProfileQuery();

  const nickname = profile?.nickname ?? "진득한 푸마";
  const weight = profile?.weight ?? 50;
  const targetCalories = profile?.target_calories ?? 1200;
  const remainingWeight = Math.abs(weight - (profile?.target_weight ?? weight));

  return (
    <div className={styles.page}>
      <PageHeader
        title="식단기록"
        onBack={() => navigate(-1)}
        rightSlot={
          <button
            type="button"
            className={styles.headerIconButton}
            onClick={() => navigate(PATH.TERMS)}
            aria-label="설정"
          >
            <Settings size={24} />
          </button>
        }
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.summarySection}>
            <div className={styles.summaryText}>
              <div className={styles.nicknameRow}>
                <p className={`${styles.nickname} typo-title2`}>
                  <span className={styles.highlight}>{nickname}</span> 님
                </p>

                <button type="button" className={styles.inlineIconButton} aria-label="닉네임 수정">
                  <Pencil size={20} />
                </button>
              </div>

              <p className={`${styles.goalText} typo-body1`}>
                목표 체중까지{" "}
                <span className={styles.highlight}>
                  {remainingWeight.toLocaleString("ko-KR")}kg
                </span>{" "}
                남았어요
              </p>
            </div>

            <div className={styles.textButton}>
              <Button onClick={() => {}} variant="text" size="small" color="assistive">
                목표 재설정
              </Button>
            </div>
          </section>

          <section className={styles.bodyLogSection}>
            <div className={styles.activeCardGrid}>
              <ActionCard onClick={() => {}} className={styles.activeCard}>
                <p className={`${styles.activeCardTitle} typo-title4`}>체중</p>

                <div className={styles.activeCardValueRow}>
                  <span className={`${styles.activeCardValue} typo-h3`}>
                    {weight.toLocaleString("ko-KR")}
                  </span>
                  <span className={`${styles.activeCardUnit} typo-label1`}>kg</span>
                </div>
              </ActionCard>

              <ActionCard onClick={() => {}} className={styles.activeCard}>
                <p className={`${styles.activeCardTitle} typo-title4`}>섭취량</p>

                <div className={styles.activeCardValueRow}>
                  <span className={`${styles.activeCardValue} typo-h3`}>
                    {targetCalories.toLocaleString("ko-KR")}
                  </span>
                  <span className={`${styles.activeCardUnit} typo-label1`}>kcal</span>
                </div>
              </ActionCard>
            </div>
            <ActionCard onClick={() => {}}>
              <div className={styles.activeCardRow}>
                <span className={`${styles.activeCardTitle} typo-title4`}>걸음 수</span>

                <div className={styles.activeCardValueRow}>
                  <span className={`${styles.activeCardValue} typo-h3`}>
                    {DEFAULT_STEPS.toLocaleString("ko-KR")}
                  </span>
                  <span className={`${styles.activeCardUnit} typo-label1`}>걸음</span>
                </div>
              </div>
            </ActionCard>
          </section>

          <div className="divider" />

          <section>
            <p>주간 기록 현황</p>
          </section>
        </div>
      </main>
    </div>
  );
}
