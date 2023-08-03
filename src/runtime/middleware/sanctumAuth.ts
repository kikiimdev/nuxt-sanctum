import { defineNuxtRouteMiddleware, navigateTo } from "#imports";
import { useSanctumAuth } from "../composables/useSanctumAuth";

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useSanctumAuth();

  if (!isAuthenticated.value) {
    return navigateTo(`/masuk?redirectTo=${from.fullPath}`, { replace: true });
  }
});
