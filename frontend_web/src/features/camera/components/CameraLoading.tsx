import styles from "@/features/camera/CameraPage.module.css";

export function CameraLoading({ description }: { description: string }) {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <img src="/icons/Search.svg" alt="카메라 아이콘" className={styles.image} />
        <p className="typo-title1">
          {description}
          <br />
          조금만 기다려주세요
        </p>
      </div>
    </main>
  );
}
