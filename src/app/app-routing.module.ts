import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScatterComponent } from './charts/scatter/scatter.component';

import { DashboardComponent } from './dashboard/dashboard.component';



const routes: Routes = [
 
 { path: 'dashboard', component: DashboardComponent },
{ path: 'scatter', component: ScatterComponent } // just to test if routing is ok
 

]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
