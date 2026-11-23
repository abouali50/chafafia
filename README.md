# Chafafia — شفافية

Plateforme de transparence pour amicales et coopératives d'habitat au Maroc.

**Auteur : Aziz Mernissi**

## Ce que fait l'application

Côté adhérent :
- échéancier des tranches, montant payé et reste à payer ;
- reçu numéroté et imprimable pour chaque paiement ;
- avancement du chantier, étape par étape, avec photos datées ;
- comptes de l'amicale (encaissé, dépensé, solde) et justificatifs des dépenses ;
- documents officiels du projet et annonces du bureau.

Côté bureau :
- tableau de bord : taux de recouvrement, retards, caisse ;
- gestion des adhérents, création des accès, relance des retards par WhatsApp ;
- enregistrement des paiements avec numéro de reçu automatique ;
- dépenses avec justificatif, étapes du chantier, photos, documents, annonces ;
- liste d'attente datée, plusieurs projets, tranches en pourcentage du prix du lot.

Interface en français et en arabe (droite à gauche), sur téléphone et sur ordinateur.

## Technique

- Serveur Node.js 22 sans dépendance externe (`server.js`), base SQLite.
- Interface dans `public/` ; la maquette de démonstration reste disponible sur `/demo`.
- Mots de passe hachés (scrypt), sessions par cookie HttpOnly, journal des actions du bureau.
- Les données (base et fichiers envoyés) sont dans le dossier `data/`, jamais dans le dépôt.

## Installation sur un VPS

Prérequis : Docker, Caddy, et un enregistrement DNS de type A qui pointe le sous-domaine vers le serveur.

```bash
curl -fsSL https://raw.githubusercontent.com/abouali50/chafafia/main/deploy.sh | bash -s -- chafafia.exemple.com
```

Le script démarre l'application, vérifie qu'elle répond, puis ajoute un seul bloc au `Caddyfile`
(après sauvegarde, et avec retour en arrière si Caddy refuse). Il affiche un code d'installation
à saisir lors de la création du compte du bureau.

Relancer la même commande met l'application à jour ; la base est sauvegardée avant chaque mise à jour
dans `data/backups/`.

## Lancer en local

```bash
INSECURE_COOKIES=1 node server.js   # puis ouvrir http://localhost:3000
```

© 2026 Aziz Mernissi
