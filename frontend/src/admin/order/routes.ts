import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { TodoComponent } from "../todo.component"
import { AdminOrderCreateComponent } from "./admin-order-create.component"
import { AdminOrderListComponent } from "./admin-order-list.component"

export const routes: Routes = [
  {
    path: "a/order/new/:eventgroupId",
    component: AdminOrderCreateComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/order/:id",
    // order.html
    // component: AdminOrderComponent,
    component: TodoComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "a/orders",
    // ?eventgroup_id
    // index.html
    component: AdminOrderListComponent,
    canActivate: [requireAdmin],
    // reloadOnSearch: false,
  },
]
