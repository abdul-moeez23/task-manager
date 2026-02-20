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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  // UI state
  usernameFocused = false;
  passwordFocused = false;
  showPassword = false;
  isLoading = false;
  shakeForm = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      if (localStorage.getItem('isAdmin') === 'true') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/user-dashboard']);
      }
    }
  }

  login() {
    if (!this.username || !this.password) {
      this.toastr.error('Username and password are required');
      this.shakeForm = true;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const dto: LoginDto = {
      username: this.username,
      password: this.password
    };

    this.authService.login(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Login successful', '', {
          timeOut: 2000,
          closeButton: true,
          tapToDismiss: true,
          progressBar: true,
          positionClass: 'toast-top-right'
        });

        // Use the isAdmin flag stored by AuthService to decide navigation
        if (localStorage.getItem('isAdmin') === 'true') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Invalid username or password');
        this.shakeForm = true;
      }
    });
  }

  register() {
    this.router.navigate(['/register']);
  }
}
