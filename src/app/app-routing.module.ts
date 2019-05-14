import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { AppComponent } from './app.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { WholesalersComponent } from './components/wholesalers/wholesalers.component';
import { CustomersComponent } from './components/customers/customers.component';

const routes: Routes = [
  {path: 'users', component: UsersComponent},
  {path: 'admin/notification', component: UsersComponent},
  {path: 'admin/customer', component: CustomersComponent},
  {path: 'admin/finance/wallet', component: UsersComponent},
  {path: 'admin/finance/accounts', component: UsersComponent},
  {path: 'admin/services', component: UsersComponent},
  {path: 'admin/tickets', component: UsersComponent},
  {path: 'admin/sales/bookings', component: UsersComponent},
  {path: 'admin/sales/ledger', component: UsersComponent},
  {path: 'admin/suppliers', component: SuppliersComponent},
  {path: 'admin/suppliers/search', component: SuppliersComponent},
  {path: 'admin/users', component: UsersComponent},
  {path: 'admin/roles', component: UsersComponent},
  {path: 'admin/wholesalers', component: WholesalersComponent},
  {path: 'admin/wholesalers/search', component: WholesalersComponent},
  {path: 'admin/:uuid', component: AppComponent},
  {path: '**', component: AppComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {initialNavigation: false, enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
