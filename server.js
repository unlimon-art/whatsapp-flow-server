const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Cargar distribuidores
const distribuidores = require('./distribuidores_por_estado.json');

// Endpoint de Data Exchange
app.post('/api/whatsapp-flow/data-exchange', (req, res) => {
  const { screen, data, version } = req.body;
  
  console.log('📥 Request:', { screen, state: data?.state, brand: data?.brand });
  
  if (screen === 'APPOINTMENT') {
    const { state, brand } = data;
    let dists = distribuidores[state] || [];
    
    if (brand) {
      dists = dists.filter(d => d.id.includes(`_${brand}`));
    }
    
    console.log(`✅ Returning ${dists.length} distribuidores`);
    
    return res.json({
      version: version || "7.2",
      screen,
      data: {
        ...data,
        distributors: dists
      }
    });
  }
  
  res.json({ version, screen, data: data || {} });
});

// Webhook
app.post('/api/whatsapp-flow/webhook', (req, res) => {
  console.log('📥 Webhook:', req.body);
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', states: Object.keys(distribuidores).length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Loaded ${Object.keys(distribuidores).length} states`);
}); 
