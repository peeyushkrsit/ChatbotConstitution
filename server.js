const express = require('express');
const cors = require('cors');
const pdf = require('pdf-parse');
const fs = require('fs');
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Store PDF content
let constitutionText = '';

// Improved search function for Indian Constitution
function searchConstitution(query) {
    try {
        query = query.toLowerCase();
        
        // Wait for PDF to load
        if (!constitutionText) {
            return "The Constitution text is still loading. Please try again in a moment.";
        }

        // Split content into paragraphs
        const paragraphs = constitutionText.split('\n\n');
        
        // Search for exact article numbers
        if (query.includes('article')) {
            const articleMatches = paragraphs.filter(p => 
                p.toLowerCase().includes(query) ||
                p.toLowerCase().includes(query.replace('article', 'art.'))
            );
            if (articleMatches.length > 0) {
                return articleMatches[0];
            }
        }
        
        // Search for amendment numbers
        if (query.includes('amendment')) {
            const amendmentMatches = paragraphs.filter(p => 
                p.toLowerCase().includes(query)
            );
            if (amendmentMatches.length > 0) {
                return amendmentMatches[0];
            }
        }
        
        // General search
        const relevantParagraphs = paragraphs.filter(p => 
            p.toLowerCase().includes(query)
        );
        
        if (relevantParagraphs.length > 0) {
            // Return the most relevant paragraph (you might want to return multiple in the future)
            return relevantParagraphs[0].trim();
        }

        return "I couldn't find specific information about that in the Constitution. Could you try rephrasing your question? You can ask about specific articles, amendments, or constitutional concepts.";
    } catch (error) {
        console.error('Search error:', error);
        return "Sorry, I encountered an error while searching. Please try again.";
    }
}

// Load PDF when server starts
async function loadPDF() {
    try {
        console.log('Starting to load PDF...');
        const dataBuffer = fs.readFileSync('constitution.pdf');
        console.log('PDF file read successfully');
        const data = await pdf(dataBuffer);
        console.log('PDF parsed successfully');
        constitutionText = data.text;
        // Clean up the text
        constitutionText = constitutionText
            .replace(/\r\n/g, '\n')  // Normalize line endings
            .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
            .replace(/\s+/g, ' ')  // Normalize spaces
            .trim();
        console.log('PDF loaded and processed successfully!');
    } catch (error) {
        console.error('Error loading PDF:', error);
        throw error;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        pdfLoaded: Boolean(constitutionText)
    });
});

// Handle questions
app.post('/query', (req, res) => {
    try {
        const userQuestion = req.body.input;
        const answer = searchConstitution(userQuestion);
        res.json({ response: answer });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server and load PDF
const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
    try {
        await loadPDF();
    } catch (error) {
        console.error('Failed to load PDF on startup:', error);
    }
});