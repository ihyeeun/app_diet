import style from "@/features/home/styles/TodayScoreSection.module.css";
import { PATH } from "@/router/path";
import ScoreProgress from "@/shared/commons/progress/Progress";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export default function TodayScoreSection() {
  const [score, setScore] = useState(82);
  const [current, setCurrent] = useState(1320);
  const [total, setTotal] = useState(2100);

  const navigation = useNavigate();

  return (
    <button
      className={style.content}
      type="button"
      onClick={() => {
        navigation(PATH.MEAL_DETAIL);
      }}
    >
      <div className={style.score_container}>
        <div className={style.score_title_container}>
          <div className={style.score_title_text_container}>
            <p className="typo-title2">오늘의 식사는</p>

            <p className={style.score_text}>
              <span className={`${style.score} typo-h2`}>{score}</span>
              <span className={`${style.unit} typo-title2`}>점</span>

              <span className={`${style.calorie_text} typo-title4`}>
                (<span>{current.toLocaleString()}</span> / <span>{total.toLocaleString()}</span>{" "}
                kcal)
              </span>
            </p>
          </div>

          <img src="/icons/heart_smile.svg" className={style.img_container} aria-hidden="true" />
        </div>

        <ScoreProgress value={score} variant="primary-white" />
      </div>
      <div className={style.badge_container}>
        <Badge>아직 {total - current}kcal 더 먹을 수 있어요</Badge>
        <Badge>👣 걸음으로 +300kcal</Badge>
        <Badge>탄단지 균형은 적절해요</Badge>
      </div>
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div className={style.badge_content_container}>
      <p className="typo-body4">{children}</p>
    </div>
  );
}
