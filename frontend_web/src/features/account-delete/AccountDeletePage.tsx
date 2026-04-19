import styles from "./AccountDeletePage.module.css";

const SUPPORT_EMAIL = "keep9218@gmail.com";
const EMAIL_SUBJECT = "[Melo] 계정 데이터 삭제 요청";
const EMAIL_BODY = `아래 정보를 작성해 주세요.
- 가입한 소셜 로그인 종류(예: Kakao, Apple)
- 계정 식별 정보(이메일 또는 휴대전화)
- 계정, 데이터 삭제 요청 사유(선택)
`;

const supportMailTo = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(EMAIL_BODY)}`;

export default function AccountDeletePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>멜로(Melo) 데이터 삭제 안내</h1>
        <p className={styles.description}>
          앱에서 직접 탈퇴하거나, 앱 접속이 어려운 경우 고객센터 이메일을 통해 삭제를 요청할 수
          있습니다.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 앱에서 직접 계정 삭제</h2>
          <p className={styles.text}>
            앱 로그인 후 <strong>프로필 탭 &gt; 설정 &gt; 탈퇴하기</strong> 를 선택하면 계정 삭제
            절차가 시작됩니다.
            <br />
            삭제 요청 시 계정과 관련된 모든 데이터가 영구적으로 삭제됩니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 고객센터 이메일로 데이터 삭제 요청</h2>
          <p className={styles.text}>앱 접속이 어렵다면 아래 이메일로 요청해 주세요.</p>
          <a className={styles.mailLink} href={supportMailTo}>
            {SUPPORT_EMAIL}
          </a>
          <ul className={styles.list}>
            <li>요청 메일 제목: {EMAIL_SUBJECT}</li>
            <li>
              가입한 소셜 로그인 종류(예: Kakao, Apple)와 계정 식별 정보(이메일 또는 휴대전화)를
              포함해 주세요.
            </li>
            <li>본인 확인 후 삭제 절차가 진행됩니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>삭제 및 보관 정책</h2>
          <ul className={styles.list}>
            <li>계정 삭제가 완료되면 프로필, 식단 기록 등 서비스 이용 데이터가 삭제됩니다.</li>
          </ul>
        </section>

        <p className={styles.updatedAt}>최종 업데이트: 2026-04-19</p>
      </section>
    </main>
  );
}
