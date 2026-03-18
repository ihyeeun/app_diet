import ActionCard from "@/features/home/components/cards/ActionCard";
import style from "@/features/home/styles/MenuActionSection.module.css";
import { PATH } from "@/router/path";
import { syncAppTab } from "@/shared/api/bridge/nativeBridge";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMealRecordPath(mealType: "breakfast" | "lunch" | "dinner" | "snack") {
  const params = new URLSearchParams({
    date: getTodayDateKey(),
    mealType,
  });
  return `${PATH.MEAL_RECORD}?${params.toString()}`;
}

export default function MenuActionSection() {
  const navigate = useNavigate();

  return (
    <div className={style.content}>
      <div className={style.menu_container}>
        <MenuCard
          title={"메뉴 추천"}
          description="메뉴를 상황에 맞게 추천해줘요"
          iconSrc="/icons/menu_recommend.svg"
          onClick={() => {
            syncAppTab("recommend");
            navigate(PATH.RECOMMEND);
          }}
        />
        <MenuCard
          title={"메뉴 비교"}
          description="나에게 더 맞는 메뉴를 고르는데 도와줘요"
          iconSrc="/icons/menu_compare.svg"
          onClick={() => {
            syncAppTab("compare");
            navigate(PATH.COMPARE);
          }}
        />
      </div>
      <ActionCard>
        <div className={style.record_container}>
          <div className={style.record_title_container}>
            <p className="typo-title4">식단 기록</p>
            <p className={`${style.description} typo-body4`}>오늘 드신 식단을 기록해주세요</p>
          </div>
          <div className={style.meal_card_list}>
            <MealTimeCard
              label="아침"
              iconSrc="/icons/breakfast.svg"
              value=""
              onClick={() => navigate(getMealRecordPath("breakfast"))}
            />
            <MealTimeCard
              label="점심"
              iconSrc="/icons/lunch.svg"
              value="123"
              onClick={() => navigate(getMealRecordPath("lunch"))}
              selected
            />
            <MealTimeCard
              label="저녁"
              iconSrc="/icons/dinner.svg"
              value=""
              onClick={() => navigate(getMealRecordPath("dinner"))}
            />
            <MealTimeCard
              label="간식"
              iconSrc="/icons/snack.svg"
              value=""
              onClick={() => navigate(getMealRecordPath("snack"))}
            />
          </div>
        </div>
      </ActionCard>
      <div className={style.today_container}>
        <TodayCard onClick={() => {}} title="오늘의 체중" value={42.2} unit="kg" />
        <TodayCard onClick={() => {}} title="오늘의 걸음 수" value={30000} unit="걸음" />
      </div>
    </div>
  );
}

function MenuCard({
  title,
  description,
  iconSrc,
  onClick,
}: {
  title: string;
  description: string;
  iconSrc: string;
  onClick: () => void;
}) {
  return (
    <ActionCard onClick={onClick}>
      <div className={style.menu_card_container}>
        <p className="typo-title4">{title}</p>
        <p className={`${style.description} typo-body4`}>{description}</p>
        <div className={style.icon_container}>
          <img src={iconSrc} alt={`${title} 아이콘`} />
        </div>
      </div>
    </ActionCard>
  );
}

function MealTimeCard({
  label,
  iconSrc,
  value,
  selected = false,
  onClick,
}: {
  label: string;
  iconSrc: string;
  value: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${style.meal_card} ${selected ? style.meal_selected : ""}`}
      onClick={onClick}
    >
      <div className={style.meal_inner}>
        {value ? (
          <span className={`${style.meal_value} typo-title3`}>{value}</span>
        ) : (
          iconSrc && <img src={iconSrc} alt={label} className={style.meal_icon} />
        )}
      </div>
      <p className={`${style.meal_label} typo-label3`}>{label}</p>
    </button>
  );
}

function TodayCard({
  title,
  value,
  unit,
  onClick,
}: {
  title: string;
  value: number | string;
  unit: string;
  onClick: () => void;
}) {
  return (
    <ActionCard onClick={onClick}>
      <div className={style.today_card_container}>
        <div className={style.today_title_container}>
          <p className="typo-title4">{title}</p>
          <PlusIcon size={20} />
        </div>
        <p style={{ textAlign: "right" }} className="typo-label1">
          <span className={`typo-h3 ${style.highlightValue}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>{" "}
          {unit}
        </p>
      </div>
    </ActionCard>
  );
}
