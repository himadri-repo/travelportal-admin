import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {path: 'users', component: UsersComponent},
  {path: 'admin/notification', component: UsersComponent},
  {path: 'admin/customer', component: UsersComponent},
  {path: 'admin/finance/wallet', component: UsersComponent},
  {path: 'admin/finance/accounts', component: UsersComponent},
  {path: 'admin/services', component: UsersComponent},
  {path: 'admin/tickets', component: UsersComponent},
  {path: 'admin/sales/bookings', component: UsersComponent},
  {path: 'admin/sales/ledger', component: UsersComponent},
  {path: 'admin/suppliers', component: UsersComponent},
  {path: 'admin/suppliers/search', component: UsersComponent},
  {path: 'admin/users', component: UsersComponent},
  {path: 'admin/roles', component: UsersComponent},
  {path: 'admin/wholesalers', component: UsersComponent},
  {path: 'admin/wholesalers/search', component: UsersComponent},
  {path: '**', component: AppComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {initialNavigation: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
