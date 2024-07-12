import { Routes } from "@angular/router"
import { LoginComponent } from "./auth/login.controller"
import { LogoutComponent } from "./auth/logout.controller"
import { GuestEventComponent } from "./guest/event/event.component"
import { GuestEventgroupComponent } from "./guest/eventgroup/eventgroup.component"
import { GuestIndexComponent } from "./guest/index/index.component"
import { HjelpComponent } from "./guest/infopages/hjelp.component"
import { PageNotFoundComponent } from "./guest/infopages/page-not-found.component"
import { SalgsbetingelserComponent } from "./guest/infopages/salgsbetingelser.component"

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
    path: "**",
    component: PageNotFoundComponent,
  },
]
