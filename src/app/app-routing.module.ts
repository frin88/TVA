import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarComponent } from './charts/bar/bar.component';

import { DashboardComponent } from './dashboard/dashboard.component';



const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
 { path: 'dashboard', component: DashboardComponent },
  // { path: 'bar', component: BarComponent } // just to test if routing is ok
 

]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
