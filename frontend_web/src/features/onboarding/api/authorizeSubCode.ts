import { END_POINT } from "@/features/onboarding/api/endpoints";
import { authedApiData } from "@/shared/api/appApi";

type AuthorizeSubCodeRequest = {
  subCode: string;
};

export function postAuthorizeSubCode(payload: AuthorizeSubCodeRequest) {
  return authedApiData<unknown>({
    endpoint: END_POINT.AUTHORIZE_SUB_CODE,
    method: "POST",
    body: payload,
  });
}
