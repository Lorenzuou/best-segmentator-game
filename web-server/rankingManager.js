const axios = require('axios');

class RankingEntry {
    constructor(data) {
        this.name = data.name;
        this.time = data.time;
        this.dice = data.dice;
        this.jaccard = data.iou;  
        this.accuracy = ((data.dice + data.iou) / 2) * 100;  
    }

    getFormattedTime() {
        const seconds = Math.floor(this.time / 1000);
        return `${seconds}.${(this.time % 1000).toString().padStart(2, '0')}s`;
    }
}

class RankingManager {
    constructor(flaskApiUrl, type) {
        this.flaskApiUrl = flaskApiUrl;
        this.rankings = [];
        this.type=type;
        
    }

    async loadRankings() {
        try {
            const response = await axios.get(`${this.flaskApiUrl}/data/getranking?type=${this.type}`);
            const rankingDict = response.data;
            
            // Convert dictionary to array and create RankingEntry objects
            this.rankings = Object.values(rankingDict)
                .map(data => new RankingEntry(data))
                .sort((a, b) => {
                    // Sort by accuracy (descending) and then by time (ascending)
                    if (b.accuracy !== a.accuracy) {
                        return b.accuracy - a.accuracy;
                    }
                    return a.time - b.time;
                });

        } catch (error) {
            console.error('Error loading rankings:', error);
            this.rankings = [];
            throw error;
        }
    }

    getTopRankings() {
        return this.rankings;
    }
}

module.exports = RankingManager;