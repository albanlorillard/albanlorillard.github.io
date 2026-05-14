---
title: "Copilot : La fête est finie. 8 recommandations pour économiser des tokens !"
kind: "article"
date: "2026-05-14"
url: "/articles/copilot-economiser-tokens"
mediumUrl: "https://albanlorillard.medium.com/8-recommandations-pour-economiser-des-tokens-218d29fda7c1"
summary: "GitHub Copilot annonce un passage à une facturation au token. Voici 8 astuces pour moins en consommer."
tags: ["Artificial Intelligence", "Github Copilot", "OpenAI", "Claude", "Information Technology"]
group: "ia-fete-terminee"
---

![](https://miro.medium.com/v2/resize:fit:1400/1*pCBxcH0BP6gu4Qsl32zRew.png)

Alors que GitHub Copilot annonce un passage à une facturation à l'usage d'ici juin (au token consommé) et que les modèles, bien que plus performants, deviennent de plus en plus coûteux, adopter un usage économique et intelligent de l'IA devient indispensable. L'heure de l'expérimentation sans limite est révolue. Cet article vulgarise le fonctionnement des LLM sur le sujet de la consommation de tokens et propose une liste de bonnes pratiques pour réduire vos coûts. Ces méthodes favorisent également l'efficacité (moins d'hallucinations et d'allers-retours), tout en limitant l'empreinte énergétique dans les data centers.

Je ne traiterai pas ici des spécificités contractuelles de Copilot, mais de l'usage des tokens d'un point de vue généraliste.

## Tokens d'entrée, de sortie, de cache : comprendre la mécanique

### Qu'est-ce qu'un token ?

Le token est la plus petite unité linguistique utilisée par l'IA pour décomposer le langage, l'analyser et générer une réponse. Le site Tokenizer d'OpenAI permet de visualiser comment un prompt est segmenté selon les modèles GPT.

![https://platform.openai.com/tokenizer](https://miro.medium.com/v2/resize:fit:1400/1*cS2Mh14ggUZO3GxeKPrNGQ.png)

Attention : un même prompt n'équivaut pas au même nombre de tokens selon le modèle utilisé. En complément, le site Claude Tokenizer est également intéressant car il compare les modèles Claude avec ses concurrents.

![https://www.claudetokenizer.com/](https://miro.medium.com/v2/resize:fit:1400/1*24ddaKonJ0PVuo6Vgp_6mQ.png)

Plus concrètement, sur la page de comparaison des modèles d'Anthropic on s'aperçoit que pour 1 Million de Tokens, on peut caser environ 1 Millions de caractères de plus dans le context de Sonnet 4.6 versus celui d'Opus 4.7.

À retenir : pour un même prompt, plus un modèle est performant, plus il consomme de tokens.

### Les tokens d'entrée (Input Tokens)

On pourrait croire que seuls les mots tapés comptent. C'est faux. Vos tokens d'entrée regroupent l'intégralité du contexte envoyé au modèle :

- Votre prompt (la requête actuelle)
- Les instructions personnalisées (AGENTS.md, .instructions.md)
- L'historique de la conversation
- Le contexte implicite de l'IDE (fichiers ouverts, état Git, sélection)
- La sortie des outils (résultats du terminal, logs)

C'est assez intéressant d'ouvrir Copilot CLI sur une nouvelle session et de faire un `/context` :

![/context dans Copilot CLI sur une nouvelle session](https://miro.medium.com/v2/resize:fit:1400/1*9UVv8AnHaEgNJVKQBUiMaQ.png)

Selon votre configuration, le « ticket de départ » — c'est-à-dire le contexte déjà chargé avant le premier prompt — est plus ou moins volumineux. Ici, on part avec 70 000 tokens de contexte avant même d'avoir posé une question. C'est un signal d'alerte qui invite à revoir et optimiser sa configuration.

Si vous dépassez la limite de la fenêtre de contexte, il faudra compresser — et ça coûte. On y reviendra.

### Les tokens de sortie (Output Tokens)

Les tokens de sortie sont plus concrets : une fois le contexte envoyé au LLM, celui-ci produit du contenu, qui est lui aussi facturé (5x plus cher).

Vous avez donc :

- Les tokens de sortie pour le code modifié dans vos fichiers
- Les tokens de sortie pour la réponse produite en sortie de la console

Mais il y a une surprise : les tokens de réflexion sont également comptabilisés comme tokens de sortie. Ce sont les sorties visibles dans la console où l'on voit le modèle travailler, se poser des questions, raisonner… Nous verrons plus loin que les variantes « High » peuvent coûter cher pour cette raison.

### Les tokens et le cache

Les LLM n'ont aucune mémoire. À chaque interaction, l'intégralité du contexte est donc renvoyée au modèle :

1. Vous posez votre question → envoi de tout le contexte avec votre prompt
2. Votre agent lance une commande `ls` → renvoi de tout le contexte + le résultat de la commande
3. Votre agent lit un nouveau fichier → renvoi de tout le contexte + le contenu du fichier
4. Et ainsi de suite…

![Les sessions à rallonge et les inputs tokens](https://miro.medium.com/v2/resize:fit:1400/1*Ftg2848B4IrRGk4S2jNdpA.png)

C'est précisément pour ça que les fournisseurs ont mis en place du prompt caching : tant que le début de votre prompt reste strictement identique d'une requête à l'autre, cette portion peut être servie depuis un cache, à un tarif très réduit.

Côté OpenAI, le cache fonctionne automatiquement, sans aucun paramètre à activer, et sans surcoût. Réduction jusqu'à 90 % du coût des tokens d'entrée sur un cache hit.

Chez Anthropic, le mécanisme est très différent. Le cache doit être explicitement demandé par l'application qui appelle l'API. Anthropic facture l'écriture dans le cache (x1.25 par rapport à l'input token pour 5 min), mais la partie en cache sera facturée 90% moins cher lors des hits.

## Les bonnes pratiques à mettre en place dès maintenant

### 1 — Optimiser l'output des commandes CLI

C'est sûrement l'action la plus rapide et la plus efficace. [RTK](https://github.com/rtk-ai/rtk) et [Snip](https://edouard-claude.github.io/snip) reposent sur un principe très simple : s'intercaler entre vos commandes CLI habituelles et votre agent.

![https://github.com/rtk-ai/rtk](https://miro.medium.com/v2/resize:fit:1400/1*IvHCWIoYGhFKEcm5-c8l6A.png)

L'outil est livré avec une instruction à ajouter à votre agent pour lui signifier : « N'utilise plus les commandes par défaut, utilise celles de RTK. » Ainsi, l'agent ne fera plus de `ls` pour lister les fichiers d'un dossier, mais un `rtk ls`, dont la sortie est optimisée en tokens.

Si vous utilisez des outils pas encore pris en charge par ces CLI-proxy, rien ne vous empêche d'ajouter dans votre `package.json` des scripts optimisés pour l'IA.

### 2 — Optimiser vos Outputs avec une instruction globale

Il ne faut pas en abuser, et la garder simple, mais il est important d'en avoir une concise, car elle influencera l'ensemble de vos sessions futures. On parle ici d'une instruction générale (selon l'outil : `~/.config/opencode/AGENTS.md` pour OpenCode, `~/.copilot/copilot-instructions.md` pour Copilot…). Ce contexte est chargé à chaque prompt — ce sont donc des tokens d'entrée consommés d'office.

Voici un exemple :

> Style & Langue
> - Français. Direct, concis, sans fioriture ni emoji.
>
> Planification & Scope
> - Tâche complexe (>2 fichiers, archi, module) : plan via /plan + validation avant action.
> - Respect du scope : signale les problèmes connexes sans corriger.
>
> Git & Sécurité (Validation explicite)
> - Git : Pas d'auto-commit ni push.
> - Interdit : Déploiement (Terraform, Lambda, infra), API prod, suppression, irréversible.
>
> Décisions & Blocages
> - Ambiguïté technique : ne choisis pas, expose les options.
> - Échec : Stop après 2 tentatives. Explique : blocage, état actuel, essais réalisés.

Dès que vous le modifiez, gardez en tête le ratio : « Ce que ça va me coûter à chaque requête » vs « Le bénéfice sur un grand nombre de sessions ».

### 3 — Optimiser les outputs avec Caveman

[Caveman](https://github.com/JuliusBrussee/caveman) fonctionne sous forme d'une skill utilisable avec n'importe quel outil IA. Il transforme vos phrases en outputs plus ou moins condensés. Il existe plusieurs modes : « full », « ultra ».

![https://github.com/JuliusBrussee/caveman](https://miro.medium.com/v2/resize:fit:1400/1*79D2eCndvJTl8xMfn0krww.png)

Comme on a vu précédemment que l'historique de conversation était envoyé à chaque fois, cela permet donc d'optimiser votre contexte à chaque échange.

### 4 — Utiliser les bons modèles pour les bonnes tâches

C'est du bon sens, mais n'utilisez pas les modèles les plus puissants (Claude Opus en « High », GPT-5 en « Extra-High »…) pour tout et n'importe quoi.

Personnellement, mon terminal a toujours un onglet OpenCode ouvert sur Gemini Flash (en mode Low ou Medium), nommé « Q&A », pour des questions simples. Si votre prompt est précis, concis, délimité, sans fioriture et sans contexte externe, vous disposez d'une solution quasi gratuite.

**Méthodologie Architecte/Développeur**

À l'opposé, et contre-intuitivement, il vaut parfois mieux utiliser Claude Opus 4.6 pour préparer un plan précis lorsque la tâche est complexe, plutôt que de partir directement avec Claude Sonnet et devoir le corriger à tout bout de champ. C'est la stratégie de l'architecte (Opus) et du développeur exécutant (Sonnet).

**Socratic Prompting**

Ne sous-estimez pas le temps à investir dans la conception d'un plan. La méthode du « Socratic Prompting » consiste à demander à l'IA de vous interroger sans relâche jusqu'à atteindre une compréhension robuste et sans ambiguïté.

![Utilisation d'une skill type "Socratic Prompting" pour réaliser un plan.](https://miro.medium.com/v2/resize:fit:1400/1*mRcTmWAJhAGpSvCfTJbtfQ.png)

### 5 — Utiliser les bons variants au bon moment (high, extra-high, medium, low…)

Plus un variant est élevé, plus on lui demande de réfléchir, plus la réponse sera lente mais précise, et plus le contexte fourni en entrée sera exploité.

En mode « High », on consomme davantage de tokens de sortie, car ceux-ci se composent de deux éléments :

- La réponse effective qui s'affiche dans le terminal une fois la tâche accomplie
- Les tokens de réflexion, qui permettent de voir en direct ce que le LLM est en train de faire

Le rapport peut atteindre ×10 entre les tokens de sortie facturés en « Low » et en « High ». Le mode « Medium » offre souvent un bon équilibre.

### 6 — Des MCPs : oui, quand c'est nécessaire — et pas tous activés en même temps

Vos tokens d'entrée contiennent une partie « system prompt », envoyée à chaque message. Ce system prompt inclut le catalogue de vos MCPs avec leurs descriptions, leurs paramètres attendus… Plus vous avez d'outils activés, plus cette partie fixe sera volumineuse.

Pour désactiver :

- Sur Opencode : `/mcps` puis espace sur les mcps
- Sur Copilot CLI : `/mcp disable <service>`

### 7 — Compression, reprise de session, nouvelle conversation

La compression évite de dépasser le maximum de tokens en entrée en réalisant une synthèse du contexte accumulé. Elle se déclenche souvent automatiquement dans les outils (aux alentours de 80 %). On peut la déclencher manuellement avec `/compact`.

Pour réaliser cette synthèse, un appel à un LLM est nécessaire. Résultat : on paie des tokens d'entrée et de sortie à chaque compression.

La question à se poser est donc : « Dois-je démarrer une nouvelle session, ou le contexte accumulé jusqu'ici mérite-t-il d'être conservé ? »

Quelques exemples concrets :
- Plusieurs linters en échec : le contexte précédent ne me sert à rien. Je lance Claude Haiku dans une nouvelle session.
- Plan terminé, tests unitaires oubliés : le contexte est important, je continue la session.

Vous pouvez désactiver la compression automatique sur OpenCode :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "compaction": {
    "auto": false,
    "prune": true,
    "reserved": 10000
  }
}
```

### 8 — Utiliser du texte plutôt que des médias

Sans trop s'étendre : le texte sera toujours plus économique et plus précis qu'une image. Si vous êtes dans la vibe du « Mouth Coding » (coder à la voix), utilisez d'abord un outil de speech-to-text local comme [Handy](https://github.com/handy-ai/handy). Pour développer une maquette, préférez un MCP dédié (MCP Figma, par exemple).

## Conclusion

Finalement, ces évolutions de tarification devraient peut-être nous amener à réfléchir plus largement à notre usage quotidien de l'IA. Pourquoi faire tourner des data centers à plein régime pour tout et n'importe quoi ? Les conséquences environnementales, notamment sur la consommation d'eau et l'accaparement des ressources, doivent continuellement nous amener à nous interroger sur le quand et le pourquoi de l'usage de l'IA. Utilisez-la en conscience. Et la meilleure économie de tokens restera toujours le prompt que vous n'enverrez pas.

## Sources

- https://www.ionos.fr/digitalguide/sites-internet/developpement-web/les-token-ia/
- https://introl.com/fr/blog/prompt-caching-infrastructure-llm-cost-latency-reduction-guide-2025
- https://www.mindstudio.ai/blog/claude-code-effort-levels-explained
- https://docs.github.com/en/copilot/concepts/agents/copilot-cli/context-management
