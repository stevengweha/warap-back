const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidatureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidature' }, // Lien vers la candidature
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
