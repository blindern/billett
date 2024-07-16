import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { AdminTicketgroupCreateComponent } from "./admin-ticketgroup-create.component"
import { AdminTicketgroupItemComponent } from "./admin-ticketgroup-item.component"

export const routes: Routes = [
  {
    path: "a/event/:eventId/ticketgroup/new",
    component: AdminTicketgroupCreateComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/event/:eventId/ticketgroup/:ticketgroupId",
    component: AdminTicketgroupItemComponent,
    canActivate: [requireAdmin],
  },
]
