import { useState } from "react";
import Calendar from "@/features/calendar/components/Calendar";
import MenuActionSection from "@/features/home/components/MenuActionSection";
import TodayScoreSection from "@/features/home/components/TodayScoreSection";
import style from "@/features/home/styles/HomePage.module.css";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  return (
    <div className={style.container}>
      <Calendar initialDate={selectedDate} onSelectDate={setSelectedDate} />
      <section className={style.homeContainer}>
        <TodayScoreSection />
        <MenuActionSection selectedDate={selectedDate} />
      </section>
    </div>
  );
}
