// axios 인스턴스 생성
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

// 추후 API 요청에 대한 인터셉터나 공통 설정을 추가할 수 있습니다.
// 여기에 로그인 토큰을 자동으로 포함하는 인터셉터와 교환하는 로직을 구현해야하는건가?!
