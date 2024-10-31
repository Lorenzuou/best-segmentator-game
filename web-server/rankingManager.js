const axios = require('axios');

class RankingEntry {
    constructor(data) {
        this.name = data.name;
        this.time = data.time;
        this.dice = data.dice;
        this.jaccard = data.iou;  // IoU is the same as Jaccard index
        this.accuracy = ((data.dice + data.iou) / 2) * 100;  // Combined score as percentage
    }

    getFormattedTime() {
        const minutes = Math.floor(this.time / 60);
        const seconds = Math.floor(this.time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

class RankingManager {
    constructor(flaskApiUrl) {
        this.flaskApiUrl = flaskApiUrl;
        this.rankings = [];
    }

    async loadRankings() {
        try {
            const response = await axios.get(`${this.flaskApiUrl}/data/getrankings`);
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