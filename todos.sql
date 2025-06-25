CREATE TABLE todo_table (
    todo_id SERIAL PRIMARY KEY,
    todo_dec TEXT NOT NULL,
    todo_completed BOOLEAN NOT NULL
);