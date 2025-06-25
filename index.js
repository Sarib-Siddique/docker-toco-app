import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

app.get("/todos", async (req, res) => {
  try {
    const todos = await pool.query("SELECT * FROM todo_table");
    res.json(todos.rows);
  } catch (error) {
    res.json({ error });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { desc, completed } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo_table (todo_dec, todo_completed) VALUES ($1, $2) RETURNING todo_id, todo_dec, todo_completed",
      [desc, completed]
    );
    res.status(201).json({
      success: true,
      message: "Todo added successfully",
      data: newTodo.rows[0],
    });
  } catch (error) {
    console.error("Error inserting todo:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the todo",
      error: error.message,
    });
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query(
      "SELECT * FROM todo_table WHERE todo_id = $1",
      [id]
    );
    if (todo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }
    res.status(200).json({
      success: true,
      data: todo.rows[0],
    });
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the todo",
      error: error.message,
    });
  }
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { desc, completed } = req.body;
  try {
    const updatedTodo = await pool.query(
      "UPDATE todo_table SET todo_dec = $1, todo_completed = $2 WHERE todo_id = $3 RETURNING *",
      [desc, completed, id]
    );
    if (updatedTodo.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({
      updatedTodo: updatedTodo.rows[0],
      msg: "Todo updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTodo = await pool.query(
      "DELETE FROM todo_table WHERE todo_id = $1 RETURNING *",
      [id]
    );
    if (deletedTodo.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ msg: "Todo deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/todos", async (req, res) => {
  try {
    await pool.query("DELETE FROM todo_table");
    res.json({ msg: "All todos deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting all todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
