import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonicModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  username = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.login(this.username, this.password);
      this.router.navigateByUrl('/tabs/tasks', { replaceUrl: true });
    } catch {
      this.errorMsg.set('Identifiants incorrects. Réessaie.');
    } finally {
      this.loading.set(false);
    }
  }
}
