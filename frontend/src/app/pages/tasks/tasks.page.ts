import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/models';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule, IonicModule],
  templateUrl: './tasks.page.html',
})
export class TasksPage implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(true);

  newTitle = '';
  newPriority: Task['priority'] = 'medium';
  showAddForm = signal(false);

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.fetchTasks();
  }

  fetchTasks() {
    this.loading.set(true);
    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  handleRefresh(event: any) {
    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        event.target.complete();
      },
      error: () => event.target.complete(),
    });
  }

  addTask() {
    const title = this.newTitle.trim();
    if (!title) return;
    this.taskService.create({ title, priority: this.newPriority }).subscribe((task) => {
      this.tasks.update((list) => [task, ...list]);
      this.newTitle = '';
      this.newPriority = 'medium';
      this.showAddForm.set(false);
    });
  }

  toggleTask(task: Task) {
    // optimistic update
    this.tasks.update((list) =>
      list.map((t) => (t.id === task.id ? { ...t, is_done: !t.is_done } : t))
    );
    this.taskService.toggle(task.id).subscribe({
      error: () => this.fetchTasks(), // revert on failure
    });
  }

  deleteTask(task: Task) {
    this.tasks.update((list) => list.filter((t) => t.id !== task.id));
    this.taskService.delete(task.id).subscribe();
  }

  priorityColor(priority: Task['priority']): string {
    return { low: 'medium', medium: 'warning', high: 'danger' }[priority];
  }
}
