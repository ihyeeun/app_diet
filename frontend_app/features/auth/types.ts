export type LoginSession = {
  accessToken: string;
  refreshToken?: string;
};

export type KakaoRedirectResult =
  | { type: "code"; code: string }
  | { type: "error"; error: string };
