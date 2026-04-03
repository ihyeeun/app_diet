import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";

export default function GoalEditPage() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="목표 재설정" onBack={() => navigate(-1)} />

      <main>
        <div></div>
      </main>

      <footer>
        <Button onClick={() => {}}>새로운 식단 계획 받기</Button>
      </footer>
    </div>
  );
}
