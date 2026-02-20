import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BrregService } from '../services/brreg.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Ensure HttpClient is available if standalone
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Add FormsModule
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  showCreditModal = false;
  isOrgBold = false;
  loading = false;
  username = '';

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'User';
  }

  // Initialize form data model
  formData: any = {
    country: 'Norway', // Default to Norway since BRREG is Norwegian
    orgNumber: '',
    crNumber: '',
    companyName: '',
    registrationDate: '',
    foundationDate: '',
    employees: null,
    bankruptcy: 'No',
    generalManager: '',
    companyPhone: '',
    email: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    industry: '',
    parentCustomer: '',
    accountant: '',
    department: '',
    lineOfBusiness: '',
    productServiceDetails: '',
    turnoverCurrency: 'NOK',
    turnoverAmount: null,
    majorCustomers: '',

    // Business Address
    businessAddress: {
      addressLine: '',
      houseNumber: '',
      building: '', // Not always directly available
      zipCode: '',
      state: '',
      city: '',
      country: '',
      municipality: ''
    },

    // Postal Address
    postalAddress: {
      addressLine: '',
      houseNumber: '',
      building: '',
      zipCode: '',
      state: '',
      city: '',
      poBox: '',
      country: ''
    },

    role: 'No Role',
    agreedToTerms: false
  };

  private apiUrl = environment.apiUrl + '/BusinessPartner';

  constructor(
    public router: Router,
    private authService: AuthService,
    private brregService: BrregService, // Inject BRREG Service
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openCreditModal() {
    this.showCreditModal = true;
  }

  closeCreditModal() {
    this.showCreditModal = false;
  }

  onOrgInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    this.formData.orgNumber = value;
    this.isOrgBold = value.length > 0;

    // Auto-search when length is 9 (standard Norwegian org number length)
    if (value.length === 9) {
      this.fetchBrregData(value);
    }
  }

  fetchBrregData(orgNumber: string) {
    this.brregService.getEnhet(orgNumber).subscribe({
      next: (enhet) => {
        // Map Basic Info
        this.formData.companyName = enhet.navn;
        this.formData.registrationDate = enhet.registreringsdatoEnhetsregisteret;
        this.formData.foundationDate = enhet.stiftelsesdato;
        this.formData.employees = enhet.antallAnsatte;
        this.formData.bankruptcy = enhet.konkurs ? 'Yes' : 'No';

        // Map Industry
        if (enhet.naeringskode1) {
          // Simple mapping or just text
          this.formData.industry = enhet.naeringskode1.beskrivelse;
        }

        // Map Business Address
        if (enhet.forretningsadresse) {
          const addr = enhet.forretningsadresse;
          this.formData.businessAddress.addressLine = addr.adresse ? addr.adresse[0] : '';
          this.formData.businessAddress.zipCode = addr.postnummer;
          this.formData.businessAddress.city = addr.poststed;
          this.formData.businessAddress.country = addr.land;
          this.formData.businessAddress.municipality = addr.kommune;
          // default country select if match found
          if (addr.land === 'Norge') this.formData.country = 'Norway';
        }

        // Map Postal Address
        if (enhet.postadresse) {
          const pAddr = enhet.postadresse;
          this.formData.postalAddress.addressLine = pAddr.adresse ? pAddr.adresse[0] : '';
          this.formData.postalAddress.zipCode = pAddr.postnummer;
          this.formData.postalAddress.city = pAddr.poststed;
          this.formData.postalAddress.country = pAddr.land;
        }

        // Fetch Roles for General Manager
        this.brregService.getRoles(orgNumber).subscribe({
          next: (roles) => {
            this.parseRoles(roles);
          },
          error: (err) => console.log('Roles fetch error', err)
        });

      },
      error: (err) => {
        console.error('Error fetching org data', err);
      }
    });
  }

  parseRoles(data: any) {
    if (!data.rollegrupper) return;

    // Look for General Manager (DAGL)
    data.rollegrupper.forEach((group: any) => {
      group.roller.forEach((role: any) => {
        if (role.type.kode === 'DAGL') {
          const person = role.person;
          if (person) {
            this.formData.generalManager = `${person.navn.fornavn} ${person.navn.etternavn}`;
          }
        }
      });
    });
  }

  onFileChange(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      this.formData[type + 'File'] = file;
    }
  }

  async onSubmit(form: any) {
    // PREVENT SUBMISSION IF FORM IS INVALID
    if (form.invalid) {
      // Mark all fields as touched to trigger inline error messages
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return; // STOP! Do not post to database
    }

    // EXTRA SECURITY: Check if mandatory files are uploaded
    if (!this.formData.vatFile || !this.formData.crFile) {
      return; // STOP!
    }

    this.loading = true;

    // Convert addresses to JSON strings for backend
    const submissionData = {
      ...this.formData,
      businessAddressJson: JSON.stringify(this.formData.businessAddress),
      postalAddressJson: JSON.stringify(this.formData.postalAddress)
    };

    this.http.post(`${this.apiUrl}/register`, submissionData).subscribe({
      next: (res: any) => {
        this.loading = false;
        alert(res.message || 'Registration submitted successfully!');
        // Optionally clear form here if needed
      },
      error: (err) => {
        this.loading = false;
        console.error('Submission error', err);
        const errorMsg = typeof err.error === 'string' ? err.error : 'Failed to submit registration.';
        alert(errorMsg);
      }
    });
  }
}
