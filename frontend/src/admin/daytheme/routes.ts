import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"

export const routes: Routes = [
  {
    path: "a/eventgroup/:eventgroup_id/new_daytheme",
    // edit.html
    // component: AdminDaythemeEditNewComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/daytheme/:id/edit",
    // edit.html
    // component: AdminDaythemeEditNewComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/daytheme/:id",
    // index.html
    // component: AdminDaythemeComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
]
