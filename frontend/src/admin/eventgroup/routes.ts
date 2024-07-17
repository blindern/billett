import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { AdminEventgroupCreateComponent } from "./admin-eventgroup-create.component"
import { AdminEventgroupEditComponent } from "./admin-eventgroup-edit.component"
import { AdminEventgroupSoldTicketsStatsComponent } from "./admin-eventgroup-sold-tickets-stats.component"
import { AdminEventgroupComponent } from "./admin-eventgroup.component"

export const routes: Routes = [
  {
    path: "eventgroup/new",
    component: AdminEventgroupCreateComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "eventgroup/:id/edit",
    component: AdminEventgroupEditComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "eventgroup/:id",
    component: AdminEventgroupComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "eventgroup/:id/sold_tickets_stats",
    component: AdminEventgroupSoldTicketsStatsComponent,
    canActivate: [requireAdmin],
  },
]
