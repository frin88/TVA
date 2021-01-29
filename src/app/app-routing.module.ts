import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScatterComponent } from './charts/scatter/scatter.component';
import { TestComponent } from './charts/test/test.component';

import { DashboardComponent } from './dashboard/dashboard.component';



const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'dashboard' },
 { path: 'dashboard', component: DashboardComponent },
 { path: 'test', component: TestComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
