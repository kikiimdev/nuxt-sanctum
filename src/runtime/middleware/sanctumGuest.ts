import { defineNuxtRouteMiddleware, navigateTo } from "#imports";
import { useSanctumAuth } from "../composables/useSanctumAuth";

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useSanctumAuth();

  if (isAuthenticated.value) {
    let redirectUrl = "/app";
    const { redirectTo } = from.query as any;

    if (redirectTo && !from.fullPath.startsWith(redirectTo))
      redirectUrl = redirectTo;

    return navigateTo(redirectUrl, { replace: true });
  }
});
