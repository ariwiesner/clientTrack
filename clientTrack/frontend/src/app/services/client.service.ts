import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://127.0.0.1:8000/api/clients/';

  constructor(private http: HttpClient) { }
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  createClient(clientData: any): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  addHours(clientId: number, hours: number, description: string) {
    const payload = { 
        client: clientId, 
        hours: hours, 
        description: description 
    };
    return this.http.post('http://127.0.0.1:8000/api/time-entries/', payload);
  }

updateClient(id: number, clientData: any): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}${id}/`, clientData);
  }
}