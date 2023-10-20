const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
// ...
app.use(cors()); // Use CORS middleware

const db = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.ROOT,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
});

const port = process.env.PORT;

// Establish a connection to the MySQL database
db.connect((err) => {
	if (err) {
		console.error('Error connecting to the database:', err);
		throw err;
	}
	console.log('Connected to the MySQL database');
});

// Handle the POST request to create a task
app.use(express.json()); // Add this line to parse JSON request bodies

app.post('/api/createTask', (req, res) => {
	const { taskName, taskDescription, taskType } = req.body;

	// Insert the taskData into the database
	db.query(
		'INSERT INTO tasks (task_name, task_description, task_type) VALUES (?, ?, ?)',
		[taskName, taskDescription, taskType],
		(err, results) => {
			if (err) {
				console.error('Error inserting task:', err);
				res.status(500).json({ error: 'Error creating task' });
			} else {
				console.log('Task created successfully');
				res.json({ message: 'Task created successfully' });
			}
		}
	);
});

// DELETE request to delete selected tasks by IDs
app.delete('/api/deleteTasks', (req, res) => {
	const { taskIds } = req.body;

	// Check if taskIds is an array and not empty
	if (!Array.isArray(taskIds) || taskIds.length === 0) {
		return res.status(400).json({ error: 'Invalid task IDs' });
	}

	// Convert taskIds to a comma-separated string for SQL
	const taskIdsString = taskIds.join(',');

	// Delete tasks with matching IDs from the database
	db.query(
		`DELETE FROM tasks WHERE id IN (${taskIdsString})`,
		(err, results) => {
			if (err) {
				console.error('Error deleting tasks:', err);
				res.status(500).json({ error: 'Error deleting tasks' });
			} else {
				console.log('Selected tasks deleted');
				res.json({ message: 'Selected tasks deleted' });
			}
		}
	);
});

// DELETE request to delete a single task by its ID
app.delete('/api/deleteTask/:taskId', (req, res) => {
	const taskId = req.params.taskId;

	// Perform the deletion in your MySQL database
	db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, results) => {
		if (err) {
			console.error('Error deleting task:', err);
			res.status(500).json({ error: 'Error deleting task' });
		} else {
			console.log('Task deleted successfully');
			res.json({ message: 'Task deleted successfully' });
		}
	});
});

// GET request to fetch tasks
app.get('/api/tasks', (req, res) => {
	db.query('SELECT * FROM tasks', (err, results) => {
		if (err) {
			console.error('Error fetching tasks:', err);
			res.status(500).json({ error: 'Error fetching tasks' });
		} else {
			console.log('Tasks fetched successfully');
			res.json(results);
		}
	});
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
