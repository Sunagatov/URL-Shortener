# Install

## Option 1 — copy files into repo root
Unzip this pack at the root of the `URL-Shortener` repository.

```bash
cd /path/to/URL-Shortener
unzip -o /path/to/url-shortener-ai-context-pack.zip -d .
chmod +x tools/ai-context.sh
```

## Option 2 — inspect before copying
```bash
unzip -l /path/to/url-shortener-ai-context-pack.zip
```

## After install
Examples:
```bash
./tools/ai-context.sh auth
./tools/ai-context.sh shorten
./tools/ai-context.sh infra
```

The script prints a compact context pack you can feed into an AI coding session instead of letting the tool rescan the whole repo.
