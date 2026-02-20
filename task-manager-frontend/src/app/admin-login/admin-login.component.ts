import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
    username = '';
    password = '';
    errorMessage = '';

    usernameFocused = false;
    passwordFocused = false;
    showPassword = false;
    isLoading = false;
    shakeForm = false;

    private apiUrl = environment.apiUrl + '/BusinessPartner';

    constructor(
        private http: HttpClient,
        private router: Router,
        private toastr: ToastrService
    ) { }

    login() {
        if (!this.username || !this.password) {
            this.toastr.error('Username and password are required');
            this.shakeForm = true;
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.http.post<any>(`${this.apiUrl}/admin-login`, {
            username: this.username,
            password: this.password
        }).subscribe({
            next: (res) => {
                this.isLoading = false;
                localStorage.setItem('isAdmin', 'true');
                this.toastr.success('Welcome, Administrator!', '', {
                    timeOut: 2000,
                    progressBar: true,
                    positionClass: 'toast-top-right'
                });
                this.router.navigate(['/admin-dashboard']);
            },
            error: (err) => {
                this.isLoading = false;
                this.toastr.error('Invalid admin credentials');
                this.shakeForm = true;
            }
        });
    }

    goToUserLogin() {
        this.router.navigate(['/login']);
    }
}
