import { Routes } from "@angular/router"
import { routes as adminRoutes } from "./admin/routes"
import { LoginComponent } from "./auth/login.component"
import { LogoutComponent } from "./auth/logout.component"
import { GuestEventComponent } from "./guest/event/event.component"
import { GuestEventgroupComponent } from "./guest/eventgroup/eventgroup.component"
import { GuestIndexComponent } from "./guest/index/index.component"
import { HjelpComponent } from "./guest/infopages/hjelp.component"
import { PageNotFoundComponent } from "./guest/infopages/page-not-found.component"
import { SalgsbetingelserComponent } from "./guest/infopages/salgsbetingelser.component"
import { GuestOrderComponent } from "./guest/order/order.component"

export const routes: Routes = [
  {
    path: "",
    component: GuestIndexComponent,
    title: "Arrangementer",
  },
  {
    path: "login",
    component: LoginComponent,
    title: "Logg inn",
  },
  {
    path: "logout",
    component: LogoutComponent,
    title: "Logger ut",
  },
  {
    path: "salgsbetingelser",
    component: SalgsbetingelserComponent,
    title: "Salgsbetingelser",
  },
  {
    path: "hjelp",
    component: HjelpComponent,
    title: "Hjelp",
  },
  {
    path: "eventgroup/:id",
    component: GuestEventgroupComponent,
  },
  {
    path: "eventgroup/:id/:query",
    component: GuestEventgroupComponent,
  },
  {
    path: "event/:id",
    component: GuestEventComponent,
    title: "Arrangement",
  },
  {
    path: "order/complete",
    component: GuestOrderComponent,
  },
  ...adminRoutes,
  {
    path: "**",
    component: PageNotFoundComponent,
  },
]
