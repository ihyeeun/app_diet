import ActionCard from "@/features/home/components/cards/ActionCard";
import style from "@/features/home/styles/MenuActionSection.module.css";
import { PATH } from "@/router/path";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
            navigate(PATH.RECOMMEND);
          }}
        />
        <MenuCard
          title={"메뉴 비교"}
          description="나에게 더 맞는 메뉴를 고르는데 도와줘요"
          iconSrc="/icons/menu_compare.svg"
          onClick={() => {
            navigate(PATH.COMPARE);
          }}
        />
      </div>
      <div className={style.record_container}>
        <ActionCard>
          <p className="typo-title4-semibold">식단 기록</p>
          <p className={style.description}>오늘 드신 식단을 기록해주세요</p>
          <div className={style.meal_card_list}>
            <MealTimeCard label="아침" iconSrc="/icons/breakfast.svg" value="" onClick={() => {}} />
            <MealTimeCard
              label="점심"
              iconSrc="/icons/lunch.svg"
              value="123"
              onClick={() => {}}
              selected
            />
            <MealTimeCard label="저녁" iconSrc="/icons/dinner.svg" value="" onClick={() => {}} />
            <MealTimeCard label="간식" iconSrc="/icons/snack.svg" value="" onClick={() => {}} />
          </div>
        </ActionCard>
      </div>
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
      <p className="typo-title4-semibold">{title}</p>
      <p className={style.description}>{description}</p>
      <div className={style.icon_container}>
        <img src={iconSrc} alt={`${title} 아이콘`} />
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
          <span className={style.meal_value}>{value}</span>
        ) : (
          iconSrc && <img src={iconSrc} alt={label} className={style.meal_icon} />
        )}
      </div>
      <p className={style.meal_label}>{label}</p>
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
      <div className={style.today_title_container}>
        <p className="typo-title4-semibold">{title}</p>
        <PlusIcon size={20} />
      </div>
      <p style={{ textAlign: "right" }} className="typo-label1-medium">
        <span className="typo-h3-semibold text-orange-950">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>{" "}
        {unit}
      </p>
    </ActionCard>
  );
}
