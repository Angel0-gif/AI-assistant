import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonicModule],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    if (!this.username || !this.password) return;
    if (this.password.length < 8) {
      this.errorMsg.set('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.register(this.username, this.email, this.password);
      this.router.navigateByUrl('/tabs/tasks', { replaceUrl: true });
    } catch {
      this.errorMsg.set("Impossible de créer le compte (nom d'utilisateur déjà pris ?).");
    } finally {
      this.loading.set(false);
    }
  }
}
