require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Poll = require('./models/poll');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
// 1. Home Route: Show all polls
app.get('/', async (req, res) => {
    const polls = await Poll.find();
    res.render('index', { polls });
});

// 2. Create Poll: Form to create a new poll
app.get('/polls/new', (req, res) => {
    res.render('create');
});

app.post('/polls', async (req, res) => {
    const { question, options } = req.body;
    const poll = new Poll({
        question,
        options: options.map(option => ({ text: option }))
    });
    await poll.save();
    res.redirect('/');
});

// 3. Vote on Poll: Display poll and allow voting
app.get('/polls/:id', async (req, res) => {
    const poll = await Poll.findById(req.params.id);
    res.render('vote', { poll });
});

app.post('/polls/:id/vote', async (req, res) => {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.redirect(`/polls/${req.params.id}/results`);
});

// 4. Display Poll Results
app.get('/polls/:id/results', async (req, res) => {
    const poll = await Poll.findById(req.params.id);
    res.render('results', { poll });
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
