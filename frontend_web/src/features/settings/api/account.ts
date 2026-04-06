import { appApiData } from "@/shared/api/appApi";

export async function logout() {
  await appApiData({
    endpoint: "/commonAuth/signout",
    method: "POST",
    body: {},
  });
}

export async function withdraw() {
  await appApiData({
    endpoint: "/commonAuth/delete",
    method: "POST",
  });
}
