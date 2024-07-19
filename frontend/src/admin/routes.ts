import { requireAdmin } from "../auth/require-admin"
import { routes as daythemeRoutes } from "./daytheme/routes"
import { routes as eventRoutes } from "./event/routes"
import { routes as eventgroupRoutes } from "./eventgroup/routes"
import { AdminIndexComponent } from "./index/index.component"
import { routes as orderRoutes } from "./order/routes"
import { routes as paymentgroupRoutes } from "./paymentgroup/routes"
import { routes as ticketgroupRoutes } from "./ticketgroup/routes"

export const routes = [
  {
    path: "",
    component: AdminIndexComponent,
    canActivate: [requireAdmin],
  },
  ...daythemeRoutes,
  ...eventRoutes,
  ...eventgroupRoutes,
  ...orderRoutes,
  ...paymentgroupRoutes,
  ...ticketgroupRoutes,
]
