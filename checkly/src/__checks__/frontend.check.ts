import { BrowserCheck } from "checkly/constructs"
import * as path from "path"
import { emailChannel } from "../alert-channels"
import { billettGroup } from "../groups"

new BrowserCheck("billett-frontend-browser-check", {
  name: "Billett Frontend",
  group: billettGroup,
  frequency: 1440, // once per day
  playwrightConfig: {
    timeout: 60000,
    use: {
      viewport: { width: 1280, height: 720 },
      locale: "nb-NO",
    },
  },
  code: {
    entrypoint: path.join(__dirname, "frontend.spec.ts"),
  },
  runParallel: true,
  tags: ["frontend"],
})
