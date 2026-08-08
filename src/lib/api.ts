// Re-export from api-utils for backward compatibility
// Old routes import from @/lib/api, new ones from @/lib/api-utils
// Both point to the same implementation now

export { apiSuccess, apiError, handleApiError, apiPaginated, apiCreated, apiNoContent } from "./api-utils";
