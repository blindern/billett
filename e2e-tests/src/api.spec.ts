import { test, expect } from "./fixtures"

test(
  "eventgroup API returns data",
  { tag: "@api" },
  async ({ request }) => {
    const response = await request.get(
      "https://billett.blindernuka.no/api/eventgroup",
    )
    expect(response.status()).toBe(200)
    const json = await response.json()
    expect(Array.isArray(json)).toBe(true)
  },
)
