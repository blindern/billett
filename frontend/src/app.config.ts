import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core"
import { provideRouter, withComponentInputBinding } from "@angular/router"

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http"
import { routes } from "./app.routes"
import { csrfInterceptor } from "./common/csrf-interceptor"
import { withCredentials } from "./common/with-credentials"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([withCredentials, csrfInterceptor]),
    ),
  ],
}
