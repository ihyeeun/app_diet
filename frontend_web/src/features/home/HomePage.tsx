import { useState } from "react";
import Calendar from "@/features/calendar/components/Calendar";
import MenuActionSection from "@/features/home/components/MenuActionSection";
import PreviewTodayScoreSection from "@/features/home/components/PreviewTodayScoreSection";
import style from "@/features/home/styles/HomePage.module.css";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  return (
    <div className={style.container}>
      <Calendar initialDate={selectedDate} onSelectDate={setSelectedDate} />
      <section className={style.homeContainer}>
        <PreviewTodayScoreSection />
        <MenuActionSection selectedDate={selectedDate} />
      </section>
    </div>
  );
}
