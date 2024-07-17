import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { AdminOrderCreateComponent } from "./admin-order-create.component"
import { AdminOrderItemComponent } from "./admin-order-item.component"
import { AdminOrderListComponent } from "./admin-order-list.component"

export const routes: Routes = [
  {
    path: "order/new/:eventgroupId",
    component: AdminOrderCreateComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "order/:id",
    component: AdminOrderItemComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "orders",
    // ?eventgroup_id
    // index.html
    component: AdminOrderListComponent,
    canActivate: [requireAdmin],
    // reloadOnSearch: false,
  },
]
