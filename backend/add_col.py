import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

with engine.connect() as conn:
    # Postgres table names from SQLModel are usually lowercase
    conn.execute(text('ALTER TABLE revenuedata ADD COLUMN user_id INTEGER REFERENCES "user"(id);'))
    conn.commit()
    print("Column added successfully!")
