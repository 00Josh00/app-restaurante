import { createSerwistRoute } from "@serwist/turbopack";

// Revision estable por build: usa el SHA del deploy (Vercel) o un UUID
// generado una vez por proceso (evita spawn de git en cada carga).
const revision =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });