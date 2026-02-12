import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RegisterDto } from '../models/register.dto';
import { LoginDto } from '../models/login.dto';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VerifyEmailDto } from '../models/verify-email.dto';

interface LoginResponse {
    token: string;
    username: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5124/api/auth';
    private tokenKey = 'jwtToken';
    public username$ = new BehaviorSubject<string | null>(null);

    constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) { }

    register(dto: RegisterDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, dto);
    }


    login(dto: LoginDto): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto)
            .pipe(
                tap(res => {
                    console.log('Login successful, token received:', res.token);
                    localStorage.setItem(this.tokenKey, res.token);
                    this.username$.next(res.username);
                })
            );
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        this.username$.next(null);
        this.router.navigate(['/login']);
        this.toastr.success('Logout successful', '', {
            timeOut: 2000,
            closeButton: true,
            tapToDismiss: true,
            progressBar: true,
            positionClass: 'toast-top-right'
        });
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    verifyEmail(dto: VerifyEmailDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify-email`, dto);
    }

    resendVerificationCode(email: string) {
        return this.http.post(`${this.apiUrl}/resend-verification`, { email });
    }


}
