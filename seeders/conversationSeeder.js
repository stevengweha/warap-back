const Conversation = require('../models/Conversation');

// users: tableau d'utilisateurs, jobs: tableau de jobs, candidatures: tableau de candidatures
async function seedConversations(users, jobs, candidatures) {
  await Conversation.deleteMany({});
  let conversations = [];

  for (const candidature of candidatures) {
    const job = jobs.find(j => j._id.equals(candidature.jobId));
    if (!job) continue;
    const posteurId = job.userId;
    const chercheurId = candidature.chercheurId;

    // Vérifier si la conversation existe déjà
    let conversation = await Conversation.findOne({
      participants: { $all: [chercheurId, posteurId], $size: 2 },
      jobId: job._id,
      candidatureId: candidature._id
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [chercheurId, posteurId],
        jobId: job._id,
        candidatureId: candidature._id
      });
    }
    conversations.push(conversation);
  }

  console.log('Conversations insérées !');
  return conversations;
}

module.exports = seedConversations;
