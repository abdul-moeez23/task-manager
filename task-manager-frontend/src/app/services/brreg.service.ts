import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BrregService {
    private apiUrl = 'https://data.brreg.no/enhetsregisteret/api/enheter';

    constructor(private http: HttpClient) { }

    getRoles(orgNumber: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${orgNumber}/roller`);
    }

    getEnhet(orgNumber: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${orgNumber}`);
    }
}
