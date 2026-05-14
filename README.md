# albanlorillard.fr

Portfolio personnel — articles, talks et notes de terrain.

Site : https://www.albanlorillard.fr

## Stack

- [Astro](https://astro.build) — générateur de site statique
- TypeScript strict
- Biome — lint & format
- GitHub Pages — hébergement

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npm run check` | Validation TypeScript/Astro |
| `npm run lint` | Lint Biome |
| `npm run format` | Format Biome |

## Ajouter un article Medium

1. Créer `src/content/items/<slug>.md` avec ce contenu :

```yaml
---
title: "Titre de l'article"
kind: "article"
date: "2026-01-01"
url: "https://medium.com/@albanlorillard/slug-de-l-article"
summary: "Résumé court affiché sur le portfolio."
tags: ["tag1", "tag2"]
---
```

2. Commit et push sur `main` → déploiement automatique.

## Ajouter une présentation RevealJS

1. Copier le dossier généré dans `public/slides/<slug>/`
2. Créer `src/content/items/<slug>.md` avec ce contenu :

```yaml
---
title: "Titre de la présentation"
kind: "talk"
date: "2026-01-01"
url: "/slides/<slug>/presentation.html"
summary: "Résumé court affiché sur le portfolio."
tags: ["tag1", "tag2"]
---
```

3. Commit et push sur `main` → déploiement automatique.

## Licence

Public domain — faites-en ce que vous voulez.
