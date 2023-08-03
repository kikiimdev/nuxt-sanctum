import { defineNuxtPlugin } from "nuxt/app";
import { useSanctumAuth } from "./composables/useSanctumAuth";

export default defineNuxtPlugin(async () => {
  if (process.server) return;

  const { isAuthenticated, fetchUser, loginToken, isInitialized } =
    useSanctumAuth();

  if (!isAuthenticated.value && loginToken.value && !isInitialized.value) {
    await fetchUser();
  }

  isInitialized.value = true;
});
