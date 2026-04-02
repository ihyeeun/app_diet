import type { ReactNode } from "react";

import style from "@/features/home/styles/ActionCard.module.css";

type ActionCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function ActionCard({ children, className = "", onClick }: ActionCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${style.card_container} ${className ?? ""}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Component>
  );
}
