import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, HttpClientModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    partners: any[] = [];
    filteredPartners: any[] = [];
    loading = true;
    actionId: number | null = null;
    activeFilter = 'all'; // 'all', 'pending', 'approved', 'rejected'
    searchQuery = '';

    stats = { total: 0, pending: 0, approved: 0, rejected: 0 };

    // Detail modal
    selectedPartner: any = null;

    private apiUrl = environment.apiUrl + '/BusinessPartner';

    constructor(
        private http: HttpClient,
        private router: Router,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        if (localStorage.getItem('isAdmin') !== 'true') {
            this.router.navigate(['/login']);
            return;
        }
        this.fetchAll();
        this.fetchStats();
    }

    fetchAll() {
        this.loading = true;
        this.http.get<any[]>(`${this.apiUrl}/all`).subscribe({
            next: (data) => {
                this.partners = data;
                this.applyFilter();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.toastr.error('Failed to load partners');
            }
        });
    }

    fetchStats() {
        this.http.get<any>(`${this.apiUrl}/stats`).subscribe({
            next: (data) => this.stats = data,
            error: () => { }
        });
    }

    setFilter(filter: string) {
        this.activeFilter = filter;
        this.applyFilter();
    }

    applyFilter() {
        let list = this.partners;
        if (this.activeFilter !== 'all') {
            list = list.filter(p => p.status?.toLowerCase() === this.activeFilter);
        }
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            list = list.filter(p =>
                p.companyName?.toLowerCase().includes(q) ||
                p.orgNumber?.toLowerCase().includes(q) ||
                p.contactPerson?.toLowerCase().includes(q) ||
                p.contactEmail?.toLowerCase().includes(q) ||
                p.role?.toLowerCase().includes(q)
            );
        }
        this.filteredPartners = list;
    }

    onSearch(event: Event) {
        this.searchQuery = (event.target as HTMLInputElement).value;
        this.applyFilter();
    }

    approve(id: number) {
        this.actionId = id;
        this.http.post(`${this.apiUrl}/approve/${id}`, {}).subscribe({
            next: (res: any) => {
                this.toastr.success(res.message || 'Approved successfully');
                this.fetchAll();
                this.fetchStats();
                this.actionId = null;
            },
            error: () => {
                this.toastr.error('Failed to approve');
                this.actionId = null;
            }
        });
    }

    reject(id: number) {
        this.actionId = id;
        this.http.post(`${this.apiUrl}/reject/${id}`, {}).subscribe({
            next: (res: any) => {
                this.toastr.success(res.message || 'Rejected');
                this.fetchAll();
                this.fetchStats();
                this.actionId = null;
            },
            error: () => {
                this.toastr.error('Failed to reject');
                this.actionId = null;
            }
        });
    }

    viewDetails(partner: any) {
        this.selectedPartner = partner;
    }

    closeDetails() {
        this.selectedPartner = null;
    }

    parseAddress(json: string): any {
        try { return JSON.parse(json); }
        catch { return null; }
    }

    logout() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('isAdmin');
        this.toastr.success('Logged out', '', { timeOut: 1500 });
        this.router.navigate(['/login']);
    }
}
