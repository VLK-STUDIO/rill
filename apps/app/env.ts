import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nuxt';

export const env = createEnv({
  server: {},
  client: {
    NUXT_PUBLIC_RTMP_URL: z.url()
  },
})