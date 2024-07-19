import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { AdminDaythemeCreateComponent } from "./admin-daytheme-create.component"

export const routes: Routes = [
  {
    path: "eventgroup/:eventgroupId/new_daytheme",
    component: AdminDaythemeCreateComponent,
    canActivate: [requireAdmin],
  },
]
