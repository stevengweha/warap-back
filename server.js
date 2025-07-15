const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const { authenticateJWT, authorizeRoles } = require('./middleware/auth');
const authController = require('./controllers/authController');
const jobController = require('./controllers/jobController');
const messageController = require('./controllers/messageController'); // Ajout contrôleur message
const conversationController = require('./controllers/conversationController'); // Import du contrôleur conversation
const candidatureController = require('./controllers/candidatureController'); // Ajout contrôleur candidature
const userController = require('./controllers/userController'); // Ajout contrôleur user
dotenv.config();

// Middlewares globaux
app.use(bodyParser.json());
// Middleware CORS global
app.use(cors({
  origin: '*', // ou une liste blanche précise : ['https://tonapp.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pour que les requêtes OPTIONS ne plantent pas
app.options('*', cors());
app.use(express.json()); // Ajout pour parser le JSON si ce n'est pas déjà fait

// Import des routes d'authentification
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// mongo db api

// Utilisez http://localhost:5001 dans vos requêtes

// Connexion à MongoDB et démarrage du serveur
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connecté');
     // Insertion des utilisateurs si nécessaire
    app.listen(5001, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur http://localhost:5001`);
    });
  })
  .catch(err => console.error('❌ Erreur MongoDB:', err))

// Routes CRUD pour les jobs
app.post('/api/jobs', jobController.createJob);
app.get('/api/Alljobs', jobController.getAllJobs);
app.get('/api/jobs/:id', jobController.getJobById); // recherche par _id MongoDB
app.get('/api/jobs/jobid/:jobId', jobController.getJobByJobId); // recherche par jobId spécifique
app.get('/api/jobs/user/:userId', jobController.getJobsByUser); // jobs d'un utilisateur
app.put('/api/jobs/:id', jobController.updateJob);
app.delete('/api/jobs/:id', jobController.deleteJob);

// Routes CRUD pour les messages
app.post('/api/messages', messageController.createMessage);
app.get('/api/Allmessages', messageController.getAllMessages);
app.get('/api/messages/:id', messageController.getMessageById);
app.get('/api/messages/job/:jobId', messageController.getMessagesByJob); // <-- Ajouté pour messages liés à un job
app.put('/api/messages/:id', messageController.updateMessage);
app.delete('/api/messages/:id', messageController.deleteMessage);

// Route pour récupérer la conversation entre deux utilisateurs
app.get('/api/conversations/:userId/:otherUserId', messageController.getConversation);

// Routes CRUD pour les conversations
const router = express.Router();
router.post('/conversations', conversationController.createConversation);
router.get('/conversations', conversationController.getAllConversations);
router.get('/conversations/:id', conversationController.getConversationById);
router.put('/conversations/:id', conversationController.updateConversation);
router.delete('/conversations/:id', conversationController.deleteConversation);

app.use('/api', router);

// Routes CRUD pour les candidatures
app.post('/api/candidatures', candidatureController.createCandidature);
app.get('/api/candidatures', candidatureController.getAllCandidatures);
app.get('/api/candidatures/:id', candidatureController.getCandidatureById);
app.put('/api/candidatures/:id', candidatureController.updateCandidature);
app.delete('/api/candidatures/:id', candidatureController.deleteCandidature);

// Routes CRUD pour les utilisateurs
app.post('/api/users', userController.createUser);
app.get('/api/users', userController.getAllUsers);
app.get('/api/users/:id', userController.getUserById);
app.put('/api/users/:id', userController.updateUser);
app.delete('/api/users/:id', userController.deleteUser);

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // À adapter selon votre frontend
    methods: ['GET', 'POST']
  }
});

// Gestion des connexions socket.io
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Nouvel utilisateur connecté :', socket.id);

  // Gestion de la présence en ligne
  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('userOnlineStatus', Array.from(onlineUsers.keys())); // broadcast la liste des users en ligne
  });

  // Gestion du statut "en train d'écrire"
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing', { userId });
  });

  // Gestion du statut "vu"
  socket.on('seen', ({ conversationId, messageId, userId }) => {
    socket.to(conversationId).emit('seen', { messageId, userId });
  });

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('sendMessage', (data) => {
    // data doit contenir { conversationId, message }
    io.to(data.conversationId).emit('receiveMessage', data.message);
  });

  socket.on('disconnect', () => {
    // Retirer l'utilisateur de la liste des users en ligne
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('userOnlineStatus', Array.from(onlineUsers.keys()));
    console.log('Utilisateur déconnecté :', socket.id);
  });
});





