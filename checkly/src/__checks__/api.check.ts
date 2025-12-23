import { ApiCheck, AssertionBuilder } from "checkly/constructs"
import { billettGroup } from "../groups"

new ApiCheck("billett-api-check", {
  name: "Billett API",
  group: billettGroup,
  degradedResponseTime: 10000,
  maxResponseTime: 20000,
  frequency: 1440, // once per day
  request: {
    url: "https://billett.blindernuka.no/api/eventgroup",
    method: "GET",
    assertions: [AssertionBuilder.statusCode().equals(200)],
  },
  runParallel: true,
  tags: ["api"],
})
