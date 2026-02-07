from sqlmodel import Session, select, create_engine
from models import User
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found!")
    exit(1)

engine = create_engine(DATABASE_URL)

def list_users():
    with Session(engine) as session:
        statement = select(User)
        users = session.exec(statement).all()
        
        print(f"{'ID':<5} {'Username':<20} {'Email':<30}")
        print("-" * 60)
        for user in users:
            print(f"{user.id:<5} {user.username:<20} {user.email:<30}")

if __name__ == "__main__":
    list_users()
