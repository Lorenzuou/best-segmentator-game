const express = require('express');
const path = require('path');
const fs = require('fs').promises; // For file operations
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Get the API URL from the environment variable
const apiUrl = process.env.API_URL || 'http://127.0.0.1:5000';

// Add JSON parsing middleware
app.use(express.json());

// Data structure for rankings
class RankingEntry {
    constructor(name, time, accuracy, dice, jaccard, timestamp) {
        this.name = name;
        this.time = time;          // in seconds
        this.accuracy = accuracy;   // percentage
        this.dice = dice;          // dice coefficient
        this.jaccard = jaccard;    // jaccard index
        this.timestamp = timestamp; // when the score was recorded
    }

    // Format time from seconds to MM:SS
    getFormattedTime() {
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

class RankingManager {
    constructor(filepath) {
        this.filepath = filepath;
        this.rankings = [];
    }

    async loadRankings() {
        try {
            const data = await fs.readFile(this.filepath, 'utf8');
            this.rankings = JSON.parse(data).map(entry => 
                new RankingEntry(
                    entry.name, 
                    entry.time, 
                    entry.accuracy, 
                    entry.dice,
                    entry.jaccard,
                    entry.timestamp
                )
            );
        } catch (error) {
            console.log('No existing rankings file, starting fresh');
            this.rankings = [];
        }
    }

    async saveRankings() {
        await fs.writeFile(this.filepath, JSON.stringify(this.rankings, null, 2));
    }

    // Sort rankings by multiple criteria
    sortRankings() {
        this.rankings.sort((a, b) => {
            // Primary sort by accuracy
            if (b.accuracy !== a.accuracy) {
                return b.accuracy - a.accuracy;
            }
            // Secondary sort by time (faster is better)
            if (a.time !== b.time) {
                return a.time - b.time;
            }
            // Tertiary sort by dice coefficient
            if (b.dice !== a.dice) {
                return b.dice - a.dice;
            }
            // Quaternary sort by jaccard index
            return b.jaccard - a.jaccard;
        });
    }

    async addEntry(entry) {
        this.rankings.push(entry);
        this.sortRankings();
        // Keep only top 100 scores
        this.rankings = this.rankings.slice(0, 100);
        await this.saveRankings();
    }

    getTopRankings(limit = 20) {
        return this.rankings.slice(0, limit);
    }
}

// Initialize ranking manager
const rankingManager = new RankingManager(path.join(__dirname, 'data', 'rankings.json'));

// Helper function to render views with consistent variables
const renderWithVars = async (req, res, view) => {
    res.render(view, { 
        apiUrl,
        styleSheet: '/css/styles.css'
    });
};

// Modified ranking route
app.get('/ranking', async (req, res) => {
    await rankingManager.loadRankings();
    const rankings = rankingManager.getTopRankings();
    res.render('rank', { 
        apiUrl,
        styleSheet: '/css/styles.css',
        rankings: rankings
    });
});

// API endpoint to submit new scores
app.post('/api/submit-score', async (req, res) => {
    try {
        const { name, time, accuracy, dice, jaccard } = req.body;
        
        // Validate input
        if (!name || !time || !accuracy || !dice || !jaccard) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create new ranking entry
        const entry = new RankingEntry(
            name,
            parseFloat(time),
            parseFloat(accuracy),
            parseFloat(dice),
            parseFloat(jaccard),
            Date.now()
        );

        await rankingManager.loadRankings();
        await rankingManager.addEntry(entry);

        res.json({ success: true });
    } catch (error) {
        console.error('Error submitting score:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Existing routes
app.get('/', (req, res) => renderWithVars(req, res, 'index'));
app.get('/index', (req, res) => renderWithVars(req, res, 'index'));
app.get('/manual', (req, res) => renderWithVars(req, res, 'manual'));
app.get('/sam', (req, res) => renderWithVars(req, res, 'app_sam'));

const port = process.env.PORT || 4002;
app.listen(port, async () => {
    // Create data directory if it doesn't exist
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error('Error creating data directory:', error);
        }
    }
    
    // Initial load of rankings
    await rankingManager.loadRankings();
    
    console.log(`Server is listening on port ${port}`);
});