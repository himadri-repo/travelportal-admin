import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {path: 'users', component: UsersComponent},
  {path: '**', component: AppComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {initialNavigation: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
