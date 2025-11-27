const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Страница логина
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Страница админки
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Страница пользователя  
app.get('/user.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'user.html'));
});

// Подключение к PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: '54side',
    password: '12345',
    port: 5432,
});

// Логин
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        
        if (result.rows.length === 0) {
            return res.json({ success: false, message: 'Неверный email или пароль' });
        }
        
        const user = result.rows[0];
        
        if (user.is_admin) {
            res.json({ 
                success: true, 
                redirect: '/admin.html',
                email: user.email
            });
        } else {
            res.json({ 
                success: true, 
                redirect: '/user.html',
                email: user.email
            });
        }
        
    } catch (error) {
        res.json({ success: false, message: 'Ошибка сервера' });
    }
});

// Регистрация
app.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
            [email, password, name]
        );
        
        res.json({ success: true, message: 'Регистрация успешна!' });
        
    } catch (error) {
        res.json({ success: false, message: 'Email уже занят' });
    }
});

// Добавь эти роуты в server.js после существующих

// Получить все места
app.get('/api/places', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM places ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить место
app.post('/api/places', async (req, res) => {
    const { title, category, description, image, mapLink, featured } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO places (title, category, description, image, map_link, featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, category, description, image, mapLink, featured || false]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить место
app.put('/api/places/:id', async (req, res) => {
    const { id } = req.params;
    const { title, category, description, image, mapLink, featured } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE places SET title=$1, category=$2, description=$3, image=$4, map_link=$5, featured=$6 WHERE id=$7 RETURNING *',
            [title, category, description, image, mapLink, featured, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить место
app.delete('/api/places/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM places WHERE id=$1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});