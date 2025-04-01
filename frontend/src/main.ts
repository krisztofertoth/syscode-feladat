import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { StudentListComponent } from './app/components/student-list/student-list.component';
import { LoginComponent } from './app/components/login/login.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

const routes: Routes = [
  { path: '', redirectTo: '/students', pathMatch: 'full' },
  { path: 'students', component: StudentListComponent },
  { path: 'login', component: LoginComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        width: '500px'
      }
    }
  ]
}).catch(err => console.error(err));
