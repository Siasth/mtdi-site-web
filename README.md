# Site officiel du Ministère de la Transformation Digitale et de l'Innovation

Site web du MTDI -- République du Bénin.

Construit avec **Next.js 16**, **React 19**, **Tailwind CSS 4** et **TypeScript**.

---

## Prérequis

- **Node.js** 20 ou supérieur
- **npm** 10 ou supérieur

Vérifier l'installation :

```bash
node -v
npm -v
```

---

## Installation depuis le ZIP

1. **Télécharger** le fichier ZIP du projet et le décompresser :

```bash
unzip ministere-numerique-benin.zip
cd ministere-numerique-benin
```

2. **Installer les dépendances** :

```bash
npm install
```

3. **Créer le fichier d'environnement** `.env.local` à la racine du projet :

```
ADMIN_PASSWORD=votre_mot_de_passe_admin
```

Ce mot de passe protège l'accès au back-office (`/back-office-mtdi`).

---

## Lancer en développement

```bash
npm run dev
```

Le site est accessible sur **http://localhost:3000**.

---

## Construire pour la production

```bash
npm run build
```

Cette commande génère une version optimisée dans le dossier `.next/`.

---

## Démarrer en production

Après le build :

```bash
npm run start
```

Le site est accessible sur **http://localhost:3000** (port par défaut).

Pour changer le port :

```bash
PORT=8080 npm run start
```

---

## Déployer sur un serveur

### Option 1 : Vercel (recommandé)

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Importer le projet (ZIP ou dépôt Git)
3. Ajouter la variable d'environnement `ADMIN_PASSWORD` dans les paramètres du projet
4. Déployer

### Option 2 : VPS / serveur Linux

1. Copier le dossier du projet sur le serveur
2. Installer les dépendances et construire :

```bash
npm install
npm run build
```

3. Lancer avec un gestionnaire de processus (pm2) :

```bash
npm install -g pm2
pm2 start npm --name "mtdi" -- start
pm2 save
pm2 startup
```

Le site tourne en arrière-plan et redémarre automatiquement.

### Option 3 : Docker

Créer un `Dockerfile` à la racine :

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Puis :

```bash
docker build -t mtdi .
docker run -d -p 3000:3000 --env-file .env.local mtdi
```

---

## Structure du projet

```
app/                    Pages et composants
  components/           Composants partagés (Navbar, Footer, etc.)
  le-ministre/          Page biographie du Ministre
  actualites/           Page actualités
  documentheque/        Documents officiels
  galerie/              Albums photos Flickr
  videotheque/          Vidéothèque YouTube
  contact/              Page contact
  back-office-mtdi/     Interface d'administration
public/                 Images et fichiers statiques
data/                   Données JSON éditables via le back-office
```

---

## Back-office

Accessible sur `/back-office-mtdi`. Authentification par mot de passe défini dans `ADMIN_PASSWORD`.

Permet de modifier : le hero, les statistiques, la galerie et les actualités.
