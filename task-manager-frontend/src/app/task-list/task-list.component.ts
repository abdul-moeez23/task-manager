import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../services/task.service';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { FormsModule } from '@angular/forms';
import { BrregService } from '../services/brreg.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  organizationNumber = '';
  orgData: any = null;
  loadingOrg = false;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private toastr: ToastrService,
    private brregService: BrregService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
        if (err.status === 401) {
          alert('Session expired or unauthorized. Please login again.');
          localStorage.removeItem('jwtToken');
          this.router.navigate(['/login']);
        } else {
          alert('Could not fetch tasks. Check if Backend is running.');
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/login']);
    this.toastr.success('Logout successful', '', {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  deleteTask(id?: number): void {
    if (id && confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe(() => {
        this.loadTasks(); // Refresh list
      });
    }
  }

  editTask(id?: number): void {
    if (id) {
      this.router.navigate(['/edit', id]);
    }
  }

  searchOrganization(): void {
    if (!this.organizationNumber) {
      this.toastr.warning('Please enter an organization number');
      return;
    }

    const cleanOrgNumber = this.organizationNumber.replace(/\s/g, '');
    this.loadingOrg = true;
    this.orgData = null;

    this.brregService.getEnhet(cleanOrgNumber).subscribe({
      next: (enhetRes) => {
        this.brregService.getRoles(cleanOrgNumber).subscribe({
          next: (rolesRes) => {
            this.orgData = this.parseRoller(rolesRes);
            this.enrichWithEnhetData(enhetRes);
            this.fetchExternalAddresses();
            this.loadingOrg = false;
            this.toastr.success('Organization data loaded');
          },
          error: (err) => {
            console.warn('Roles not found or error:', err);
            this.orgData = this.parseRoller({});
            this.enrichWithEnhetData(enhetRes);
            this.loadingOrg = false;
            this.toastr.success('Organization data loaded');
          }
        });
      },
      error: (err) => {
        console.error('Error fetching org:', err);
        this.loadingOrg = false;
        this.toastr.error('Could not find organization');
      }
    });
  }

  private enrichWithEnhetData(enhet: any): void {
    if (!this.orgData) return;

    this.orgData.orgNumber = enhet.organisasjonsnummer ?
      enhet.organisasjonsnummer.match(/.{1,3}/g).join(' ') : '';

    if (enhet.forretningsadresse) {
      const addr = enhet.forretningsadresse;
      this.orgData.businessAddress = `${addr.adresse ? addr.adresse.join(', ') : ''}\n${addr.postnummer} ${addr.poststed}`;
      this.orgData.municipalityCountry = `${addr.kommune ? addr.kommune.toUpperCase() : ''}, ${addr.land ? addr.land : ''}`;
    }

    const orgFormMap: { [key: string]: string } = {
      'ASA': 'Public Limited Liability Company',
      'AS': 'Limited Liability Company',
      'ENK': 'Sole Proprietorship',
      'FLI': 'Association/Club/Organization'
    };
    this.orgData.orgForm = orgFormMap[enhet.organisasjonsform?.kode] || enhet.organisasjonsform?.beskrivelse || '';

    if (enhet.naeringskode1) {
      this.orgData.industryCode = `${enhet.naeringskode1.kode} ${enhet.naeringskode1.beskrivelse}`;
    }

    // Purpose (Vedtektsfestet formål)
    if (enhet.vedtektsfestetFormaal && enhet.vedtektsfestetFormaal.length > 0) {
      this.orgData.purpose = enhet.vedtektsfestetFormaal[0];
    }
  }

  private fetchExternalAddresses(): void {
    if (!this.orgData) return;

    if (this.orgData.auditor && this.orgData.auditor.orgNumber) {
      this.brregService.getEnhet(this.orgData.auditor.orgNumber).subscribe({
        next: (enhet) => {
          if (enhet.forretningsadresse) {
            const addr = enhet.forretningsadresse;
            this.orgData.auditor.address = `${addr.adresse ? addr.adresse[0] : ''}\n${addr.postnummer} ${addr.poststed}`;
          }
        }
      });
    }

    if (this.orgData.accountant && this.orgData.accountant.orgNumber) {
      this.brregService.getEnhet(this.orgData.accountant.orgNumber).subscribe({
        next: (enhet) => {
          if (enhet.forretningsadresse) {
            const addr = enhet.forretningsadresse;
            this.orgData.accountant.address = `${addr.adresse ? addr.adresse[0] : ''}\n${addr.postnummer} ${addr.poststed}`;
          }
        }
      });
    }
  }

  private parseRoller(data: any): any {
    const result: any = {
      generalManager: null,
      chairman: null,
      boardMembers: [],
      auditor: null,
      accountant: null,
      orgNumber: '',
      businessAddress: '',
      municipalityCountry: '',
      orgForm: '',
      industryCode: '',
      purpose: ''
    };

    if (!data.rollegrupper) return result;

    data.rollegrupper.forEach((group: any) => {
      group.roller.forEach((role: any) => {
        console.log('Role type code:', role.type.kode);
        const type = role.type.kode;
        const personName = role.person ?
          `${role.person.navn.fornavn} ${role.person.navn.mellomnavn || ''} ${role.person.navn.etternavn}`.replace(/\s+/g, ' ').trim() : null;
        const birthDate = role.person?.fodselsdato ? `(f. ${role.person.fodselsdato.split('-')[0]})` : '';

        const entityInfo = role.enhet ? {
          name: role.enhet.navn[0],
          orgNumber: role.enhet.organisasjonsnummer,
          address: role.enhet.forretningsadresse ?
            `${role.enhet.forretningsadresse.adresse[0]}, ${role.enhet.forretningsadresse.postnummer} ${role.enhet.forretningsadresse.poststed}` : 'N/A'
        } : null;

        if (type === 'DAGL') {
          result.generalManager = `${personName} ${birthDate}`.trim();
        } else if (type === 'LEDE') {
          result.chairman = `${personName} ${birthDate}`.trim();
        } else if (type === 'MEDL') {
          result.boardMembers.push(`${personName} ${birthDate}`.trim());
        } else if (type === 'REVI') {
          result.auditor = entityInfo;
        } else if (type === 'REGF') {
          result.accountant = entityInfo;
        }
      });
    });

    return result;
  }
}
