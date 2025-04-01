import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { Student } from '../../models/student';
import { StudentFormComponent } from '../student-form/student-form.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    StudentFormComponent
  ]
})
export class StudentListComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  displayedColumns: string[] = ['name', 'email', 'address', 'actions'];
  loading = false;
  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.studentService.students$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(students => {
      this.students = students;
    });

    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  ngOnInit() {
    this.loadStudents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents() {
    this.loading = true;
    this.studentService.loadStudents().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Hiba történt a diákok betöltésekor:', error);
        this.loading = false;
      }
    });
  }

  openStudentForm(student?: Student) {
    const dialogRef = this.dialog.open(StudentFormComponent, {
      data: student,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStudents();
      }
    });
  }

  deleteStudent(id: string) {
    if (confirm('Biztosan törölni szeretnéd ezt a diákot?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.loadStudents();
        },
        error: (error) => {
          console.error('Hiba történt a diák törlésekor:', error);
        }
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
} 