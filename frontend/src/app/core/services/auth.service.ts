import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens } from '../models/models';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** true/false once known; null while we haven't checked storage yet */
  isAuthenticated = signal<boolean | null>(null);
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  private async restoreSession() {
    const { value } = await Preferences.get({ key: ACCESS_KEY });
    this.accessToken = value ?? null;
    this.isAuthenticated.set(!!value);
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    const { value } = await Preferences.get({ key: ACCESS_KEY });
    this.accessToken = value ?? null;
    return this.accessToken;
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: REFRESH_KEY });
    return value ?? null;
  }

  async register(username: string, email: string, password: string) {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/register/`, { username, email, password })
    );
    return this.login(username, password);
  }

  async login(username: string, password: string) {
    const tokens = await firstValueFrom(
      this.http.post<AuthTokens>(`${environment.apiUrl}/auth/login/`, { username, password })
    );
    await this.storeTokens(tokens);
    return tokens;
  }

  async refreshAccessToken(): Promise<string | null> {
    const refresh = await this.getRefreshToken();
    if (!refresh) return null;
    try {
      const res = await firstValueFrom(
        this.http.post<{ access: string }>(`${environment.apiUrl}/auth/login/refresh/`, { refresh })
      );
      this.accessToken = res.access;
      await Preferences.set({ key: ACCESS_KEY, value: res.access });
      return res.access;
    } catch {
      await this.logout();
      return null;
    }
  }

  private async storeTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access;
    await Preferences.set({ key: ACCESS_KEY, value: tokens.access });
    await Preferences.set({ key: REFRESH_KEY, value: tokens.refresh });
    this.isAuthenticated.set(true);
  }

  async logout() {
    this.accessToken = null;
    await Preferences.remove({ key: ACCESS_KEY });
    await Preferences.remove({ key: REFRESH_KEY });
    this.isAuthenticated.set(false);
  }
}
