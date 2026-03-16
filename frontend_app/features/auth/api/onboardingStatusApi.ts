import { apiClient } from "@/src/shared/api/apiClient";

export async function postHasUserInfo() {
  const response = await apiClient.post("/userAuth/hasUserInfo");

  return response.data.data;
}
