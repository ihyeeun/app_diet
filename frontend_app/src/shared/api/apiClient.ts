// axios 인스턴스 생성
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

// 추후 API 요청에 대한 인터셉터나 공통 설정을 추가할 수 있습니다.
