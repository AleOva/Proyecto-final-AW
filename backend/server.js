const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL
const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'eventosbd',
    password: 'Moon1992',
    port: 5432,
});

pgClient.connect();

// Endpoint para Server-Sent Events (SSE)
app.get('/events', (req, res) => {
    console.log('Cliente conectado a SSE');
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    
    // Enviar mensaje de bienvenida
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conectado a SSE' })}\n\n`);
    
    // Escuchar notificaciones de PostgreSQL
    pgClient.query('LISTEN friends_update');
    
    const listener = (msg) => {
        try {
            const payload = JSON.parse(msg.payload);
            console.log('Cambio detectado en PostgreSQL:', payload);
            
            // Enviar el evento al cliente
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
        } catch (error) {
            console.error('Error al procesar notificación:', error);
        }
    };
    
    pgClient.on('notification', listener);
    
    // Enviar ping cada 30 segundos para mantener la conexión viva
    const pingInterval = setInterval(() => {
        res.write(`: ping\n\n`);
    }, 30000);
    
    req.on('close', () => {
        console.log('Cliente desconectado de SSE');
        clearInterval(pingInterval);
        pgClient.removeListener('notification', listener);
    });
});

//INSERT desde la web
app.post('/insert', async (req, res) => {
    const { name, gender } = req.body;
    console.log(`📝 Insertando: ${name} (${gender})`);
    
    // Validar que el nombre no esté vacío
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    try {
        const result = await pgClient.query(
            'INSERT INTO my_friends (name, gender) VALUES ($1, $2) RETURNING *',
            [name.trim(), gender || 'No especificado']
        );
        console.log('Insertado correctamente:', result.rows[0]);
        res.json({ 
            success: true, 
            data: result.rows[0],
            message: 'Amigo agregado correctamente'
        });
    } catch (err) {
        console.error('Error al insertar:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Obtener todos los registros (opcional, para consultar)
app.get('/friends', async (req, res) => {
    try {
        const result = await pgClient.query('SELECT * FROM my_friends ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener registros:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Health check (para verificar que el servidor está vivo)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend SSE corriendo en http://localhost:${PORT}`);
    console.log(`Endpoint SSE: http://localhost:${PORT}/events`);
    console.log(`Endpoint INSERT: http://localhost:${PORT}/insert`);
    console.log(`Endpoint GET: http://localhost:${PORT}/friends`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});