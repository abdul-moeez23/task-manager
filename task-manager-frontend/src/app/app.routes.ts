import { Routes } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskAddComponent } from './task-add/task-add.component';
import { TaskEditComponent } from './task-edit/task-edit.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AuthGuard } from './guards/auth.guard';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

export const routes: Routes = [
    { path: '', component: TaskListComponent, canActivate: [AuthGuard] },
    { path: 'add', component: TaskAddComponent, canActivate: [AuthGuard] },
    { path: 'edit/:id', component: TaskEditComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },


];
