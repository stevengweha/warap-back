const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema({
  chercheurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  dateCandidature: { type: Date, default: Date.now },
  statut: { type: String, enum: ['en_attente', 'acceptee', 'refusee'], default: 'en_attente' },
  message: { type: String }
});

module.exports = mongoose.model('Candidature', candidatureSchema);
