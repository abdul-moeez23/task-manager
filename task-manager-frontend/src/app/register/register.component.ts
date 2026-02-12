import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../models/register.dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  register() {
    if (!this.username || !this.password || !this.email) {
      this.errorMessage = 'Username, password and email are required';
      return;
    }

    const dto: RegisterDto = {
      username: this.username,
      password: this.password,
      email: this.email
    };

    this.authService.register(dto).subscribe({
      next: (res) => {
        console.log('Registration success:', res);
        this.toastr.success('Registration successful. OTP sent to your email.');
        localStorage.setItem('verifyEmail', this.email);
        setTimeout(() => {
          console.log('Navigating to verify-email');
          this.router.navigate(['/verify-email']);
        }, 1500);
      },
      error: (err) => {
        console.error('Registration error:', err);
        const msg = typeof err.error === 'string' ? err.error : 'Registration failed. Check if email is correct.';
        this.toastr.error(msg);
      }
    });
  }
  login() {
    this.router.navigate(['/login']);
  }
}
