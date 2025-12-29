import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../models/client.model';
import { MatIconModule } from '@angular/material/icon';
import { ClientService } from '../services/client.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, FormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  clients: Client[] = [];
  selectedClient: Client | null = null;
  clientForm: FormGroup;
  isEditing = false;
  editingClientId: number | null = null;
  isAddTimeModalOpen = false;
  hoursToAdd: number = 0;
  selectedSystemId: number | null = null;
  allSystems: any[] = [];
  newSystemName: string = '';

  constructor(private clientService: ClientService, private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      full_name: ['', Validators.required],
      job: ['', Validators.required],
      phone_number: ['', Validators.required],
      address: ['', Validators.required],
      status: ['עצמאי', Validators.required],
      hourly_rate: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadAllSystems();
  }

  loadAllSystems() {
    this.clientService.getAllSystems().subscribe((data) => {
      this.allSystems = data;
    });
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (err) => console.log('Error fetching clients:', err),
    });
  }

  openAddClientPanel() {
    this.isEditing = true;
    this.editingClientId = null;
    this.clientForm.reset({ status: 'עצמאי' });
  }

  saveClient() {
    if (this.clientForm.valid) {
      const request = this.editingClientId
        ? this.clientService.updateClient(this.editingClientId, this.clientForm.value)
        : this.clientService.createClient(this.clientForm.value);

      request.subscribe({
        next: () => {
          alert(this.editingClientId ? 'הלקוח עודכן!' : 'לקוח חדש נוסף!');
          this.loadClients();
          this.closeEditPanel();
        },
        error: (err) => alert('פעולה נכשלה, בדוק חיבור לשרת'),
      });
    }
  }

  editClient(client: Client) {
    this.isEditing = true;
    this.editingClientId = client.id!;

    // set the fields with the original values
    this.clientForm.patchValue({
      full_name: client.full_name,
      job: client.job,
      phone_number: client.phone_number,
      address: client.address,
      hourly_rate: client.hourly_rate,
      status: client.status,
    });
  }

  closeEditPanel() {
    this.isEditing = false;
    this.editingClientId = null;
    this.clientForm.reset({ status: 'עצמאי' });
  }

  deleteClient(client: Client) {
    const confirmDelete = confirm(`האם אתה בטוח שברצונך למחוק את ${client.full_name}?`);

    if (confirmDelete && client.id) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (err) => {
          console.error(err);
          alert('שגיאה במחיקת הלקוח');
        },
      });
    }
  }

  getSystemColor(systemName: string): string {
    if (!systemName) return '#f1f3f5';

    let hash = 0;
    for (let i = 0; i < systemName.length; i++) {
      hash = systemName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 90%)`;
  }

  getSystemTextColor(systemName: string): string {
    if (!systemName) return '#495057';

    let hash = 0;
    for (let i = 0; i < systemName.length; i++) {
      hash = systemName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 60%, 30%)`;
  }

  addNewSystem() {
    if (!this.newSystemName || !this.selectedClient) {
      alert('נא להזין שם למערכת');
      return;
    }

    this.clientService.createSystem(this.newSystemName, this.selectedClient.id!).subscribe({
      next: (newSystem) => {
        if (!this.selectedClient?.systems) {
          this.selectedClient!.systems = [];
        }
        this.selectedClient!.systems.push(newSystem);
        this.selectedSystemId = newSystem.id;
        this.newSystemName = '';
        alert('המערכת נוספה בהצלחה!');
      },
      error: (err) => alert('שגיאה בהוספת המערכת. יכול להיות שכבר קיימת מערכת עם השם הזה?'),
    });
  }

  openAddTimePanel(client: Client) {
    this.selectedClient = client;
    this.isAddTimeModalOpen = true;
    this.hoursToAdd = 0;
    this.selectedSystemId = null;
  }

  closeAddTimePanel() {
    this.isAddTimeModalOpen = false;
    this.selectedClient = null;
  }

  confirmAddHours() {
    if (this.hoursToAdd <= 0 || !this.selectedClient) return;

    const now = new Date();
    const startTime = new Date(now.getTime() - this.hoursToAdd * 60 * 60 * 1000);
    const payload = {
      client: this.selectedClient.id,
      system: this.selectedSystemId,
      start_time: startTime.toISOString(),
      end_time: now.toISOString(),
      is_billed: false,
    };

    this.clientService.addTimeEntry(payload).subscribe({
      next: () => {
        this.closeAddTimePanel();
        alert('השעות נוספו למערכת!');
        this.loadClients();
      },
      error: (err) => alert('שגיאה בשמירת השעות'),
    });
  }

  openDetails(client: Client) {
    this.selectedClient = client;
  }

  closeDetails() {
    this.selectedClient = null;
  }
}
