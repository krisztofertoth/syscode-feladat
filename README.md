# Diákok Kezelése

Egy egyszerű webalkalmazás diákok adatainak kezelésére, Angular frontend és Node.js backend használatával.

## Funkciók

- Diákok listázása
- Új diák hozzáadása
- Diák adatainak szerkesztése
- Diák törlése
- Admin bejelentkezés
- Címkezelő szolgáltatás integrációja

## Technológiák

- Frontend: Angular 19
- Backend: Node.js, Express
- Adatbázis: PostgreSQL
- Docker konténerizáció
- Material Design UI

## Telepítés

### Előfeltételek

- Node.js 18+
- Docker és Docker Compose
- Git

### Fejlesztői környezet indítása

1. Klónozza le a repository-t:
```bash
git clone https://github.com/yourusername/student-management.git
cd student-management
```

2. Indítsa el a Docker konténereket:
```bash
docker-compose up -d
```

3. Telepítse a frontend függőségeket:
```bash
cd frontend
npm install
```

4. Telepítse a backend függőségeket:
```bash
cd ../profile-service
npm install
```

5. Indítsa el a frontend alkalmazást:
```bash
cd ../frontend
ng serve
```

Az alkalmazás elérhető lesz a következő címen: http://localhost:4200

## Használat

### Alapértelmezett bejelentkezési adatok

- Felhasználónév: admin
- Jelszó: admin123

### Funkciók használata

1. **Diákok listázása**: A főoldalon megjelennek az összes diák adatai
2. **Új diák hozzáadása**: Kattintson az "Új diák" gombra
3. **Diák szerkesztése**: Kattintson a szerkesztés ikonra a megfelelő diák sorában
4. **Diák törlése**: Kattintson a törlés ikonra a megfelelő diák sorában
5. **Admin bejelentkezés**: Kattintson az "Admin bejelentkezés" gombra

## Fejlesztés

### Frontend fejlesztés

```bash
cd frontend
ng serve
```

### Backend fejlesztés

```bash
cd profile-service
npm run dev
```

## Tesztelés

### Frontend tesztek

```bash
cd frontend
ng test
```

### Backend tesztek

```bash
cd profile-service
npm test
```

## Licensz

MIT 