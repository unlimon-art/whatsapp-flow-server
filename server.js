const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const distribuidores = require('./distribuidores_por_estado.json');

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    states: Object.keys(distribuidores).length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/whatsapp-flow/data-exchange', (req, res) => {
  console.log('Request received:', req.body);
  
  const { screen, data, version } = req.body;
  
  if (screen === 'APPOINTMENT' && data && data.state) {
    const dists = distribuidores[data.state] || [];
    console.log(`Returning ${dists.length} distributors for ${data.state}`);
    
    return res.json({
      version: version || "7.2",
      screen: screen,
      data: {
        ...data,
        distributors: dists
      }
    });
  }
  
  res.json({ version, screen, data: data || {} });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Loaded ${Object.keys(distribuidores).length} states`);
});
