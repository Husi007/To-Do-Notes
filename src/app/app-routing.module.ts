import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomePageComponent} from './components/home-page/home-page.component';
import {ListComponent} from './components/users/list/list.component';
import {AddEditComponent} from './components/users/add-edit/add-edit.component';
import {LoginComponent} from './components/account/login/login.component';
import {RegisterComponent} from './components/account/register/register.component';
import {AuthGuard} from './helpers';

const routes: Routes = [
  {path: '', component: HomePageComponent, canActivate: [AuthGuard]},
  {path: 'users', component: ListComponent, canActivate: [AuthGuard]},
  {path: 'users/add', component: AddEditComponent, canActivate: [AuthGuard]},
  {path: 'users/edit/:id', component: AddEditComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
