import Calendar from "@/features/calendar/components/Calendar";
import MenuActionSection from "@/features/home/components/MenuActionSection";
import TodayScoreSection from "@/features/home/components/TodayScoreSection";
import style from "@/features/home/styles/HomePage.module.css";

export default function HomePage() {
  return (
    <div className={style.container}>
      <Calendar initialDate={new Date()} />
      <section className={style.homeContainer}>
        <TodayScoreSection />
        <MenuActionSection />
      </section>
    </div>
  );
}
