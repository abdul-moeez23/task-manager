import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService, Task } from '../services/task.service';
import { UpdateTaskDto } from '../models/task-dto';


@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.css'
})
export class TaskEditComponent implements OnInit {
  task: Task = {
    title: '',
    description: '',
    status: 'Pending'
  };
  id!: number;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.taskService.getTask(this.id).subscribe((data) => {
        this.task = data;
      });
    }
  }

  updateTask(): void {

    if (!this.task.title) return alert('Title is required!');
    const dto: UpdateTaskDto = {
      title: this.task.title,
      description: this.task.description,
      status: this.task.status
    }

    this.taskService.updateTask(this.id, dto).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
