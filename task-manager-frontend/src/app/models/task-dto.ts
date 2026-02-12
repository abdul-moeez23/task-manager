// src/app/models/task-dto.ts
export interface CreateTaskDto {
    title: string;
    description?: string;
}

export interface UpdateTaskDto {
    title: string;
    description?: string;
    status: string;
}
