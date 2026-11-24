# Site Pole Racer — mise en ligne et mises à jour

Site statique (aucun serveur, aucune base de données) + interface d'édition `/admin`.
Coût : 0 € pour le site ; seul le nom de domaine pole-racer.com est payant (environ 10 à 15 €/an).

## 1. Mettre en ligne

1. Le dépôt GitHub `capitaincompote-blip/pole-racer` contient le site (déjà configuré dans `admin/config.yml`).
2. **Cloudflare Pages** : Workers & Pages → Create → Pages → « Connect to Git » → choisir ce dépôt. Commande de build : aucune. Dossier de sortie : `/` (racine).
3. **Nom de domaine** : acheter `pole-racer.com` (OVH, Gandi, Cloudflare Registrar…). Dans Cloudflare Pages → projet → « Custom domains » → ajouter `pole-racer.com` et suivre les instructions DNS. Le HTTPS est automatique.

## 2. Mettre à jour le site

1. Aller sur **https://pole-racer.com/admin/**
2. Se connecter avec un jeton d'accès personnel GitHub : GitHub → Settings → Developer settings → Fine-grained tokens, limité au dépôt `pole-racer`, droit « Contents : Read and write ».
3. Ouvrir « Contenu du site » : ajouter une actu, une capture d'écran, une vidéo YouTube, un lien.
4. Cliquer sur **Publier**. Le site se met à jour en 1 à 2 minutes.

## 3. Ce qui se modifie où

| Élément | Où |
|---|---|
| Textes, actus, galerie, vidéos, liens | `/admin` (interface) |
| Textes fixes (menu, boutons, titres de sections) | `content/ui.json` |
| Images envoyées | `images/uploads/` (automatique) |
| Apparence (couleurs, polices) | `style.css` |

La galerie et la section Vidéos n'apparaissent que lorsqu'elles contiennent au moins un élément.

## 4. Langues (français, anglais, allemand, espagnol, arabe, italien)

- Le site détecte la langue du navigateur, et le visiteur peut en changer avec le menu en haut à droite (son choix est mémorisé). Lien direct vers une langue : `pole-racer.com/?lang=en`.
- Dans `/admin`, chaque champ traduisible a des onglets de langue. Le français est la référence : si un champ est vide dans une langue, le site affiche la version française.
- Les galeries et vidéos sont communes à toutes les langues (la légende ou le titre ne se traduit pas : préférer un texte court et neutre).
- L'arabe s'affiche de droite à gauche automatiquement.
- Pour ajouter une langue : l'ajouter dans `admin/config.yml` (`locales`), dans `LANGS` et `NAMES` de `app.js`, et dans `content/ui.json`.
