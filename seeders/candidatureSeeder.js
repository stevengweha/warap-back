const Candidature = require('../models/Candidature');

// users: tableau d'utilisateurs, jobs: tableau de jobs
async function seedCandidatures(users, jobs) {
  await Candidature.deleteMany({});
  const chercheurs = users.filter(u => u.role === 'chercheur');
  let candidatures = [];

  // Chaque chercheur postule à 2 jobs au hasard
  for (const chercheur of chercheurs) {
    const jobsAleatoires = jobs.sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const job of jobsAleatoires) {
      candidatures.push({
        chercheurId: chercheur._id,
        jobId: job._id,
        message: `Bonjour, je souhaite postuler à l'offre "${job.titre}".`
      });
    }
  }

  const insertedCandidatures = await Candidature.insertMany(candidatures);
  console.log('Candidatures insérées !');
  return insertedCandidatures;
}

module.exports = seedCandidatures;
