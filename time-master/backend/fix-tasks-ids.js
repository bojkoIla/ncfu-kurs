const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/time-master';

// Схемы
const projectSchema = new mongoose.Schema({}, { strict: false });
const taskSchema = new mongoose.Schema({}, { strict: false });

const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

async function fixTasks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Получить все проекты
    const projects = await Project.find({});
    console.log('Projects:', projects.map(p => ({ id: p._id.toString(), name: p.name })));

    if (projects.length === 0) {
      console.log('No projects found. Create a project first.');
      return;
    }

    const defaultProjectId = projects[0]._id;
    console.log(`Using default project ID: ${defaultProjectId}`);

    // Найти задачи с проблемным project (не ObjectId)
    const tasksWithStringProject = await Task.find({
      $or: [
        { project: { $type: 'string' } },
        { project: { $exists: false } },
        { project: null }
      ]
    });

    console.log(`Found ${tasksWithStringProject.length} tasks with invalid project`);

    // Обновить каждую задачу
    let updatedCount = 0;
    for (const task of tasksWithStringProject) {
      // Проверить, существует ли проект с таким ID
      let projectId = defaultProjectId;

      if (task.project && typeof task.project === 'string') {
        // Попробовать найти проект по строковому ID
        const foundProject = await Project.findById(task.project);
        if (foundProject) {
          projectId = foundProject._id;
        }
      }

      task.project = projectId;
      await task.save();
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} tasks`);

    // Проверить результат
    const remainingIssues = await Task.find({
      $or: [
        { project: { $type: 'string' } },
        { project: { $exists: false } },
        { project: null }
      ]
    });

    console.log(`Remaining issues: ${remainingIssues.length}`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixTasks();