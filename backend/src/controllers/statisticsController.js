const { poolPromise } = require('../config/db');

const statisticsController = {
  getLearningStats: async (req, res) => {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      const result = await request.query(`
        WITH DateRange AS (
          SELECT CAST(GETDATE() AS DATE) AS Date
          UNION ALL
          SELECT CAST(DATEADD(DAY, -1, Date) AS DATE)
          FROM DateRange
          WHERE DATEADD(DAY, -1, Date) >= DATEADD(DAY, -29, CAST(GETDATE() AS DATE))
        )
        SELECT 
          FORMAT(d.Date, 'yyyy-MM-dd') as date,
          COALESCE(COUNT(DISTINCT ua.Id), 0) as testCount,
          COALESCE(COUNT(DISTINCT wg.Id), 0) as guessCount,
          COALESCE(COUNT(DISTINCT lp.Id), 0) as listeningCount
        FROM DateRange d
        LEFT JOIN UserAnswer ua ON CAST(ua.CreatedAt AS DATE) = d.Date
        LEFT JOIN WordGuessAnswer wg ON CAST(wg.CreatedAt AS DATE) = d.Date
        LEFT JOIN ListeningPractice lp ON CAST(lp.CreatedAt AS DATE) = d.Date
        GROUP BY d.Date
        ORDER BY d.Date ASC
        OPTION (MAXRECURSION 30)
      `);

      const formattedData = {
        labels: result.recordset.map(r => r.date),
        series: [
          {
            name: 'Bài kiểm tra',
            type: 'column',
            fill: 'solid',
            data: result.recordset.map(r => r.testCount)
          },
          {
            name: 'Đoán từ',
            type: 'area',
            fill: 'gradient',
            data: result.recordset.map(r => r.guessCount)
          },
          {
            name: 'Luyện nghe',
            type: 'line',
            fill: 'solid',
            data: result.recordset.map(r => r.listeningCount)
          }
        ]
      };

      res.json(formattedData);
    } catch (error) {
      console.error('Error in getLearningStats:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getLevelDistribution: async (req, res) => {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      const result = await request.query(`
        SELECT 
          l.LevelName as label,
          COUNT(u.Id) as value
        FROM [Level] l
        LEFT JOIN [User] u ON l.Id = u.LevelId AND u.Status = 1
        GROUP BY l.LevelName, l.Id
        ORDER BY l.Id
      `);

      const formattedData = {
        series: result.recordset,
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      };

      res.json(formattedData);
    } catch (error) {
      console.error('Error in getLevelDistribution:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = statisticsController; 