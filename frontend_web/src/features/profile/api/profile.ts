import { appApiData } from "@/shared/api/appApi";
import type { ProfileResponseDto } from "@/shared/api/types/api.dto";

const END_POINT = {
  GET_PROFILE: "/profile/getProfile",
};

export async function getProfile() {
  const response = appApiData<ProfileResponseDto>({
    endpoint: END_POINT.GET_PROFILE,
    method: "GET",
  });

  return response;
}
