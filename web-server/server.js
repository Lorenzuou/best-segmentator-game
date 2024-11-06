const express = require('express');
const path = require('path');
const fs = require('fs').promises; // For file operations
const app = express();
//import cors
const cors = require('cors');
app.use(cors());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Get the API URL from the environment variable
const FLASK_API_URL = process.env.API_URL || 'http://127.0.0.1:5000';
const CONTAINER_FLASK_API_URL = 'http://app-api:5000'; 
// Add JSON parsing middleware
app.use(express.json());

const RankingManager = require('./rankingManager.js');


const groupFolder = 'group_1';




// Initialize ranking manager
const rankingManagerSAM = new RankingManager(CONTAINER_FLASK_API_URL, 'sam');
const rankingManagerManual = new RankingManager(CONTAINER_FLASK_API_URL, 'manual');
console.log("path")
console.log(path.join(__dirname, 'data', 'rankings.json'))

// Helper function to render views with consistent variables
const renderWithVars = async (req, res, view) => {
    res.render(view, { 
        apiUrl: FLASK_API_URL,
        styleSheet: '/css/styles.css',
        groupFolder: groupFolder
    });
};


// Ranking route
app.get('/ranking/:type', async (req, res) => {
    try {
        const rankingType = req.params.type;
        let rankings;

        if (rankingType === 'manual') {
            await rankingManagerManual.loadRankings();
            rankings = rankingManagerManual.getTopRankings();
        } else if (rankingType === 'sam') {
            await rankingManagerSAM.loadRankings();
            rankings = rankingManagerSAM.getTopRankings();
        } else {
            throw new Error('Invalid ranking type');
        }

        res.render('rank', {
            apiUrl: FLASK_API_URL,
            styleSheet: '/css/styles.css',
            rankings: rankings, 
            type : rankingType
        });
    } catch (error) {
        console.error('Error rendering ranking page:', error);
        res.status(500).render('error', {
            message: 'Unable to load rankings at this time'
        });
    }
});

app.get('/adm', async (req, res) => {
    try {
        
        res.render('adm', {
            apiServerAddress: FLASK_API_URL,
            styleSheet: '/css/styles.css',
        });
    } catch (error) {
        console.error('Error rendering ranking page:', error);
        res.status(500).render('error', {
            message: 'Unable to load rankings at this time'
        });
    }
}
);
// // API endpoint to submit new scores
// app.post('/api/submit-score', async (req, res) => {
//     try {
//         const { name, time, accuracy, dice, jaccard } = req.body;
        
//         // Validate input
//         if (!name || !time || !accuracy || !dice || !jaccard) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         // Create new ranking entry
//         const entry = new RankingEntry(
//             name,
//             parseFloat(time),
//             parseFloat(accuracy),
//             parseFloat(dice),
//             parseFloat(jaccard),
//             Date.now()
//         );

//         await rankingManager.loadRankings();
//         await rankingManager.addEntry(entry);

//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error submitting score:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

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