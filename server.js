const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.text({ type: '*/*' }));

const distribuidores = require('./distribuidores_por_estado.json');

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    states: Object.keys(distribuidores).length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/whatsapp-flow/data-exchange', (req, res) => {
  console.log('📥 Request received');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    let data = req.body;
    
    // Si viene como string, parsearlo
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log('⚠️ Could not parse body as JSON');
      }
    }
    
    const { screen, data: flowData, version } = data;
    
    console.log('📊 Parsed:', { screen, flowData, version });
    
    if (screen === 'APPOINTMENT' && flowData && flowData.state) {
      const { state, brand } = flowData;
      let dists = distribuidores[state] || [];
      
      if (brand) {
        dists = dists.filter(d => d.id.includes(`_${brand}`));
      }
      
      console.log(`✅ Returning ${dists.length} distributors for ${state}`);
      
      return res.json({
        version: version || "7.2",
        screen: screen,
        data: {
          ...flowData,
          distributors: dists
        }
      });
    }
    
    // Respuesta por defecto
    console.log('📤 Sending default response');
    return res.json({ 
      version: version || "7.2", 
      screen: screen || "APPOINTMENT", 
      data: flowData || {} 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.post('/api/whatsapp-flow/webhook', (req, res) => {
  console.log('📥 Webhook:', req.body);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Loaded ${Object.keys(distribuidores).length} states`);
});
