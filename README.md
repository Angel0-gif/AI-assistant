# Assistant IA Perso

Application mobile (Ionic + Angular) avec backend Django REST Framework.
Deux fonctionnalités principales : **to-do list avec rappels** et **chat IA** (Gemini API, gratuit).

## Architecture

```
assistant-ia-perso/
├── backend/     Django REST Framework — API + proxy sécurisé vers Gemini
└── frontend/    Ionic + Angular — app mobile (Android/iOS/web)
```

La clé Gemini API reste **côté serveur uniquement** — jamais exposée au téléphone.

---

## 1. Backend (Django)

### Installation

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv requests dj-database-url psycopg2-binary
```

### Configuration

```bash
cp .env.example .env
```

Édite `.env` et remplis `GEMINI_API_KEY` :

1. Va sur https://aistudio.google.com/apikey
2. Crée une clé API gratuite (aucune carte bancaire requise)
3. Colle-la dans `.env` : `GEMINI_API_KEY=ta_cle_ici`

### Lancer le serveur

```bash
python manage.py migrate
python manage.py createsuperuser   # optionnel, pour l'admin Django
python manage.py runserver 0.0.0.0:8000
```

L'API est disponible sur `http://localhost:8000/api/`.

### Endpoints principaux

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/auth/register/` | Créer un compte |
| POST | `/api/auth/login/` | Se connecter (retourne access + refresh JWT) |
| POST | `/api/auth/login/refresh/` | Rafraîchir le token |
| GET/POST | `/api/tasks/` | Lister / créer une tâche |
| PATCH/DELETE | `/api/tasks/{id}/` | Modifier / supprimer une tâche |
| POST | `/api/tasks/{id}/toggle/` | Basculer fait/pas fait |
| POST | `/api/assistant/chat/` | Envoyer un message au chat IA |
| GET | `/api/assistant/conversations/` | Historique des conversations |

---

## 2. Frontend (Ionic + Angular)

### Installation

```bash
cd frontend
npm install
```

### Configuration

Vérifie `src/environments/environment.ts` — l'URL de l'API doit pointer vers ton backend :

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
};
```

⚠️ Si tu testes sur un **vrai téléphone** (pas un émulateur), remplace `localhost` par l'adresse IP locale de ton PC (ex. `http://192.168.1.42:8000/api`), sinon le téléphone ne pourra pas joindre ton serveur.

### Lancer en mode web (test rapide dans le navigateur)

```bash
npx ng serve -o
```

### Générer l'app mobile (Android)

```bash
npx ng build
npx cap add android
npx cap sync android
npx cap open android
```

Cela ouvre Android Studio — tu peux lancer directement sur un émulateur ou ton téléphone branché en USB (mode développeur activé).

### Pour iOS (nécessite un Mac + Xcode)

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

---

## 3. Déploiement en production (optionnel)

- **Backend** : Railway (Postgres géré) — configure les variables d'env (`DJANGO_SECRET_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`, `DEBUG=False`, `CORS_ALLOWED_ORIGINS`)
- **Frontend** : une fois buildé (`ng build`), tu génères l'APK/IPA via Android Studio / Xcode — l'app mobile n'a pas besoin d'hébergement web, juste que `environment.prod.ts` pointe vers l'URL Railway de ton backend

---

## Ce qui est déjà fait ✅

- Auth JWT complète (inscription, login, refresh automatique)
- CRUD des tâches (titre, description, priorité, échéance, rappel, statut fait/pas fait)
- Chat IA avec historique de conversation persistant en base
- UI Ionic native (tabs, swipe-to-delete, pull-to-refresh, modals)
- Stockage sécurisé des tokens via Capacitor Preferences (fonctionne offline-ready)

## Pistes d'amélioration futures 💡

- Notifications locales pour les rappels (`@capacitor/local-notifications`)
- Mode sombre
- Widget "suggestions IA" qui propose d'ajouter des tâches depuis le chat
- Synchronisation multi-appareils déjà native (grâce au backend centralisé)
"# AI_assistant" 
