import { getMealTypeFromCurrentTime } from "@/features/chat/utils/chatMeal";
import { getSafeChatId } from "@/features/chat/utils/recommendNavigation";
import {
  NutrientRegisterFormPage,
  type NutrientRegisterFormState,
} from "@/features/nutrient-entry/components/NutrientRegisterFormPage";
import { PATH } from "@/router/path";
import { useLocation, useNavigate, useSearchParams } from "@/shared/navigation/stackflowNavigation";
import { getTodayFormatDateKey } from "@/shared/utils/dateFormat";

function getChatNutritionRegisterPath(chatId: number | null) {
  if (chatId === null) {
    return PATH.CHAT_NUTRITION_REGISTER;
  }

  const params = new URLSearchParams({
    chatId: String(chatId),
  });

  return `${PATH.CHAT_NUTRITION_REGISTER}?${params.toString()}`;
}

function getChatNutritionDetailPath(chatId: number | null, menuId: number) {
  const params = new URLSearchParams({
    menuId: String(menuId),
  });

  if (chatId !== null) {
    params.set("chatId", String(chatId));
  }

  return `${PATH.CHAT_NUTRITION_DETAIL}?${params.toString()}`;
}

export default function ChatNutritionRegisterPage() {
  const navigation = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = (location.state ?? {}) as NutrientRegisterFormState;
  const chatId = getSafeChatId(searchParams.get("chatId")) ?? locationState.chatId ?? null;
  const dateKey = getTodayFormatDateKey();
  const mealType = getMealTypeFromCurrentTime(new Date());

  return (
    <NutrientRegisterFormPage
      appendMealQueryToBrandSearchReturn={false}
      backFallbackPath={PATH.CHAT}
      brandSearchReturnPath={getChatNutritionRegisterPath(chatId)}
      dateKey={dateKey}
      initialState={{
        ...locationState,
        chatId: chatId ?? undefined,
        entrySource: "chatNutritionLabel",
      }}
      mealType={mealType}
      onRegisteredMenu={(savedMenuId) => {
        navigation(getChatNutritionDetailPath(chatId, savedMenuId), { replace: true });
      }}
    />
  );
}
