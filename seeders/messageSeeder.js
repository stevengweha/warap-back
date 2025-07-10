const Message = require('../models/Message');
const Job = require('../models/Job');
const Conversation = require('../models/Conversation');

// users: tableau d'utilisateurs, jobs: tableau de jobs, conversations: tableau de conversations
async function seedMessages(users, jobs, conversations) {
  await Message.deleteMany({});
  const chercheurs = users.filter(u => u.role === 'chercheur');
  const posteurs = users.filter(u => u.role === 'posteur');
  let messages = [];

  for (const conversation of conversations) {
    const candidatureId = conversation.candidatureId;
    const job = jobs.find(j => j._id.equals(conversation.jobId));
    if (!job) continue;
    const posteur = posteurs.find(p => p._id.equals(job.userId));
    if (!posteur) continue;
    const chercheur = chercheurs.find(c => conversation.participants.some(id => id.equals(c._id)));
    if (!chercheur) continue;

    // Générer des timestamps réalistes
    const now = new Date();
    const timestamps = [
      new Date(now.getTime() - 1000 * 60 * 10),
      new Date(now.getTime() - 1000 * 60 * 8),
      new Date(now.getTime() - 1000 * 60 * 6)
    ];

    messages.push(
      {
        conversationId: conversation._id,
        candidatureId,
        senderId: chercheur._id,
        receiverId: posteur._id,
        contenu: `Bonjour ${posteur.prenom}, je souhaite postuler à votre offre "${job.titre}".`,
        jobId: job._id,
        dateEnvoi: timestamps[0]
      },
      {
        conversationId: conversation._id,
        candidatureId,
        senderId: posteur._id,
        receiverId: chercheur._id,
        contenu: `Bonjour ${chercheur.prenom}, merci pour votre candidature. Pouvez-vous me parler de votre expérience ?`,
        jobId: job._id,
        dateEnvoi: timestamps[1]
      },
      {
        conversationId: conversation._id,
        candidatureId,
        senderId: chercheur._id,
        receiverId: posteur._id,
        contenu: `Bien sûr ! J'ai déjà travaillé sur des missions similaires.`,
        jobId: job._id,
        dateEnvoi: timestamps[2]
      }
    );
  }

  const insertedMessages = await Message.insertMany(messages);
  console.log('Messages insérés !');
  return insertedMessages;
}

module.exports = seedMessages;
