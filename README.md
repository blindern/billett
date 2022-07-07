# UKA på Blindern's ticket system (frontend)

More details about this system is available at:
https://github.com/blindernuka/billett

## Development

```bash
npm ci
BACKEND_URL=https://billett.blindernuka.no/ npm run dev
```

Open http://localhost:3000/

## Deploy to production

As of July 2022 this is done manually.

See https://github.com/blindern/drift/tree/master/ansible/roles/service-uka-billett
for more details.
