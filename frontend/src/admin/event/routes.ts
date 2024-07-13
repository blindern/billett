import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"
import { AdminEventCreateComponent } from "./admin-event-create.component"
import { AdminEventEditComponent } from "./admin-event-edit.component"
import { AdminEventComponent } from "./admin-event.component"

export const routes: Routes = [
  {
    path: "a/eventgroup/:eventgroupId/new_event",
    component: AdminEventCreateComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/event/:id/edit",
    component: AdminEventEditComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/event/:id/checkin",
    // checkin.html
    // component: AdminCheckinComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/event/:id",
    component: AdminEventComponent,
    canActivate: [requireAdmin],
  },
]
