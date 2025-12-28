import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../models/client.model';
import { MatIconModule } from '@angular/material/icon';
import { ClientService } from '../services/client.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})

export class HomePage {
  clients: Client[] = [];
  selectedClient: Client | null = null;
  clientForm: FormGroup;
  isEditing = false;
  editingClientId: number | null = null;

constructor (private clientService: ClientService, private fb: FormBuilder) {
  this.clientForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    job: ['', Validators.required],
    phone_number: ['', Validators.required],
    address: ['', Validators.required],
    status: ['עצמאי', Validators.required],
    hourly_rate: ['', [Validators.required, Validators.min(0)]],
  });
}

ngOnInit() {
  this.loadClients()
}

loadClients() {  
  this.clientService.getClients().subscribe({
    next: (data) => {
      this.clients = data;
    },
    error: (err) => console.log('Error fetching clients:', err)
    });
}

editClient(client: Client) {  
  this.isEditing = true;
  this.editingClientId = client.id!;

  // set the fields with the original values
  this.clientForm.patchValue({
    first_name: client.first_name,
    last_name: client.last_name,
    job: client.job,
    phone_number: client.phone_number,
    address: client.address,
    hourly_rate: client.hourly_rate,
    status: client.status
  });
}

deleteClient(client: Client) {
  const confirmDelete = confirm(`האם אתה בטוח שברצונך למחוק את ${client.first_name} ${client.last_name}?`);
  
  if (confirmDelete && client.id) {
    this.clientService.deleteClient(client.id).subscribe({
      next: () => {
        this.loadClients();
      },
      error: (err) => {
        console.error(err);
        alert('שגיאה במחיקת הלקוח');
      }
    });
  }
}

addHours(client: Client) {
  const hours = prompt(`כמה שעות להוסיף עבור ${client.first_name}?`);
  if (hours && !isNaN(Number(hours))) {
    this.clientService.addHours(client.id!, Number(hours), 'עבודה שוטפת').subscribe(() => {
      alert('השעות נוספו בהצלחה!');
      this.ngOnInit();
    });
  }
}

openAddModal() {
  this.isEditing = true;
  this.editingClientId = null; // מאפסים כדי שהמערכת תדע שזו הוספה
  this.clientForm.reset({ status: 'עצמאי' });
}

saveClient() {
  if (this.clientForm.valid) {
    const request = this.editingClientId 
      ? this.clientService.updateClient(this.editingClientId, this.clientForm.value)
      : this.clientService.createClient(this.clientForm.value);

    request.subscribe({
      next: () => {
        this.loadClients(); 
          alert(this.editingClientId ? 'הלקוח עודכן!' : 'לקוח חדש נוסף!');
        this.closeEditModal();
      },
      error: (err) => alert('פעולה נכשלה, בדוק חיבור לשרת')
    });
  }
}

closeEditModal() {
  this.isEditing = false;
  this.editingClientId = null;
  this.clientForm.reset({ status: 'עצמאי' });
}

openDetails(client: Client) {
  this.selectedClient = client;
}

closeDetails() {
  this.selectedClient = null;
}

}
