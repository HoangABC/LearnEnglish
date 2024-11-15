const { poolPromise, sql } = require('../config/db');

// Hàm lấy dữ liệu cho bài luyện nghe theo LevelId của người dùng
const getListeningPractice = async (req, res) => {
    try {
        const { userId } = req.query; // Nhận userId từ query parameters
        if (!userId) {
            return res.status(400).json({ message: 'UserId is required' });
        }
        console.log('Received userId:', userId); // Log userId

        const pool = await poolPromise;

        // Fetch LevelId từ bảng User cho userId được cung cấp
        const userResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT LevelId FROM [User] WHERE Id = @userId AND Status = 1');

        console.log('User result:', userResult.recordset); // Log userResult

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found or inactive' });
        }

        const levelId = userResult.recordset[0].LevelId;
        console.log('LevelId:', levelId); // Log LevelId

        // Lấy các LevelWordId từ bảng LevelMapping cho LevelId của người dùng
        const levelMappingResult = await pool.request()
            .input('levelId', sql.Int, levelId)
            .query('SELECT LevelWordId FROM LevelMapping WHERE LevelId = @levelId AND Status = 1');
        
        const levelWordIds = levelMappingResult.recordset.map(row => row.LevelWordId);
        console.log('LevelWordIds:', levelWordIds); // Log LevelWordIds

        if (levelWordIds.length === 0) {
            return res.status(404).json({ message: 'No words found for this level' });
        }

        // Convert levelWordIds thành chuỗi để dùng trong SQL query
        const levelWordIdsString = levelWordIds.join(',');

        // Lấy ngẫu nhiên một từ đúng từ bảng Word
        const randomWordResult = await pool.request()
            .input('levelWordIds', sql.NVarChar, levelWordIdsString)
            .query(`
                SELECT TOP 1 w.Id AS WordId, w.AudioUK, w.AudioUS, w.Word
                FROM Word w
                WHERE w.LevelWordId IN (${levelWordIdsString})
                GROUP BY w.Id, w.AudioUK, w.AudioUS, w.Word
                ORDER BY NEWID();
            `);

        console.log('Random word result:', randomWordResult.recordset); // Log randomWordResult

        if (randomWordResult.recordset.length === 0) {
            return res.status(404).json({ message: 'No words found for this level' });
        }

        const correctWord = randomWordResult.recordset[0];
        const correctWordWithoutNumbers = correctWord.Word.replace(/[0-9]/g, ''); // Loại bỏ các số
        console.log('Correct word without numbers:', correctWordWithoutNumbers); // Log từ đúng đã loại bỏ số

        const audio = Math.random() < 0.5 ? correctWord.AudioUK : correctWord.AudioUS; // Random chọn giữa AudioUK và AudioUS

        // Lấy ba từ sai ngẫu nhiên, đảm bảo khác với từ đúng và không có số
        const incorrectWordsResult = await pool.request()
            .input('levelWordIds', sql.NVarChar, levelWordIdsString)
            .input('word', sql.NVarChar, correctWord.Word) // Exclude the correct word
            .query(`
                SELECT TOP 3 w.Word, w.PhoneticUK, w.PhoneticUS
                FROM Word w
                WHERE w.LevelWordId IN (${levelWordIdsString})
                AND w.Word != @word -- Exclude the correct word
                AND w.Word NOT LIKE '%[0-9]%'  -- Loại bỏ các từ có số
                GROUP BY w.Word, w.PhoneticUK, w.PhoneticUS
                ORDER BY NEWID();
            `);

        const incorrectWords = incorrectWordsResult.recordset.map(row => row.Word);
        console.log('Incorrect words:', incorrectWords); // Log incorrect words

        // Insert the new word into the ListeningPractice table, để Answer là NULL khi tạo
        const createResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('wordId', sql.Int, correctWord.WordId)
            .input('audio', sql.NVarChar, audio)
            .input('answer', sql.NVarChar, null) // Để Answer là NULL
            .query(`
                INSERT INTO ListeningPractice (UserId, WordId, Audio, Answer, IsCorrect, Status)
                VALUES (@userId, @wordId, @audio, @answer, 0, 1);
            `);

        console.log('Insert result:', createResult); // Log kết quả chèn

        // Lấy bài luyện nghe vừa tạo
        const listeningPracticeResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT TOP 1 * FROM ListeningPractice WHERE UserId = @userId ORDER BY CreatedAt DESC');

        const listeningPractice = listeningPracticeResult.recordset[0];
        console.log('Listening practice result:', listeningPractice); // Log bài luyện nghe

        // Nếu là trắc nghiệm, trộn từ đúng và từ sai với nhau
        const inputType = Math.random() < 0.7 ? 'multiple-choice' : 'fill-in-the-blank';
        let choices = [];
        if (inputType === 'multiple-choice') {
            choices = [correctWord.Word, ...incorrectWords];
            shuffleArray(choices); // Trộn các từ trong mảng
            console.log('Shuffled choices:', choices); // Log các từ đã được trộn
        }

        // Trả về định dạng câu hỏi và đáp án
        const response = {
            questionId: listeningPractice.Id,
            word: correctWord.Word,
            audio: listeningPractice.Audio,
            answer: listeningPractice.Answer, // Answer là NULL
            inputType: inputType,
            choices: inputType === 'multiple-choice' ? choices : undefined, // Trả về choices chỉ khi là trắc nghiệm
            randomWord: correctWord.Word,
        };

        console.log('Response:', response); // Log phản hồi

        res.status(201).json(response); // Trả về từ mới

    } catch (err) {
        console.error('Error in getListeningPractice:', err.message);
        res.status(500).json({ error: err.message });
    }
};


// Hàm trộn mảng
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

const submitListeningPractice = async (req, res) => {
    try {
        const { userId, answer } = req.body;

        // Log the received answer for debugging
        console.log('Received userId:', userId);
        console.log('Received answer:', answer);

        // Validate the answer and questionId
        if (!answer || !answer.answer || !answer.questionId) {
            return res.status(400).json({ message: 'Invalid answer format' });
        }

        // Extract the actual answer based on questionId
        const userAnswer = answer.answer;

        // Check if there is an answer for the questionId
        if (!userAnswer) {
            return res.status(400).json({ message: 'Answer is missing for the questionId' });
        }

        const pool = await poolPromise;

        // Search for the question in the ListeningPractice table by UserId and QuestionId
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('questionId', sql.Int, answer.questionId)
            .query(`
                SELECT * FROM ListeningPractice
                WHERE UserId = @userId AND Id = @questionId
            `);

        // If no data is found, perform an insert
        if (result.recordset.length === 0) {
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('questionId', sql.Int, answer.questionId)
                .input('answer', sql.NVarChar, userAnswer)
                .query(`
                    INSERT INTO ListeningPractice (UserId, WordId, Answer)
                    VALUES (@userId, @questionId, @answer)
                `);
        } else {
            // If data is found, perform an update
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('questionId', sql.Int, answer.questionId)
                .input('answer', sql.NVarChar, userAnswer)
                .query(`
                    UPDATE ListeningPractice
                    SET Answer = @answer, UpdatedAt = GETDATE()
                    WHERE UserId = @userId AND Id = @questionId
                `);
        }

        // Fetch the updated answer
        const updatedAnswerResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('questionId', sql.Int, answer.questionId)
            .query(`
                SELECT Answer FROM ListeningPractice
                WHERE UserId = @userId AND Id = @questionId
            `);

        const updatedAnswer = updatedAnswerResult.recordset[0].Answer;

        // Fetch the WordId from ListeningPractice
        const wordIdResult = await pool.request()
            .input('questionId', sql.Int, answer.questionId)
            .query(`
                SELECT WordId FROM ListeningPractice WHERE Id = @questionId
            `);

        const wordId = wordIdResult.recordset[0].WordId;

        // Fetch the correct word from the Word table using WordId
        const wordResult = await pool.request()
            .input('wordId', sql.Int, wordId)
            .query(`
                SELECT Word FROM Word WHERE Id = @wordId
            `);

        if (wordResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }

        const correctWord = wordResult.recordset[0].Word;

        // Check if the answer is correct
        const isCorrect = updatedAnswer.toLowerCase() === correctWord.toLowerCase();

        console.log('Updated Answer:', updatedAnswer);
        console.log('Correct Word:', correctWord);
        console.log('Is Correct:', isCorrect);

        // Update the IsCorrect column in ListeningPractice
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('questionId', sql.Int, answer.questionId)
            .input('isCorrect', sql.Bit, isCorrect)
            .query(`
                UPDATE ListeningPractice
                SET IsCorrect = @isCorrect
                WHERE UserId = @userId AND Id = @questionId
            `);

        // Send the result back to the frontend
        res.status(200).json({
            correctWord: correctWord,
            isCorrect: isCorrect
        });

    } catch (err) {
        console.error('Error in submitListeningPractice:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getListeningPractice,
    submitListeningPractice,
};
