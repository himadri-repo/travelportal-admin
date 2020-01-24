import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { AppComponent } from './app.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { WholesalersComponent } from './components/wholesalers/wholesalers.component';
import { CustomersComponent } from './components/customers/customers.component';
import { TicketsComponent } from './components/tickets/tickets.component';
import { SuppliersearchComponent } from './components/suppliers/suppliersearch/suppliersearch.component';
import { WholesalerSearchComponent } from './components/wholesalers/search/wholesalersearch.component';
import { NotificationComponent } from './components/notification/notification.component';
import { RateplanComponent } from './components/general/rateplan/rateplan.component';
import { BookingsComponent } from './components/sales/bookings/bookings.component';
import { WalletsComponent } from './components/wallets/wallets.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UseractivityComponent } from './components/useractivity/useractivity.component';
import { PnrsearchComponent } from './components/pnrsearch/pnrsearch.component';
import { ProfileComponent } from './components/general/profile/profile.component';
import { UserQueryComponent } from './components/users/user-query/user-query.component';

const routes: Routes = [
  {path: 'users', component: UsersComponent},
  {path: 'admin/notification', component: NotificationComponent},
  {path: 'admin/customer', component: CustomersComponent},
  {path: 'admin/finance/wallet', component: WalletsComponent},
  {path: 'admin/finance/accounts', component: UsersComponent},
  {path: 'admin/services', component: UsersComponent},
  {path: 'admin/tickets', component: TicketsComponent},
  {path: 'admin/sales/bookings', component: BookingsComponent},
  {path: 'admin/sales/ledger', component: UsersComponent},
  {path: 'admin/suppliers', component: SuppliersComponent},
  {path: 'admin/suppliers/search', component: SuppliersearchComponent},
  {path: 'admin/users', component: UsersComponent},
  {path: 'admin/roles', component: UsersComponent},
  {path: 'admin/wholesalers', component: WholesalersComponent},
  {path: 'admin/wholesalers/search', component: WholesalerSearchComponent},
  {path: 'admin/rateplan', component: RateplanComponent},
  {path: 'admin/profile', component: ProfileComponent},
  {path: 'admin/dashboard', component: DashboardComponent},
  {path: 'admin/useractivity', component: UseractivityComponent},
  {path: 'admin/userquery', component: UserQueryComponent},
  {path: 'admin/pnrsearch', component: PnrsearchComponent},
  {path: 'admin/:uuid', component: AppComponent},
  {path: '**', component: AppComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {initialNavigation: false, enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
