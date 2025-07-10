const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }, // Nouvelle référence
  candidatureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidature' }, // Lien vers la candidature
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Lien vers l'offre
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenu: String,
  dateEnvoi: { type: Date, default: Date.now },
  lu: { type: Boolean, default: false },
});

module.exports = mongoose.model('Message', messageSchema);
