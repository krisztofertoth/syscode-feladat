import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Bejelentkezés</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Felhasználónév</mat-label>
              <input matInput formControlName="username" placeholder="Add meg a felhasználóneved">
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                A felhasználónév megadása kötelező
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Jelszó</mat-label>
              <input matInput formControlName="password" type="password" placeholder="Add meg a jelszavad">
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                A jelszó megadása kötelező
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="!loginForm.valid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Bejelentkezés</span>
            </button>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }
    mat-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    mat-form-field {
      width: 100%;
    }
    button {
      height: 40px;
    }
    .error-message {
      color: #f44336;
      text-align: center;
      margin-top: 16px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private studentService: StudentService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { username, password } = this.loginForm.value;
      
      // Beállítjuk az auth tokent
      this.authService.login(username, password);

      // Teszteljük a bejelentkezést egy API hívással
      this.studentService.loadStudents().subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/students']);
        },
        error: (error) => {
          this.isLoading = false;
          this.authService.logout(); // Hibás bejelentkezés esetén töröljük a tokent
          this.errorMessage = 'Hibás felhasználónév vagy jelszó';
          console.error('Bejelentkezési hiba:', error);
        }
      });
    }
  }
} 