import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"
import { AdminEventgroupComponent } from "./admin-eventgroup.component"

export const routes: Routes = [
  {
    path: "a/eventgroup/new",
    // edit.html
    // component: AdminEventgroupEditNewComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/eventgroup/:id/edit",
    // edit.html
    // component: AdminEventgroupEditNewComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/eventgroup/:id",
    component: AdminEventgroupComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/eventgroup/:id/sold_tickets_stats",
    // sold_tickets_stats.html
    // component: AdminEventgroupSoldTicketsStatsComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
]
