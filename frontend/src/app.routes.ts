import { Routes } from "@angular/router"
import { GuestIndexComponent } from "./guest/index/index.component"
import { GuestEventgroupComponent } from "./guest/eventgroup/eventgroup.component"
import { NotFoundComponent } from "./guest/infopages/not-found.component"

export const routes: Routes = [
  {
    path: "",
    component: GuestIndexComponent,
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
    path: "**",
    component: NotFoundComponent,
  },
]
