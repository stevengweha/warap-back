const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const users = [
  // Plusieurs posteurs
  {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    motDePasse: 'password123',
    telephone: '0600000001',
    adresse: '1 rue de Paris, 75000 Paris',
    role: 'posteur',
    bio: 'Développeur passionné, aime partager ses connaissances et aider les autres à progresser.',
    competences: { nodejs: true, react: false, gestion: true },
    photoProfil: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    nom: 'Durand',
    prenom: 'Paul',
    email: 'paul.durand@example.com',
    motDePasse: 'password789',
    telephone: '0600000004',
    adresse: '4 rue de Lille, 59000 Lille',
    role: 'posteur',
    bio: 'Bricoleur expérimenté, toujours prêt à relever de nouveaux défis.',
    competences: { bricolage: true, menuiserie: true },
    photoProfil: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  // Plusieurs chercheurs
  {
    nom: 'Martin',
    prenom: 'Claire',
    email: 'claire.martin@example.com',
    motDePasse: 'password456',
    telephone: '0600000002',
    adresse: '2 avenue de Lyon, 69000 Lyon',
    role: 'chercheur',
    bio: 'Designer UX/UI, passionnée par l\'expérience utilisateur et la création graphique.',
    competences: { figma: true, photoshop: true, sketch: true },
    photoProfil: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    nom: 'Bernard',
    prenom: 'Lucie',
    email: 'lucie.bernard@example.com',
    motDePasse: 'password321',
    telephone: '0600000005',
    adresse: '5 avenue de Bordeaux, 33000 Bordeaux',
    role: 'chercheur',
    bio: 'Étudiante motivée, recherche des missions pour financer ses études.',
    competences: { communication: true, organisation: true },
    photoProfil: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  // Admin
  {
    nom: 'Admin',
    prenom: 'Super',
    email: 'admin@example.com',
    motDePasse: 'adminpass',
    telephone: '0600000003',
    adresse: '3 boulevard de Nice, 06000 Nice',
    role: 'admin',
    bio: 'Administrateur du site, veille au bon fonctionnement de la plateforme.',
    competences: { gestion: true, securite: true },
    photoProfil: '',
  },
  // Utilisateurs supplémentaires pour enrichir les tests
  {
    nom: 'Petit',
    prenom: 'Sophie',
    email: 'sophie.petit@example.com',
    motDePasse: 'password654',
    telephone: '0600000006',
    adresse: '6 rue de Marseille, 13000 Marseille',
    role: 'chercheur',
    bio: 'Freelance en rédaction web, aime voyager et découvrir de nouveaux horizons.',
    competences: { redaction: true, seo: true },
    photoProfil: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    nom: 'Lefevre',
    prenom: 'Marc',
    email: 'marc.lefevre@example.com',
    motDePasse: 'password987',
    telephone: '0600000007',
    adresse: '7 avenue de Strasbourg, 67000 Strasbourg',
    role: 'posteur',
    bio: 'Entrepreneur dynamique, propose régulièrement des missions variées.',
    competences: { gestion: true, commerce: true },
    photoProfil: 'https://randomuser.me/api/portraits/men/3.jpg',
  }
];

async function seedUsers() {
  await User.deleteMany({});
  // Hashage des mots de passe avant insertion
  const usersHashed = await Promise.all(
    users.map(async user => ({
      ...user,
      motDePasse: await bcrypt.hash(user.motDePasse, 10)
    }))
  );
  const insertedUsers = await User.insertMany(usersHashed);
  console.log('Utilisateurs insérés !');
  return insertedUsers; // Retourne les utilisateurs insérés
}

module.exports = seedUsers;


