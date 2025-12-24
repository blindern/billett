import {
  AlertEscalationBuilder,
  CheckGroupV2,
  RetryStrategyBuilder,
} from "checkly/constructs"
import { emailChannel } from "./alert-channels"

export const billettGroup = new CheckGroupV2("billett-check-group", {
  name: "billett.blindernuka.no",
  activated: true,
  muted: false,
  locations: ["eu-central-1"],
  environmentVariables: [],
  apiCheckDefaults: {},
  concurrency: 100,
  alertChannels: [emailChannel],
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
  retryStrategy: RetryStrategyBuilder.linearStrategy({
    baseBackoffSeconds: 30,
    maxRetries: 10,
    sameRegion: false,
  }),
  runParallel: true,
})
