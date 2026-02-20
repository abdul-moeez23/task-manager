import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { VerifyEmailDto } from '../models/verify-email.dto';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  email = '';
  otp = '';
  errorMessage = '';
  isLoading = false;

  cooldown: number = 0;
  timer: any;

  // Timer for OTP expiry (3 minutes)
  expirySeconds: number = 180;
  expiryTimer: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.email = localStorage.getItem('verifyEmail') || '';
    if (!this.email) {
      this.router.navigate(['/register']);
      return;
    }
    this.initTimers();
  }

  initTimers() {
    const sentAt = localStorage.getItem('otpSentAt');
    if (sentAt) {
      const now = new Date().getTime();
      const diffInSeconds = Math.floor((now - parseInt(sentAt)) / 1000);

      // Calculate remaining expiry time (total 180s)
      const remainingExpiry = 180 - diffInSeconds;
      if (remainingExpiry > 0) {
        this.startExpiryTimer(remainingExpiry);
      } else {
        this.expirySeconds = 0;
        this.errorMessage = 'Verification code has expired. Please resend code.';
      }

      // Calculate remaining cooldown (total 60s)
      const remainingCooldown = 60 - diffInSeconds;
      if (remainingCooldown > 0) {
        this.startCooldown(remainingCooldown);
      } else {
        this.cooldown = 0;
      }
    } else {
      // If no timestamp, start fresh and save it
      const now = new Date().getTime();
      localStorage.setItem('otpSentAt', now.toString());
      this.startExpiryTimer(180);
      this.cooldown = 0;
    }
  }

  verify() {
    if (!this.email || !this.otp) {
      this.errorMessage = 'Please enter the 6-digit verification code.';
      return;
    }

    if (this.otp.length < 6) {
      this.errorMessage = 'Code must be exactly 6 digits.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const dto: VerifyEmailDto = {
      email: this.email,
      otp: this.otp
    };

    this.authService.verifyEmail(dto).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastr.success('Email verified successfully! You can now login.');
        localStorage.removeItem('otpSentAt');
        localStorage.removeItem('verifyEmail');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err.error === 'string' ? err.error : 'Invalid or expired code.';
      }
    });
  }

  resendOtp() {
    if (!this.email) {
      this.toastr.error('Email not found. Please try registering again.');
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.authService.resendVerificationCode(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('New verification code sent!');

        // Update timestamp for persistence
        const now = new Date().getTime();
        localStorage.setItem('otpSentAt', now.toString());

        this.startCooldown(60);
        this.startExpiryTimer(180);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err.error === 'string' ? err.error : 'Failed to resend code.';
      }
    });
  }

  startCooldown(seconds: number) {
    this.cooldown = seconds;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  startExpiryTimer(seconds: number) {
    this.expirySeconds = seconds;
    if (this.expiryTimer) clearInterval(this.expiryTimer);
    this.expiryTimer = setInterval(() => {
      this.expirySeconds--;
      if (this.expirySeconds <= 0) {
        clearInterval(this.expiryTimer);
        this.expirySeconds = 0;
        this.errorMessage = 'Verification code has expired. Please resend code.';
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.expiryTimer) clearInterval(this.expiryTimer);
  }
}
