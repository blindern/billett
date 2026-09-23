import { DEFAULT_DIALOG_CONFIG } from "@angular/cdk/dialog"
import { provideHttpClient, withInterceptors } from "@angular/common/http"
import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from "@angular/core"
import { provideRouter, withComponentInputBinding } from "@angular/router"
import { routes } from "./app.routes"
import { csrfInterceptor } from "./common/csrf-interceptor"
import { withCredentials } from "./common/with-credentials"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([withCredentials, csrfInterceptor])),
    {
      provide: DEFAULT_DIALOG_CONFIG,
      useValue: {
        panelClass: "modal-content",
        hasBackdrop: true,
      },
    },
  ],
}
