# Lanceur de discussion

Bienvenue dans le jeu de cartes interactif pensé pour animer des ateliers autour de la parentalité positive.
Cette application web en français permet de tirer des questions inspirantes, de consulter des recommandations d'experts
et de personnaliser vos sessions en fonction des thématiques qui vous intéressent.

## Fonctionnalités principales

- **Pioche animée** : cliquez sur le tas de cartes ou sur le bouton "Nouvelle carte" pour révéler aléatoirement une situation de discussion. Chaque carte affiche sa catégorie et, le cas échéant, une étiquette de variante pour varier les mises en situation.
- **Sélection des thématiques** : choisissez précisément les catégories de cartes que vous souhaitez garder dans votre partie via la fenêtre de sélection dédiée. Les compteurs et le paquet sont automatiquement réinitialisés selon vos choix.
- **Conseils d'experts** : ouvrez la fenêtre "💡" pour afficher des recommandations détaillées liées à la carte tirée (situation, conseils, suivi de la maîtrise du principe).
- **Suivi de progression** : indiquez si vous maîtrisez un principe pour retirer ses variantes du paquet et recevoir un message de confirmation. Les cartes restantes sont mises à jour en conséquence.
- **Sauvegarde et reprise de session** : exportez l'état de votre partie dans un fichier JSON et rechargez-le plus tard pour reprendre exactement où vous vous étiez arrêté, y compris vos thématiques actives et principes maîtrisés.
- **Accessibilité et confort d'utilisation** : l'interface réagit au clavier, annonce les changements importants aux lecteurs d'écran et propose des animations légères (particules flottantes, flip de carte) pour renforcer l'immersion.

## Structure du projet

```
.
├── card_discussion.html   # Page principale de l'application
├── card_discussion.css    # Styles, animations et mise en page responsive
├── card_discussion.js     # Logique du jeu, gestion des cartes, modales et persistance
├── cards_data.js          # Contenu éditable des cartes et de leurs variantes
└── README.md              # Vous êtes ici
```

Les données des cartes sont isolées dans `cards_data.js` (un simple tableau JavaScript), tandis que `card_discussion.js` se
charge de transformer ces définitions en cartes jouables (variantes incluses) et de piloter toutes les interactions.

## Démarrage rapide

1. Téléchargez ou clonez ce dépôt sur votre machine.
2. Ouvrez `card_discussion.html` dans votre navigateur préféré (double-clic ou glisser-déposer dans une fenêtre ouverte).
3. Activez le son si vous avez ajouté un fond sonore et profitez du jeu !

Aucune dépendance externe ni serveur n'est requis : tout fonctionne en local grâce au HTML, CSS et JavaScript natifs.

## Personnalisation

- Ajoutez de nouvelles cartes en éditant `cards_data.js` (catégorie, contenu, conseil, variations optionnelles).
- Modifiez les couleurs, les animations ou la typographie dans `card_discussion.css` pour adapter l'ambiance à votre atelier.
- Faites évoluer la logique (nouveaux filtres, modes de jeu, statistiques, etc.) dans `card_discussion.js`.

## Prompt recommandé pour générer de nouvelles cartes avec ChatGPT

Pour obtenir rapidement de nouveaux scénarios cohérents avec l'application, vous pouvez copier-coller ce prompt dans ChatGPT.
Il contextualise l'outil, rappelle la structure attendue et propose des consignes éditoriales pour obtenir des cartes variées
et exploitables immédiatement :

```text
Tu es un·e expert·e en parentalité positive et en animation d'ateliers collaboratifs.
Ta mission : proposer __{{nombre_de_cartes}}__ nouvelles cartes pour notre jeu "Lanceur de discussion".

Contraintes :
- Vise un public de parents ou accompagnant·es d'enfants de 2 à 12 ans.
- Utilise un ton bienveillant, concret et orienté vers l'action.
- Mets l'accent sur des situations du quotidien qui ouvrent la discussion (gestes, paroles, émotions).
- Varie les thématiques (gestion des émotions, coopération, communication, autonomie, etc.).
- Lorsque c'est pertinent, ajoute 1 à 3 variations par carte pour explorer d'autres contextes similaires.

Format de sortie obligatoire (JSON compatible avec `cards_data.js`) :
[
  {
    "category": "<Catégorie principale>",
    "content": "<Question ou mise en situation pour lancer la discussion>",
    "advice": "<Conseil d'expert synthétique en 3 à 5 phrases>",
    "variations": [
      {
        "title": "<Titre court de la variation>",
        "content": "<Mise en situation alternative>"
      }
    ]
  }
]

Rappelle-toi :
- Chaque `content` doit pouvoir se lire seul et tenir en 2 ou 3 phrases.
- Les conseils doivent proposer une posture + une action concrète.
- Si une carte n'a pas de variation utile, renvoie un tableau vide pour `variations`.
- Évite les doublons avec les cartes existantes (tu peux inventer de nouvelles situations).
```

Adaptez librement les contraintes (public, âge, nombre de cartes, tonalité) avant d'envoyer le prompt selon vos besoins.

## Licence

Ce projet est fourni sans licence explicite. Ajoutez votre propre licence si vous souhaitez le partager publiquement.
