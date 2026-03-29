const DEFAULT_IMAGE_UPLOAD_ENDPOINT = "/home/meal/image/upload";
const ENV_IMAGE_UPLOAD_ENDPOINT = import.meta.env.VITE_IMAGE_UPLOAD_ENDPOINT;

export const NUTRIENT_ENTRY_END_POINT = {
  SEARCH_BRANDS: "/nutrient/brands/search",
  IMAGE_UPLOAD:
    typeof ENV_IMAGE_UPLOAD_ENDPOINT === "string" && ENV_IMAGE_UPLOAD_ENDPOINT.trim()
      ? ENV_IMAGE_UPLOAD_ENDPOINT.trim()
      : DEFAULT_IMAGE_UPLOAD_ENDPOINT,
};
