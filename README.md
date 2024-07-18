# Billettsystemet til UKA på Blindern

https://billett.blindernuka.no

## Kort om systemet

- Betalingsløsning integrert med Vipps Checkout
- Kjøp av ett-og-ett arrangement (ingen handlekurv på tvers av arrangementer)
- Billetter mottas som PDF på e-post og fremvises ved inngang
- Strekkodescanner ved inngang for enkel validering og registrering av billetter
- Salg av løse billetter, f.eks. i billettskranke eller på stand

## Historie

Det ble tatt initiativ til å lage et eget billettsystem til UKA på Blindern 2011,
da vi ønsket en rimeligere og mer integrert løsning enn det som var alternativene.
I slutten av november/starten av desember 2010 begynte arbeidet med billettsystemet,
og det ble satt i drift tidlig januar 2011. Det samme systemet ble benyttet igjen i 2013.
For festivalen i 2015 ble systemet skrevet på nytt som en separat løsning,
og det er dette systemet som finnes her.

Systemet er utviklet av Henrik Steen som også vedlikeholder det ved behov.

## Tekniske detaljer

Systemet bruker [Laravel](https://laravel.com/)-rammeverket som backend i
kombinasjon med en selvstendig frontend-applikasjon.

[Mer teknisk dokumentasjon](docs/index.md)

## Produksjon

Systemet deployes automatisk for hvert bygg på `main`. Se GitHub Action og
https://github.com/blindern/drift/tree/master/ansible/roles/service-uka-billett

Ev. nye databasemigrasjoner må kjøres manuelt:

```bash
ssh root@fcos-1.nrec.foreningenbs.no
docker exec -t uka-billett-fpm ./artisan migrate
```

## Lokal utvikling

For å gjøre lokal utvikling trenger du:

- Docker
- PHP 8.3+ med Composer
- Node.js 18+

### Kjøre backend lokalt

1. Start databasen i egen terminal:

   ```bash
   docker compose up database phpmyadmin
   ```

1. Så i backend-mappa:

   ```bash
   cd backend
   ```

1. Installer/oppdater avhengigheter:

   ```bash
   composer install
   ```

1. Kjør migrasjoner:

   ```bash
   php artisan migrate
   ```

1. Seed databasen med testdata:

   ```bash
   php artisan db:seed

1. Start backend:

   ```bash
   php artisan serve --port 8081
   ```

1. Du skal nå kunne nå f.eks. http://localhost:8081/api/me

### Kjøre frontend lokalt

1. ```bash
   cd frontend
   ```

2. Installer/oppdater avhengigheter:

   ```bash
   npm ci
   ```

3. Kjør lokal server

   ```bash
   npx ng serve --port 3000 --open
   ```

   Denne går mot lokal backend som standard.
   For å gå mot produksjon kan man kjøre følgende i nettleser-konsollen (og oppdater siden):

   ```js
   localStorage.setItem("billett-baseurl", "https://billett.blindernuka.no/")
   ```

   Og for å endre tilbake:

   ```js
   localStorage.removeItem("billett-baseurl")

### phpMyAdmin

Kan brukes for å enkelt se og gjøre manuelle endringer i den lokale databasen.

http://localhost:8080/
