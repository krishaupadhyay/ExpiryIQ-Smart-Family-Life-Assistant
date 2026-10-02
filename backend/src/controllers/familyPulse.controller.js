const FamilyEvent = require('../models/familyEvent.model');
const FamilyTask = require('../models/familyTask.model');
const Birthday = require('../models/birthday.model');

// ===============================
// EVENTS
// ===============================

const getEvents = async (req, res) => {
  try {
    const events = await FamilyEvent.find({ userId: req.userId }).sort({ date: 1 });
    return res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ message: 'Server error while fetching events.' });
  }
};

const addEvent = async (req, res) => {
  try {
    const { title, date, type, memberName } = req.body;
    if (!title || !date) return res.status(400).json({ message: 'Title and date are required.' });

    const event = await FamilyEvent.create({
      userId: req.userId,
      title: title.trim(),
      date: new Date(date),
      type: type?.trim() || 'General',
      memberName: memberName?.trim() || ''
    });
    return res.status(201).json({ message: 'Event added successfully.', event });
  } catch (error) {
    console.error('Add event error:', error);
    return res.status(500).json({ message: 'Server error while adding event.' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const result = await FamilyEvent.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Event not found.' });
    return res.json({ message: 'Event removed successfully.' });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ message: 'Server error while deleting event.' });
  }
};

// ===============================
// TASKS
// ===============================

const getTasks = async (req, res) => {
  try {
    const tasks = await FamilyTask.find({ userId: req.userId }).sort({ due: 1 });
    return res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Server error while fetching tasks.' });
  }
};

const addTask = async (req, res) => {
  try {
    const { text, due, priority, memberName } = req.body;
    if (!text || !due) return res.status(400).json({ message: 'Task text and due date are required.' });

    const task = await FamilyTask.create({
      userId: req.userId,
      text: text.trim(),
      due: new Date(due),
      priority: priority || 'medium',
      memberName: memberName?.trim() || ''
    });
    return res.status(201).json({ message: 'Task added successfully.', task });
  } catch (error) {
    console.error('Add task error:', error);
    return res.status(500).json({ message: 'Server error while adding task.' });
  }
};

const toggleTask = async (req, res) => {
  try {
    const task = await FamilyTask.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    task.done = !task.done;
    await task.save();
    return res.json({ message: 'Task updated.', task });
  } catch (error) {
    console.error('Toggle task error:', error);
    return res.status(500).json({ message: 'Server error while updating task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const result = await FamilyTask.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Task not found.' });
    return res.json({ message: 'Task removed successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error while deleting task.' });
  }
};

// ===============================
// BIRTHDAYS
// ===============================

const getBirthdays = async (req, res) => {
  try {
    const birthdays = await Birthday.find({ userId: req.userId }).sort({ date: 1 });
    return res.json({ birthdays });
  } catch (error) {
    console.error('Get birthdays error:', error);
    return res.status(500).json({ message: 'Server error while fetching birthdays.' });
  }
};

const addBirthday = async (req, res) => {
  try {
    const { name, date, relation } = req.body;
    if (!name || !date) return res.status(400).json({ message: 'Name and date are required.' });

    const birthday = await Birthday.create({
      userId: req.userId,
      name: name.trim(),
      date: new Date(date),
      relation: relation?.trim() || ''
    });
    return res.status(201).json({ message: 'Birthday added successfully.', birthday });
  } catch (error) {
    console.error('Add birthday error:', error);
    return res.status(500).json({ message: 'Server error while adding birthday.' });
  }
};

const deleteBirthday = async (req, res) => {
  try {
    const result = await Birthday.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Birthday not found.' });
    return res.json({ message: 'Birthday removed successfully.' });
  } catch (error) {
    console.error('Delete birthday error:', error);
    return res.status(500).json({ message: 'Server error while deleting birthday.' });
  }
};

module.exports = {
  getEvents, addEvent, deleteEvent,
  getTasks, addTask, toggleTask, deleteTask,
  getBirthdays, addBirthday, deleteBirthday
};
