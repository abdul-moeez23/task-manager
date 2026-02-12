import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    console.log('Interceptor triggered for:', req.url);

    // Skip token for auth endpoints (registration, login, verify, resend)
    if (req.url.includes('/api/auth/')) {
        return next(req);
    }

    if (token) {
        console.log('Attaching token to request');
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    console.warn('No token found for request to:', req.url);
    return next(req);
};
