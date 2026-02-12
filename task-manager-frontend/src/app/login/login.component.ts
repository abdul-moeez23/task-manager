import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../models/login.dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService

  ) { }

  login() {
    if (!this.username || !this.password) {
      /*  this.errorMessage = 'Username and password are required';*/
      this.toastr.error('Username and password are required');

      return;
    }
    const dto: LoginDto = {
      username: this.username,
      password: this.password
    };

    this.authService.login(dto).subscribe({
      next: () => {
        this.toastr.success('Login successful', '', {
          timeOut: 2000,          // 2 seconds
          closeButton: true,     // Close button hata diya
          tapToDismiss: true,     // Click karne se close ho jaye
          progressBar: true,     // Progress bar hata diya
          positionClass: 'toast-top-right'
        });
        this.router.navigate(['/']);
      },
      error: () => {
        /* this.errorMessage = 'Invalid username or password';*/
        this.toastr.error('Invalid username or password');

      }
    });
  }

  register() {
    this.router.navigate(['/register']);
  }
}
