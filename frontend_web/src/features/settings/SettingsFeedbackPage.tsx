import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRegisterInquiryMutation } from "@/features/settings/hooks/mutations/useInquiryMutation";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

import styles from "./styles/SettingsDetail.module.css";

const MAX_FEEDBACK_LENGTH = 1000;

export default function SettingsFeedbackPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const { mutate } = useRegisterInquiryMutation();

  const trimmedFeedback = feedback.trim();
  const canSubmit = trimmedFeedback.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.warning("내용을 입력해주세요");
      return;
    }

    mutate(trimmedFeedback, {
      onSuccess: () => {
        setFeedback("");
        toast.success("의견이 접수되었어요");
        navigate(-1);
      },
      onError: () => {
        toast.warning("문의 등록에 실패했어요");
      },
    });
  };

  return (
    <div className={styles.page}>
      <PageHeader onBack={() => navigate(-1)} title="문의하기" />

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.titleSection}>
            <h1 className={`${styles.title} typo-title1`}>
              서비스 이용 중 불편했던 점이나 <br />
              개선 아이디어를 알려주세요
            </h1>
          </section>

          <section className={styles.inputSection}>
            <div className={styles.textareaWrapper}>
              {feedback.length === 0 && (
                <p className={`${styles.textareaPlaceholder} typo-body3`} aria-hidden="true">
                  예) 검색이 잘 안 돼요
                  <br />
                  이런 기능이 있으면 좋겠어요
                </p>
              )}
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value.slice(0, MAX_FEEDBACK_LENGTH))}
                className={`${styles.textarea} typo-body3`}
                aria-label="문의 내용"
              />
            </div>
            <p className={`${styles.lengthText} typo-label4`}>최대 {MAX_FEEDBACK_LENGTH}자 이내</p>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          fullWidth
          size="large"
          state={canSubmit ? "default" : "disabled"}
        >
          보내기
        </Button>
      </footer>
    </div>
  );
}
