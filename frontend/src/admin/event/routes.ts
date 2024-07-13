import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"

export const routes: Routes = [
  {
    path: "a/eventgroup/:eventgroup_id/new_event",
    // edit.html
    // component: AdminEventEditNewComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/event/:id/edit",
    // edit.html
    // component: AdminEventEditNewComponent,
    component: TodoComponent,
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
    // index.html
    // component: AdminEventComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
]
