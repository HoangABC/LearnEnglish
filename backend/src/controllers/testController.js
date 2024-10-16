const axios = require('axios');
const { poolPromise, sql } = require('../config/db');
const { getIo } = require('../Module/socket');

// Hàm để xáo trộn mảng
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Hoán đổi
    }
};

// Hàm cập nhật cấp độ của người dùng
const updateUserLevel = async (userId, currentLevelId) => {
    try {
        const newLevelId = currentLevelId + 1; // Tăng cấp độ

        // Cập nhật LevelId trong bảng User
        const pool = await poolPromise;
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('newLevelId', sql.Int, newLevelId)
            .query('UPDATE [User] SET LevelId = @newLevelId WHERE Id = @userId');

        console.log(`User level updated to ${newLevelId} for userId ${userId}`);
        return newLevelId;  // Trả về newLevelId
    } catch (err) {
        console.error('Error updating user level:', err.message);
        throw new Error('Failed to update user level');
    }
};


// Lấy danh sách câu hỏi và đáp án cho quiz
const getQuizQuestions = async (req, res) => {
    try {
        const { userId } = req.query; // Lấy userId từ query
        console.log(userId);
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const pool = await poolPromise;

        // Lấy LevelId của người dùng
        const userResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query(
                'SELECT LevelId FROM [User] WHERE Id = @userId AND Status = 1;'
            );

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found or inactive' });
        }

        const levelId = userResult.recordset[0].LevelId;

        // Lấy danh sách câu hỏi và đáp án từ bảng Question với LevelId và có chứa "___"
        const questionResult = await pool.request()
            .input('levelId', sql.Int, levelId)
            .query(`
                SELECT TOP 10 q.Id AS questionId, q.QuestionText, a.Id AS answerId, a.AnswerText, a.IsCorrect
                FROM Question q
                JOIN Answer a ON q.Id = a.QuestionId
                WHERE q.Status = 1 
                    AND q.LevelWordId IN (
                        SELECT LevelWordId FROM LevelMapping WHERE LevelId = @levelId
                    )
                    AND CHARINDEX('___', q.QuestionText) > 0 -- Điều kiện kiểm tra có "___"
                ORDER BY NEWID();
            `);

        const questions = {};

        // Lấy danh sách câu hỏi và đáp án
        questionResult.recordset.forEach(row => {
            if (!questions[row.questionId]) {
                questions[row.questionId] = {
                    questionId: row.questionId,
                    questionText: row.QuestionText,
                    correctAnswer: {
                        answerId: row.answerId,
                        answerText: row.AnswerText,
                    },
                    correctAnswerId: row.answerId, // Thêm correctAnswerId
                    wrongAnswers: [] // để chứa danh sách đáp án sai
                };
            }
        });

        // Tạo một tập hợp để lưu trữ đáp án đã chọn
        const selectedAnswers = new Set();

        // Thêm đáp án đúng vào tập hợp
        Object.values(questions).forEach(question => {
            selectedAnswers.add(question.correctAnswer.answerText);
        });

        // Lấy các đáp án sai ngẫu nhiên từ bảng Answer
        const wrongAnswersResult = await pool.request()
            .query(`
                SELECT a.Id AS answerId, a.AnswerText, a.QuestionId
                FROM Answer a
                WHERE a.IsCorrect = 0 -- chỉ lấy đáp án sai
                ORDER BY NEWID(); 
            `);

        // Ghép đáp án sai vào từng câu hỏi
        wrongAnswersResult.recordset.forEach(row => {
            Object.keys(questions).forEach(questionId => {
                // Kiểm tra nếu QuestionId không trùng và có chưa đủ 3 đáp án sai
                if (row.QuestionId !== questionId && questions[questionId].wrongAnswers.length < 3) {
                    // Kiểm tra nếu đáp án sai không trùng với đáp án đúng và chưa được chọn trước đó
                    if (row.answerId !== questions[questionId].correctAnswer.answerId && !selectedAnswers.has(row.AnswerText)) {
                        questions[questionId].wrongAnswers.push({
                            answerId: row.answerId,
                            answerText: row.AnswerText,
                        });
                        // Thêm đáp án vào tập hợp đã chọn
                        selectedAnswers.add(row.AnswerText);
                    }
                }
            });
        });

        // Chuẩn bị danh sách câu hỏi với đáp án đúng và sai
        const finalQuestions = Object.values(questions).map(question => {
            // Ghép tất cả các đáp án vào một mảng
            const answers = [
                question.correctAnswer,
                ...question.wrongAnswers
            ];

            // Xáo trộn mảng đáp án
            shuffleArray(answers);

            return {
                questionId: question.questionId, // Thêm questionId vào đối tượng trả về
                questionText: question.questionText,
                correctAnswerId: question.correctAnswerId, // Trả về correctAnswerId
                answers: answers // Sử dụng mảng đã xáo trộn
            };
        });

        res.status(200).json(finalQuestions);
    } catch (err) {
        console.error('Error fetching quiz questions:', err.message);
        res.status(500).json({ error: err.message });
    }
};


// Gửi câu trả lời của người dùng
const submitQuizAnswers = async (req, res) => {
    try {
        const { userId, answers } = req.body;

        // Kiểm tra tính hợp lệ của đầu vào
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'Invalid input: answers must be a non-empty array.' });
        }

        for (const answer of answers) {
            if (!answer.questionId || !answer.answerId) {
                return res.status(400).json({ message: 'Invalid input: each answer must contain questionId and answerId.' });
            }
        }

        const pool = await poolPromise;
        let score = 0;

        // Đếm tổng số câu hỏi
        const totalQuestions = answers.length;

        // Bước 1: Tạo truy vấn kiểm tra câu trả lời đúng
        const questionIds = answers.map(a => a.questionId);
        const answerIds = answers.map(a => a.answerId);

        const checkCorrectAnswersResult = await pool.request()
            .query(`
                SELECT Answer.Id AS answerId, Answer.QuestionId 
                FROM Answer
                WHERE Answer.QuestionId IN (${questionIds.join(',')}) 
                AND Answer.Id IN (${answerIds.join(',')});
            `);

        // Tạo một map để so sánh câu trả lời đúng
        const correctAnswerMap = {};
        checkCorrectAnswersResult.recordset.forEach(row => {
            correctAnswerMap[row.answerId] = row.QuestionId;
        });

        // Bước 2: Thêm bản ghi mới vào UserTestStats
        const insertResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('totalTests', sql.Int, 1)
            .input('totalQuestions', sql.Int, totalQuestions)
            .input('correctAnswers', sql.Int, score)
            .input('averageScore', sql.Float, (score / totalQuestions))
            .query(`
                INSERT INTO UserTestStats (UserId, TotalTests, TotalQuestions, CorrectAnswers, AverageScore)
                OUTPUT INSERTED.Id
                VALUES (@userId, @totalTests, @totalQuestions, @correctAnswers, @averageScore);
            `);

        const userTestId = insertResult.recordset[0].Id;

        // Bước 3: Lặp qua từng câu trả lời, ghi lại và tăng điểm nếu đúng
        for (const answer of answers) {
            const { answerId, questionId } = answer;
            const isCorrect = correctAnswerMap[answerId] === questionId;

            // Ghi nhận câu trả lời vào bảng UserAnswer
            await pool.request()
                .input('userTestId', sql.Int, userTestId)
                .input('questionId', sql.Int, questionId)
                .input('answerId', sql.Int, answerId)
                .query(`
                    INSERT INTO UserAnswer (UserTestId, QuestionId, AnswerId)
                    VALUES (@userTestId, @questionId, @answerId);
                `);

            if (isCorrect) {
                score += 1;
            }
        }

        // Bước 4: Kiểm tra và cập nhật LevelId của người dùng
        const averageScore = score / totalQuestions;
        let newLevelId = null;
        if (averageScore >= 0.7) {
            const userLevelResult = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT LevelId FROM [User] WHERE Id = @userId');

            if (userLevelResult.recordset.length > 0) {
                const currentLevelId = userLevelResult.recordset[0].LevelId;

                // Cập nhật và lấy newLevelId từ hàm updateUserLevel
                newLevelId = await updateUserLevel(userId, currentLevelId);
            }
        }

        // Trả về thông tin tổng kết
        res.status(200).json({
            message: 'Quiz submitted successfully',
            totalQuestions,
            score,
            userTestId,
            newLevelId // Trả về newLevelId sau khi cập nhật
        });
    } catch (err) {
        console.error('Error submitting quiz answers:', err.message);
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    getQuizQuestions,
    submitQuizAnswers
};
