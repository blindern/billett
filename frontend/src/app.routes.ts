import { Routes } from "@angular/router"
import { LoginComponent } from "./auth/login.component"
import { LogoutComponent } from "./auth/logout.component"
import { PageNotFoundComponent } from "./common/page-not-found.component"
import { GuestEventComponent } from "./guest/event/event.component"
import { GuestEventgroupComponent } from "./guest/eventgroup/eventgroup.component"
import { GuestIndexComponent } from "./guest/index/index.component"
import { HjelpComponent } from "./guest/infopages/hjelp.component"
import { SalgsbetingelserComponent } from "./guest/infopages/salgsbetingelser.component"
import { GuestOrderComponent } from "./guest/order/order.component"

export const routes: Routes = [
  {
    path: "",
    component: GuestIndexComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "logout",
    component: LogoutComponent,
  },
  {
    path: "salgsbetingelser",
    component: SalgsbetingelserComponent,
  },
  {
    path: "hjelp",
    component: HjelpComponent,
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
  },
  {
    path: "order/complete",
    component: GuestOrderComponent,
  },
  {
    path: "a",
    loadChildren: () => import("./admin/routes").then((m) => m.routes),
  },
  {
    path: "**",
    component: PageNotFoundComponent,
  },
]
