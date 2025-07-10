const Job = require('../models/Job');

const jobsData = [
  {
    titre: 'Livraison de courses',
    description: 'Livrer des courses à domicile pour des personnes âgées ou occupées. Véhicule non fourni.',
    categorie: 'Livraison',
    localisation: 'Paris',
    statut: 'ouverte',
    remuneration: 30,
    dateMission: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    competencesRequises: ['ponctualité', 'organisation']
  },
  {
    titre: 'Montage meuble',
    description: 'Monter une étagère IKEA et fixer au mur. Outils à apporter.',
    categorie: 'Bricolage',
    localisation: 'Lyon',
    statut: 'ouverte',
    remuneration: 45,
    dateMission: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    competencesRequises: ['bricolage', 'menuiserie']
  },
  {
    titre: 'Jardinage',
    description: 'Tondre la pelouse, tailler les haies et ramasser les feuilles.',
    categorie: 'Jardinage',
    localisation: 'Bordeaux',
    statut: 'ouverte',
    remuneration: 25,
    dateMission: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    competencesRequises: ['jardinage', 'soin des plantes']
  },
  {
    titre: 'Aide déménagement',
    description: 'Aider à porter des cartons et démonter des meubles. Bonne condition physique requise.',
    categorie: 'Déménagement',
    localisation: 'Lille',
    statut: 'ouverte',
    remuneration: 60,
    dateMission: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    competencesRequises: ['force', 'organisation']
  }
];

function generateJobId(index) {
  return `JOB${(index + 1).toString().padStart(4, '0')}`;
}

async function seedJobs(users) {
  await Job.deleteMany({});
  const posteurs = users.filter(u => u.role === 'posteur');
  let jobs = [];

  // Attribution aléatoire des jobs aux posteurs pour plus de diversité
  let jobIndex = 0;
  for (let i = 0; i < jobsData.length; i++) {
    const posteur = posteurs[Math.floor(Math.random() * posteurs.length)];
    const jobData = jobsData[i];
    const job = {
      ...jobData,
      userId: posteur._id,
      jobId: generateJobId(jobIndex)
    };
    jobs.push(job);
    jobIndex++;
  }

  // Chaque posteur crée aussi un job personnalisé
  posteurs.forEach((posteur, idx) => {
    jobs.push({
      titre: `Mission personnalisée de ${posteur.prenom}`,
      description: `Besoin d'aide pour une tâche spécifique à ${posteur.adresse.split(',')[1] || 'sa ville'}.`,
      categorie: 'Autre',
      localisation: posteur.adresse.split(',')[1] || 'France',
      statut: 'ouverte',
      remuneration: 35 + idx * 5,
      dateMission: new Date(Date.now() + (idx + 2) * 24 * 60 * 60 * 1000),
      competencesRequises: ['polyvalence'],
      userId: posteur._id,
      jobId: generateJobId(jobIndex)
    });
    jobIndex++;
  });

  const insertedJobs = await Job.insertMany(jobs);
  console.log('Jobs insérés !');
  return insertedJobs;
}

module.exports = seedJobs;
