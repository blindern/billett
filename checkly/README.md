# Checkly

Monitoring for billett.blindernuka.no.

Useful resources:

- https://www.checklyhq.com/docs/cli/
- https://checklyhq.com/docs
- https://www.checklyhq.com/docs/cli/npm-packages/

## Testing locally

```bash
pnpm install

pnpm checkly login

# Run tests.
pnpm checkly test
```

## Deploying changes

Automatically done when pushed to `main`.

Manual deploy:

```bash
pnpm checkly deploy
```
