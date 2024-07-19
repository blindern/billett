import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app.component"
import { appConfig } from "./app.config"
import "./jquery"

// Load bootstrap after jQuery. For some reason I didn't manage to
// do this in a more "normal" way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
void import("bootstrap-sass/assets/javascripts/bootstrap.js" as any)

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err))
