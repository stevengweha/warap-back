const Job = require('../models/Job');

// Créer un job
exports.createJob = async (req, res) => {
  try {
    const { userId, jobId, titre, description, categorie, localisation, remuneration, dateMission } = req.body;
    const job = new Job({
      userId,
      jobId,
      titre,
      description,
      categorie,
      localisation,
      remuneration,
      dateMission
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer tous les jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('userId', 'nom prenom email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un job par son identifiant unique
exports.getJobByJobId = async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId }).populate('userId', 'nom prenom email');
    if (!job) return res.status(404).json({ error: 'Job non trouvé' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un job par son identifiant
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les jobs d'un utilisateur
exports.getJobsByUser = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.params.userId });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ error: 'Job non trouvé' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job non trouvé' });
    res.json({ message: 'Job supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
