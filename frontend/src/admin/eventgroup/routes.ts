import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"

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
    // index.html
    // component: AdminEventgroupComponent,
    component: TodoComponent,
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
