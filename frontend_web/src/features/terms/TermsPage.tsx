import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import styles from "./TermsPage.module.css";

export default function TermsPage() {
  return (
    <section className={styles.container}>
      <p className="typo-title3">약관</p>

      <div className={styles.AccordionContainer}>
        <Accordion.Root className={styles.Accordion}>
          <Accordion.Item className={styles.Item}>
            <Accordion.Header className={styles.Header}>
              <Accordion.Trigger className={styles.Trigger}>
                서비스 이용약관
                <ChevronDown size={24} className={styles.TriggerIcon} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className={styles.Panel}>
              <div className={styles.Content}>추후 추가 예정.</div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>

        <Accordion.Root className={styles.Accordion}>
          <Accordion.Item className={styles.Item}>
            <Accordion.Header className={styles.Header}>
              <Accordion.Trigger className={styles.Trigger}>
                개인정보처리방침
                <ChevronDown size={24} className={styles.TriggerIcon} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className={styles.Panel}>
              <div className={styles.Content}>추후 추가 예정.</div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </section>
  );
}
