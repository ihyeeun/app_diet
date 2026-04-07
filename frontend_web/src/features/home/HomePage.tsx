import Calendar from "@/features/calendar/components/Calendar";
import MenuActionSection from "@/features/home/components/MenuActionSection";
import PreviewTodayScoreSection from "@/features/home/components/PreviewTodayScoreSection";
import style from "@/features/home/styles/HomePage.module.css";
import { useSelectedDateKey, useSetSelectedDate } from "@/shared/stores/selectedDate.store";
import { parseDateKey } from "@/shared/utils/dateFormat";

export default function HomePage() {
  const selectedDateKey = useSelectedDateKey();
  const setSelectedDate = useSetSelectedDate();
  const selectedDate = parseDateKey(selectedDateKey);

  return (
    <div className={style.container}>
      <Calendar initialDate={selectedDate} onSelectDate={setSelectedDate} />
      <section className={style.homeContainer}>
        <PreviewTodayScoreSection selectedDate={selectedDateKey} />
        <MenuActionSection selectedDate={selectedDateKey} />
      </section>
    </div>
  );
}
