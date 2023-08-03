import { useLocalStorage } from "@vueuse/core";
import { useCookie, useRequestHeaders, useRuntimeConfig } from "#imports";

type NitroFetchArgs = Parameters<typeof $fetch>;
// type NitroFetchRequest = NitroFetchArgs["0"]
type NitroFetchOptions = NitroFetchArgs["1"];

export const $sanctumFetch = <T = unknown>(
  url: string,
  opts?: NitroFetchOptions | undefined
) => {
  const config = useRuntimeConfig();

  const apiUrl = config.public.apiUrl ?? "http://localhost:8000";
  const appUrl = config.public.appUrl ?? "http://localhost:3000";

  if (typeof url == "string" && url.startsWith("/")) {
    url = apiUrl + url;
  }

  let headers: any = {
    accept: "application/json",
    referer: appUrl,
  };
  const token = useCookie("XSRF-TOKEN");
  if (token.value) {
    headers["X-XSRF-TOKEN"] = token.value as string;
  }

  const loginToken = useLocalStorage("login-token", "", {
    listenToStorageChanges: true,
  });

  if (loginToken.value) {
    headers["Authorization"] = `Bearer ${loginToken.value}`;
  }

  if (process.server) {
    headers = {
      ...headers,
      ...useRequestHeaders(["cookie"]),
    };
  }

  opts = {
    credentials: "include",
    ...opts,
    headers: {
      ...headers,
      ...opts?.headers,
    },
  };

  return $fetch<T>(url, opts);
};
