import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"

export const routes: Routes = [
  {
    path: "a/event/:id/ticketgroup/new",
    // new.html
    // component: AdminTicketgroupNewComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/event/:event_id/ticketgroup/:ticketgroup_id",
    // index.html
    // component: AdminTicketgroupComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
]
