const request = require('supertest');
const app = require('./index');

describe('Task Manager API Tests', () => {
    
    it('GET / should return welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe("Task Manager API is running inside Docker!");
    });

    it('GET /tasks should return a list of tasks', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        expect(res.body[0].title).toBe("Learn Docker layers");
    });
    
});
