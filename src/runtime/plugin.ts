import { addRouteMiddleware, defineNuxtPlugin } from "#imports";
import { useSanctumAuth } from "./composables/useSanctumAuth";
import sanctumAuth from "./middleware/sanctumAuth";
import sanctumGuest from "./middleware/sanctumGuest";

export default defineNuxtPlugin(async () => {
  addRouteMiddleware("sanctum-auth", sanctumAuth);
  addRouteMiddleware("sanctum-guest", sanctumGuest);

  if (process.server) return;

  const { isAuthenticated, fetchUser, loginToken, isInitialized } =
    useSanctumAuth();

  if (!isAuthenticated.value && loginToken.value && !isInitialized.value) {
    await fetchUser();
  }

  isInitialized.value = true;
});
