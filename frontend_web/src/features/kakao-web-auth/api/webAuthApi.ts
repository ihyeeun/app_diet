import { platformApiData, type RequestOptions } from "@/shared/api/appApi";

let webAuthAccessToken: string | null = null;

export function setWebAuthAccessToken(accessToken: string) {
  webAuthAccessToken = accessToken;
}

export function getWebAuthAccessToken() {
  return webAuthAccessToken;
}

export function webAuthApiData<T>(options: RequestOptions): Promise<T> {
  return platformApiData<T>(options, {
    bearerToken: webAuthAccessToken,
  });
}
