import { useNavigate } from "react-router-dom";

import ActionCard from "@/features/home/components/cards/ActionCard";
import TodayBodyLogSection from "@/features/home/components/TodayBodyLogSection";
import style from "@/features/home/styles/MenuActionSection.module.css";
import { PATH } from "@/router/path";
import { syncAppTab } from "@/shared/api/bridge/nativeBridge";

export default function MenuActionSection({ selectedDate }: { selectedDate: string }) {
  const navigate = useNavigate();

  return (
    <div className={style.content}>
      <div className={style.menu_container}>
        <MenuCard
          title={"메뉴판 촬영하기"}
          description="식당 메뉴판이나 배달 앱 스크린샷도 좋아요"
          iconSrc="/icons/Camera.svg"
          onClick={() => {
            navigate(PATH.MENU_BOARD_CAMERA);
          }}
          type="camera"
        />
        <MenuCard
          title={"물어보기"}
          description="메뉴판이 없다면 직접 물어봐도 좋아요"
          iconSrc="/icons/Chat.svg"
          onClick={() => {
            syncAppTab("chat");
            navigate(PATH.CHAT);
          }}
        />
      </div>

      <TodayBodyLogSection date={selectedDate} />
    </div>
  );
}

function MenuCard({
  title,
  description,
  iconSrc,
  onClick,
  type,
}: {
  title: string;
  description: string;
  iconSrc: string;
  onClick: () => void;
  type?: string;
}) {
  return (
    <ActionCard onClick={onClick} className={type === "camera" ? style.bg_primary : ""}>
      <div className={style.menu_card_container}>
        <p className={`typo-title4 ${type === "camera" ? style.text_white : ""}`}>{title}</p>
        <p className={`${type === "camera" ? style.text_white : style.description} typo-body4`}>
          {description}
        </p>
        <div className={style.icon_container}>
          <img src={iconSrc} alt={`${title} 아이콘`} className={style.icon_size} />
        </div>
      </div>
    </ActionCard>
  );
}
