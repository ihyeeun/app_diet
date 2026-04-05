import { Pencil, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionCard from "@/features/home/components/cards/ActionCard";
import { useGetBodyLog } from "@/features/home/hooks/queries/useBodyLogQuery";
import { useDayMealsQuery } from "@/features/home/hooks/queries/useDayMealsQuery";
import { useNickNameUpdateMutation } from "@/features/profile/hooks/mutations/useProfileMutation";
import { useGetProfileQuery } from "@/features/profile/hooks/queries/useProfileQuery";
import styles from "@/features/profile/styles/ProfilePage.module.css";
import { PATH } from "@/router/path";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";
import { getTodayFormatDateKey } from "@/shared/utils/dateFormat";

export default function ProfilePage() {
  const navigate = useNavigate();
  const today = getTodayFormatDateKey();
  const { data: profile, isPending: isProfilePending } = useGetProfileQuery();
  const { data: dayMeal, isPending: isDayMealPending } = useDayMealsQuery(today);
  const { data: bodyLog, isPending: isBodyLogPending } = useGetBodyLog(today);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [nickName, setNickName] = useState(profile?.nickname);
  const { mutate: updateNickName } = useNickNameUpdateMutation();

  const nickname = profile?.nickname ?? "진득한 푸마";
  const weight = profile?.weight ?? 50;
  const remainingWeight = Math.abs(weight - (profile?.target_weight ?? weight));

  const handleUpdateNickName = () => {
    if (nickName?.trim() === "" || nickName === undefined) {
      toast.warning("닉네임을 입력해주세요");
      return;
    }

    updateNickName(nickName, {
      onSuccess: () => {
        setSheetOpen(false);
        toast.success("닉네임이 수정되었어요");
      },
      onError: () => {
        toast.warning("닉네임 수정에 실패했어요");
      },
    });
  };

  if (isProfilePending || isDayMealPending || isBodyLogPending) {
    return <div>로딩 중..</div>;
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="식단기록"
        rightSlot={
          <button
            type="button"
            className={styles.headerIconButton}
            onClick={() => navigate(PATH.SETTINGS)}
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

                <button
                  type="button"
                  className={styles.inlineIconButton}
                  aria-label="닉네임 수정"
                  onClick={() => {
                    setSheetOpen(true);
                  }}
                >
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
              <Button
                onClick={() => navigate(PATH.GOAL_EDIT)}
                variant="text"
                size="small"
                color="assistive"
              >
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
                    {dayMeal?.totalCalories.toLocaleString("ko-KR")}
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
                    {(bodyLog?.steps ?? 0).toLocaleString("ko-KR")}
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

          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => {
              setSheetOpen(false);
              setNickName(nickname);
            }}
          >
            <div className={styles.sheetContainer}>
              <section className={styles.sheetContent}>
                <p className="typo-title2">닉네임 수정하기</p>
                <input
                  placeholder="닉네임 입력"
                  value={nickName ?? nickname}
                  onChange={(e) => setNickName(e.target.value.slice(0, 15))}
                  className={`${styles.input} typo-body3`}
                />
              </section>

              <Button
                variant="filled"
                state="default"
                size="large"
                color="primary"
                fullWidth
                onClick={handleUpdateNickName}
              >
                수정하기
              </Button>
            </div>
          </BottomSheet>
        </div>
      </main>
    </div>
  );
}
