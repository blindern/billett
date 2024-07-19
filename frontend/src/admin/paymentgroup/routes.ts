import { Routes } from "@angular/router"
import { requireAdmin } from "../../auth/require-admin"
import { AdminPaymentgroupItemComponent } from "./admin-paymentgroup-item.component"
import { AdminPaymentgroupListComponent } from "./admin-paymentgroup-list.component"

export const routes: Routes = [
  {
    path: "paymentgroup/:id",
    component: AdminPaymentgroupItemComponent,
    canActivate: [requireAdmin],
  },
  {
    path: "eventgroup/:eventgroupId/paymentgroups",
    component: AdminPaymentgroupListComponent,
    canActivate: [requireAdmin],
  },
]
