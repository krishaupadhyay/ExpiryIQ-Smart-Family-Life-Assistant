const express = require('express');
const {
  getEvents, addEvent, deleteEvent,
  getTasks, addTask, toggleTask, deleteTask,
  getBirthdays, addBirthday, deleteBirthday
} = require('../controllers/familyPulse.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/events', requireAuth, getEvents);
router.post('/events', requireAuth, addEvent);
router.delete('/events/:id', requireAuth, deleteEvent);

router.get('/tasks', requireAuth, getTasks);
router.post('/tasks', requireAuth, addTask);
router.patch('/tasks/:id/toggle', requireAuth, toggleTask);
router.delete('/tasks/:id', requireAuth, deleteTask);

router.get('/birthdays', requireAuth, getBirthdays);
router.post('/birthdays', requireAuth, addBirthday);
router.delete('/birthdays/:id', requireAuth, deleteBirthday);

module.exports = router;
