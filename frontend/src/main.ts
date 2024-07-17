import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app.component"
import { appConfig } from "./app.config"
import "./jquery"

// Load bootstrap after jQuery. For some reason I didn't manage to
// do this in a more "normal" way.
import("bootstrap-sass/assets/javascripts/bootstrap.js" as any)

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err))
