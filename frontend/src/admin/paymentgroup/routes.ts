import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"

export const routes: Routes = [
  {
    path: "a/paymentgroup/:id",
    // item.html
    // component: AdminPaymentgroupItemComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/eventgroup/:eventgroup_id/paymentgroups",
    // list.html
    // component: AdminPaymentgroupListComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
]
