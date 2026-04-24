// run with: node fix-tasks.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/time-master';

const TaskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', TaskSchema);

async function fixTasks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Получите ID первого проекта
    const projects = await mongoose.connection.db.collection('projects').find({}).toArray();
    if (projects.length === 0) {
      console.log('No projects found');
      return;
    }

    const defaultProjectId = projects[0]._id;
    console.log('Default project ID:', defaultProjectId);

    // Обновите все задачи без проекта
    const result = await Task.updateMany(
      { project: { $exists: false } },
      { $set: { project: defaultProjectId } }
    );

    console.log(`Updated ${result.modifiedCount} tasks`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixTasks();