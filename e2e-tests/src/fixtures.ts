import { test as base, expect } from "@playwright/test"

export const test = base.extend<{ retryDelay: void }>({
  retryDelay: [
    async ({}, use, testInfo) => {
      if (testInfo.retry > 0) {
        const delay = 10_000 * Math.pow(3, testInfo.retry - 1)
        testInfo.setTimeout(testInfo.timeout + delay)
        await new Promise((r) => setTimeout(r, delay))
      }
      await use()
    },
    { auto: true },
  ],
})

export { expect }
