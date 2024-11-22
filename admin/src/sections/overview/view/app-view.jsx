import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import { api } from '../../../apis/api';

// ----------------------------------------------------------------------

export default function AppView() {
  const [learningStats, setLearningStats] = useState({
    labels: [],
    series: [
      {
        name: 'Bài kiểm tra',
        type: 'column',
        fill: 'solid',
        data: [],
        color: '#FF6B6B'
      },
      {
        name: 'Đoán từ',
        type: 'area',
        fill: 'gradient',
        data: [],
        color: '#4ECDC4'
      },
      {
        name: 'Luyện nghe',
        type: 'line',
        fill: 'solid',
        data: [],
        color: '#FFE66D'
      },
    ],
  });

  const [levelDistribution, setLevelDistribution] = useState({
    series: [],
    colors: [
      '#FF6B6B',
      '#4ECDC4',
      '#FFE66D',
      '#95E1D3'
    ]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [learningRes, levelRes] = await Promise.all([
          api.getLearningStats(),
          api.getLevelDistribution()
        ]);

        console.log('Learning Stats Response:', learningRes.data);
        
        if (learningRes.data && learningRes.data.labels && learningRes.data.series) {
          setLearningStats(learningRes.data);
        }

        console.log('Level Distribution Response:', levelRes.data);
        
        if (levelRes.data && levelRes.data.series) {
          setLevelDistribution(levelRes.data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Thống kê tổng quan
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Thống kê học tập"
            subheader="Hoạt động 30 ngày gần nhất"
            chart={learningStats}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Phân bố cấp độ"
            chart={levelDistribution}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
