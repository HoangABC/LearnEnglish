const fs = require('fs');  
const { poolPromise } = require('../config/db');

async function extractSentencesAndInsert(inputFile) {
    const pool = await poolPromise;

    try {
        // Read input file
        const data = fs.readFileSync(inputFile, 'utf-8');
        // Split data into lines
        const lines = data.split('\n');

        // Get TypeId for 'Đúng/Sai'
        const typeIdResult = await pool.request().query(`SELECT Id FROM QuestionType WHERE TypeName = 'Đúng/Sai'`);
        const typeId = typeIdResult.recordset.length > 0 ? typeIdResult.recordset[0].Id : null;

        for (const line of lines) {
            const parts = line.split('|');
            if (parts.length >= 11) { // Ensure enough fields
                const word = parts[1];  // Word
                const levelWord = parts[3];  // Level (B2)
                const examples = parts[9];  // Example

                // Find all example sentences in <li> tags
                const sentenceMatches = examples.match(/<li[^>]*>(.*?)<\/li>/g);
                
                const request = pool.request();
                request.input('levelWord', levelWord);

                // Find LevelWordId based on levelWord
                const levelWordIdResult = await request.query(`SELECT Id FROM LevelWord WHERE LevelWord = @levelWord`);

                if (levelWordIdResult.recordset.length > 0) {
                    const levelWordId = levelWordIdResult.recordset[0].Id;

                    if (sentenceMatches && sentenceMatches.length > 0) {
                        for (let match of sentenceMatches) {
                            // Remove unwanted HTML tags to get clean sentence
                            match = match.replace(/<[^>]*>/g, '').trim();

                            // Replace the word in the sentence with '___'
                            const modifiedSentence = match.replace(new RegExp(`\\b${word}\\b`, 'gi'), '___');

                            // Check for duplicates
                            const checkRequest = pool.request();
                            checkRequest.input('modifiedSentence', modifiedSentence);
                            checkRequest.input('word', word); // Declare @word here
                            
                            const checkDuplicateResult = await checkRequest.query(`
                                SELECT COUNT(*) AS count FROM Question 
                                WHERE QuestionText = @modifiedSentence
                            `);

                            if (checkDuplicateResult.recordset[0].count === 0) {
                                // If no duplicates found, insert the sentence as a new question
                                const insertRequest = pool.request();
                                insertRequest.input('modifiedSentence', modifiedSentence);
                                insertRequest.input('levelWordId', levelWordId);
                                insertRequest.input('typeId', typeId);
                                insertRequest.input('word', word); // Ensure @word is declared here too
                                
                                const insertQuestionResult = await insertRequest.query(`
                                    INSERT INTO Question (QuestionText, LevelWordId, TypeId, CreatedAt, UpdatedAt, Status) 
                                    VALUES (@modifiedSentence, @levelWordId, @typeId, GETDATE(), GETDATE(), 1);
                                    SELECT SCOPE_IDENTITY() AS QuestionId; -- Get the last inserted question ID
                                `);
                                
                                const questionId = insertQuestionResult.recordset[0].QuestionId; // Capture the questionId

                                // Automatically add AnswerText as the original word
                                const answerInsertRequest = pool.request();
                                answerInsertRequest.input('questionId', questionId); // Declare @questionId here
                                answerInsertRequest.input('answerWord', word); // Use 'answerWord' here instead of 'word'

                                await answerInsertRequest.query(`
                                    INSERT INTO Answer (QuestionId, AnswerText, CreatedAt, UpdatedAt, Status) 
                                    VALUES (@questionId, @answerWord, GETDATE(), GETDATE(), 1);
                                `);
                            } else {
                                console.log(`Duplicate sentence found and skipped: ${modifiedSentence}`);
                            }
                        }
                    } else {
                        console.log(`No example sentences found for word: ${word}`);
                    }
                } else {
                    console.log(`No LevelWordId found for level: ${levelWord}`);
                }
            } else {
                console.log(`Invalid line: ${line}`);
            }
        }
        console.log('Data has been filtered and written to the database.');
    } catch (err) {
        console.error('Error inserting data into database:', err);
    }
}

module.exports = { extractSentencesAndInsert };

const inputFilePath = '../data/academic.csv';

if (require.main === module) {
    extractSentencesAndInsert(inputFilePath);
}
