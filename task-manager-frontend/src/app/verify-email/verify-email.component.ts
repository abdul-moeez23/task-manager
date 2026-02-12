import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { VerifyEmailDto } from '../models/verify-email.dto';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  email = '';
  otp = '';
  errorMessage = '';
  successMessage = '';

  cooldown: number = 0;   // ✅ declare
  timer: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.email = localStorage.getItem('verifyEmail') || '';
  }

  verify() {
    if (!this.email || !this.otp) {
      this.errorMessage = 'Email and OTP are required';
      return;
    }

    const dto: VerifyEmailDto = {
      email: this.email,
      otp: this.otp
    };

    this.authService.verifyEmail(dto).subscribe({
      next: (res) => {
        console.log('Verification success:', res);
        this.toastr.success('Email verified successfully. You can now login.');
        setTimeout(() => {
          console.log('Navigating to login');
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        console.error('Verification error:', err);
        const msg = typeof err.error === 'string' ? err.error : 'Verification failed. Try again.';
        this.toastr.error(msg);
      }
    });
  }

  // 🔁 RESEND OTP
  resendOtp() {
    if (!this.email) {
      this.toastr.error('Please enter your email first');
      return;
    }

    this.authService.resendVerificationCode(this.email).subscribe({
      next: () => {
        this.toastr.success('Verification code resent');
        this.startCooldown(60); // 60 sec
      },
      error: (err) => {
        console.error('Resend OTP error:', err);
        let msg = 'Failed to resend OTP';
        if (typeof err.error === 'string') {
          msg = err.error;
        } else if (err.error && err.error.message) {
          msg = err.error.message;
        } else if (err.message) {
          msg = err.message;
        }
        this.toastr.error(msg);
      }
    });
  }

  // ⏳ cooldown logic
  startCooldown(seconds: number) {
    this.cooldown = seconds;

    this.timer = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }





}
