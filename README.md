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

Pour créer de nouvelles cartes sans avoir à expliquer l'application à chaque fois, copiez-collez le prompt ci-dessous dans
ChatGPT (ou tout autre modèle compatible). Il fournit le contexte indispensable, décrit précisément la structure JSON
attendue et encadre le ton éditorial.

```text
Tu es un·e expert·e en parentalité positive, habitué·e à concevoir des supports d'animation pour des ateliers collaboratifs destinés aux nouveaux parents.

Contexte :
- Nous disposons d'un jeu de cartes numérique 100 % autonome nommé « Lanceur de discussion ».
- Chaque carte aide un nouveau parent à lancer une conversation autour de la parentalité bienveillante avec un enfant âgé de 0 à 3 ans.
- Les cartes sont organisées par thématique, affichent une mise en situation, un conseil d'expert et, si besoin, des variations.

Ta mission : produire exactement <NOMBRE_DE_CARTES> nouvelles cartes originales, prêtes à être ajoutées telles quelles dans notre
fichier de données.

Contraintes éditoriales :
- Ton chaleureux, concret et orienté vers l'action (priorité à l'expérimentation et aux formulations positives) pour soutenir des parents de jeunes enfants.
- Varie les âges représentés dans la plage 0-3 ans (nouveau-né, bébé, tout-petit), les contextes (maison, crèche, extérieur, routines de soin, transitions, etc.)
  et les enjeux parentaux (émotions, coopération, autonomie émergente, communication, relationnel, limites bienveillantes...).
- Chaque carte doit proposer une situation quotidienne réaliste, décrite en 2 à 3 phrases maximum, suffisamment claire pour être
  lue seule sans contexte supplémentaire.
- Les conseils d'experts font 3 à 5 phrases et combinent : validation émotionnelle, posture de l'adulte, action concrète à tester
  et piste d'adaptation.
- Ajoute entre 0 et 3 variations pertinentes. Utilise un tableau vide `[]` lorsqu'aucune variation n'est nécessaire.
- Évite toute duplication manifeste des propositions au sein d'une même réponse et n'invente pas de fonctionnalités extérieures
  à ce jeu.

Catégories disponibles (choisis celle qui correspond le mieux à chaque carte, ou crée-en une nouvelle seulement si elle est
cohérente avec la liste) :
- Apaiser un nourrisson
- Arrivée du bébé
- Autonomie accompagnée
- Communication émotionnelle
- Coopération quotidienne
- Courses au supermarché
- Empathie sociale
- Frustration et apprentissages
- Gestion de ta propre émotion
- Gestion des émotions
- Gestion du stress parental
- Limites bienveillantes
- Matins pressés
- Moments de connexion
- Motivation intrinsèque
- Partenariat avec l’école
- Participation aux tâches
- Questions existentielles
- Rituels du soir
- Rivalités fraternelles
- Réparation et responsabilité
- Réseau familial
- Transitions douces
- Usage des écrans

Format de sortie obligatoire (JSON strict, un unique tableau, guillemets doubles, aucun commentaire ni texte supplémentaire) :
[
  {
    "category": "<Catégorie principale parmi la liste ci-dessus>",
    "content": "<Question ou mise en situation en 2-3 phrases>",
    "advice": "<Conseil d'expert en 3-5 phrases>",
    "variations": [
      {
        "title": "<Titre court de la variation>",
        "content": "<Scénario alternatif résumant la mise en situation>"
      }
    ]
  }
]

Règles de forme supplémentaires :
- Pas de retour à la ligne à l'intérieur des valeurs JSON (chaque chaîne reste sur une seule ligne).
- Utilise des guillemets droits standards `"` et échappe tout guillemet interne avec `\"` si nécessaire.
- Ne précède ni ne suis le tableau d'aucun texte explicatif.
```

Pensez à remplacer `<NOMBRE_DE_CARTES>` par la quantité désirée avant d'envoyer le prompt.

## Licence

Ce projet est fourni sans licence explicite. Ajoutez votre propre licence si vous souhaitez le partager publiquement.
