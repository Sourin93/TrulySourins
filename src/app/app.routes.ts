import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { EditBookComponent } from './components/edit-book/edit-book.component';
import { LoginComponent } from './components/login/login.component';
import { StatsComponent } from './components/stats/stats.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Login is completely standalone — no navbar shell
    { path: 'login', component: LoginComponent },

    // All authenticated routes render inside ShellComponent (which has the navbar)
    {
        path: '',
        component: ShellComponent,
        canActivate: [authGuard],
        children: [
            { path: '', component: DashboardComponent },
            { path: 'add', component: AddBookComponent },
            { path: 'edit/:id', component: EditBookComponent },
            { path: 'stats', component: StatsComponent },
        ]
    },

    { path: '**', redirectTo: '' }
];
