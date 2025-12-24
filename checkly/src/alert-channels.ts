import { EmailAlertChannel } from "checkly/constructs"

export const emailChannel = new EmailAlertChannel("email-channel-1", {
  address: "henrist@gmail.com",
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
  sslExpiry: true,
  sslExpiryThreshold: 30,
})
