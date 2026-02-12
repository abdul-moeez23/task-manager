import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTaskDto, UpdateTaskDto } from '../models/task-dto'; // DTO import
export interface Task {
    id?: number;
    title: string;
    description: string;
    status: string;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = 'http://localhost:5124/api/Task'; // backend URL

    constructor(private http: HttpClient) { }

    getTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl);
    }

    getTask(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`);
    }

    addTask(taskDto: CreateTaskDto): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, taskDto);
    }

    updateTask(id: number, taskDto: UpdateTaskDto): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, taskDto);
    }

    deleteTask(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
