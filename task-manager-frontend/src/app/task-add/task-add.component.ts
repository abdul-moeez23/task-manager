import { Component } from '@angular/core';
import { TaskService, Task } from '../services/task.service';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CreateTaskDto } from '../models/task-dto';

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.css']
})
export class TaskAddComponent {
  task: Task = { title: '', description: '', status: 'Pending' };

  constructor(private taskService: TaskService, private router: Router) { }

  addTask(): void {
    if (!this.task.title) return alert('Title is required!');
    const doto: CreateTaskDto = {
      title: this.task.title,
      description: this.task.description,
    }

    this.taskService.addTask(doto).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        const titleError = err.error?.errors?.Title?.[0];
        alert(titleError ?? 'Failed to add task');
        console.error(err);
      }
    });
  }
}
