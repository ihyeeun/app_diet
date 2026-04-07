import { ChevronUp, CircleAlert, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "@/features/chat/styles/ChatPage.module.css";
import { FloatingCameraButton } from "@/shared/commons/button/FloatingCameraButton";
import { PageHeader } from "@/shared/commons/header/PageHeader";

export default function ChatPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <PageHeader title="채팅" onBack={() => navigate(-1)} />

      <main className={styles.main}>
        <EmptySection />
        <div className={styles.content}></div>
      </main>

      <footer className={styles.footer}>
        <FloatingCameraButton onClick={() => {}} ariaLabel="메뉴판 사진 찍기" tone="light" />

        <ChatInput />
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
        <br /> 메뉴를 추천해드릴게요
      </p>
      <p className={`${styles.emptyText} typo-body4`}>
        <CircleAlert size={20} />
        오늘 먹은 메뉴를 기록하면 추천이 더 정확해져요
      </p>
    </div>
  );
}

function ChatInput() {
  const chipList = [
    "지금 먹기 좋은 메뉴 추천해줘",
    "지금 먹기 좋은 메뉴 추천해줘",
    "지금 먹기 좋은 메뉴 추천해줘",
  ];
  return (
    <div className={styles.chatInputContainer}>
      <section className={styles.chipSection}>
        {chipList.map((chip) => (
          <div className={styles.chipContainer}>
            <p key={chip} className="typo-body3">
              {chip}
            </p>
          </div>
        ))}
      </section>

      <section className={styles.textInputContainer}>
        <button className={styles.buttonContainer}>
          <Plus size={24} />
        </button>

        <input
          className={`${styles.textInput} typo-body3`}
          placeholder="맥도날드 왔는데 뭐 먹을까"
        />

        <button className={styles.buttonContainer}>
          <ChevronUp size={24} />
        </button>
      </section>
    </div>
  );
}
