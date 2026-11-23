# Chafafia — شفافية

Maquette cliquable d'une plateforme de transparence pour amicales et coopératives d'habitat au Maroc.

**Auteur : Aziz Mernissi**

## Ce que montre la maquette

Côté adhérent :
- tranches payées et restantes, avec reçu pour chaque paiement ;
- avancement du chantier, étape par étape, avec photos datées ;
- comptes de l'amicale (encaissé, dépensé, solde) et justificatifs ;
- documents officiels (titre foncier, autorisation de construire, PV).

Côté bureau :
- tableau de bord (taux de recouvrement, retards, caisse) ;
- liste des adhérents et relance WhatsApp des retards ;
- dépenses publiées avec justificatif ;
- liste d'attente datée.

Interface en français et en arabe (droite à gauche). Toutes les données sont fictives.

## Installation sur un VPS

Prérequis : nginx installé, et un enregistrement DNS de type A qui pointe le sous-domaine vers le serveur.

```bash
curl -fsSL https://raw.githubusercontent.com/abouali50/chafafia/main/deploy.sh | bash -s -- chafafia.exemple.com
```

Le script ajoute un seul fichier de site nginx et ne touche pas aux sites déjà en service. Relancer la même commande met la maquette à jour.

## Fichiers

- `index.html` — la maquette complète (un seul fichier, sans dépendance à installer)
- `deploy.sh` — script d'installation

© 2026 Aziz Mernissi
