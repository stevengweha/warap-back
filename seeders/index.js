const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Job = require('../models/Job');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Candidature = require('../models/Candidature');

const seedUsers = require('./userSeeder');
const seedJobs = require('./jobSeeder');
const seedCandidatures = require('./candidatureSeeder');
const seedConversations = require('./conversationSeeder');
const seedMessages = require('./messageSeeder');

async function seedAll() {
  await mongoose.connect(process.env.MONGO_URI);

  // Suppression de toutes les données existantes
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Candidature.deleteMany({})
  ]);
  console.log('Toutes les anciennes données ont été supprimées.');

  const users = await seedUsers();
  const jobs = await seedJobs(users);

  // Générer et insérer les candidatures
  const candidatures = await seedCandidatures(users, jobs);

  // Ajout des candidatures dans les jobs
  for (const candidature of candidatures) {
    await Job.findByIdAndUpdate(
      candidature.jobId,
      { $push: { candidatures: candidature._id } }
    );
  }

  // Générer les conversations à partir des candidatures
  const conversations = await seedConversations(users, jobs, candidatures);

  // Générer les messages à partir des conversations
  await seedMessages(users, jobs, conversations);

  await mongoose.disconnect();
  console.log('Tous les seeders ont été exécutés !');
}

seedAll();
