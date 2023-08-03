import { useLocalStorage } from "@vueuse/core";
import {
  watch,
  useState,
  computed,
  useAsyncData,
  MaybeRef,
  unref,
  navigateTo,
  useRoute,
  Ref,
} from "#imports";
import { $sanctumFetch } from "../utils/$sanctumFetch";

type Error = any;
export type Credentials = {
  username: string;
  password: string;
  device_name: string;
};
type SignInOpts = {
  redirectUrl?: string;
};
type SignOutOpts = {
  redirectUrl?: string;
};

type UseSanctumAuth<DataT> = {
  data: Ref<DataT | null>;
  error: Ref<any>;
  isAuthenticated: Ref<boolean>;
  fetchUser: Function;
  isFetchingUser: Ref<boolean>;
  signIn: Function;
  signOut: Function;
  loginToken: Ref<string>;
  isInitialized: Ref<boolean>;
};

export const useSanctumAuth = <DataT>(): UseSanctumAuth<DataT> => {
  const data = useState<DataT | null>("user", () => null);
  const isFetchingUser = useState("is-fetching-user", () => false);
  const error = useState<Error | null>("user-error", () => null);
  const isInitialized = useState<boolean>(
    "is-auth-sanctum-initialized",
    () => false
  );

  const loginToken = useLocalStorage("login-token", "", {
    listenToStorageChanges: true,
  });
  watch(
    loginToken,
    (v) => {
      if (!v) data.value = null;
    },
    { immediate: true }
  );

  const isAuthenticated = useState<boolean>("isAuthenticated", () => false);
  const isAuthenticatedComputed = computed(() => !!data.value);
  watch(
    isAuthenticatedComputed,
    (v) => {
      isAuthenticated.value = v;
    },
    {
      immediate: true,
    }
  );

  const fetchUser = async () => {
    error.value = null;

    const { data: userData, error: userError } = await useAsyncData(
      "fetch-user",
      () =>
        $sanctumFetch("/api/user", {
          headers: {
            Authorization: `Bearer ${loginToken.value}`,
          },
        })
    );
    data.value = userData.value as DataT;
    error.value = userError.value || null;

    // const userData: any = await $sanctumFetch("/api/user", {
    //   cache: "force-cache",
    // }).catch((e) => {
    //   error.value = e
    // })
    // data.value = userData
  };

  const signIn = async (
    credentials: MaybeRef<Credentials>,
    opts: SignInOpts = {}
  ) => {
    let { redirectUrl } = opts;
    await $sanctumFetch("/sanctum/csrf-cookie");
    const result = await $sanctumFetch<any>("/api/login", {
      method: "POST",
      body: unref(credentials),
    });

    if (result.token) {
      loginToken.value = result.token;
      await fetchUser();

      const redirectTo = useRoute().query?.redirectTo as string;
      if (redirectTo) redirectUrl = redirectTo;
      if (redirectUrl) navigateTo(redirectUrl);
    }
  };

  const signOut = async (opts: SignOutOpts = {}) => {
    const { redirectUrl } = opts;
    await $sanctumFetch("/sanctum/csrf-cookie");
    const result = await $sanctumFetch<any>("/api/logout", {
      method: "POST",
    });

    if (result) {
      loginToken.value = "";
      if (redirectUrl) navigateTo(redirectUrl);
    }
  };

  return {
    data,
    error,
    isAuthenticated,
    fetchUser,
    isFetchingUser,
    signIn,
    signOut,
    loginToken,
    isInitialized,
  };
};
