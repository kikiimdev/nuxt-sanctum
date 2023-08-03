import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
} from "@nuxt/kit";

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-sanctum",
    configKey: "nuxtSanctum",
  },
  // Default configuration options of the Nuxt module
  defaults: {
    fetchUserOnInit: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve("./runtime/plugin"));

    addImportsDir(resolver.resolve("runtime/composables"));
    addImportsDir(resolver.resolve("runtime/utils"));
    addImportsDir(resolver.resolve("runtime/middleware"));
  },
});
