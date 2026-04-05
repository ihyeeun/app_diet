import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/shared/commons/header/PageHeader";

import styles from "./TermsPage.module.css";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <PageHeader title="약관" onBack={() => navigate(-1)} />

      <section className={styles.container}>
        <div className={styles.accordionContainer}>
          <Accordion.Root className={styles.accordion}>
            <Accordion.Item className={styles.item}>
              <Accordion.Header className={styles.header}>
                <Accordion.Trigger className={styles.trigger}>
                  서비스 이용약관
                  <ChevronDown size={24} className={styles.triggerIcon} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className={styles.panel}>
                <div className={styles.content}>추후 추가 예정.</div>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>

          <Accordion.Root className={styles.accordion}>
            <Accordion.Item className={styles.item}>
              <Accordion.Header className={styles.header}>
                <Accordion.Trigger className={styles.trigger}>
                  개인정보처리방침
                  <ChevronDown size={24} className={styles.triggerIcon} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className={styles.panel}>
                <div className={styles.content}>추후 추가 예정.</div>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </section>
    </div>
  );
}
