const Notification = require('../models/notification.model');
 
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
 
    return res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Server error while fetching notifications.' });
  }
};
 
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
 
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
 
    return res.json({ notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};
 
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};
 
module.exports = { getNotifications, markAsRead, markAllAsRead };
 
