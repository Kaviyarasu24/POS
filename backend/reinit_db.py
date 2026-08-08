import os
import pymysql
from dotenv import load_dotenv

# Load .env configurations
backend_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path)

db_host = os.getenv("DB_HOST", "localhost")
db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "root")

print("Connecting to MySQL server...")
try:
    connection = pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        autocommit=True
    )
except Exception as e:
    print(f"Error connecting to MySQL: {e}")
    exit(1)

try:
    with connection.cursor() as cursor:
        print("Recreating database 'smartpossystem'...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS smartpossystem;")
        cursor.execute("USE smartpossystem;")

        schema_path = os.path.join(backend_dir, "schema.sql")
        print(f"Reading SQL commands from schema.sql...")
        with open(schema_path, "r", encoding="utf-8") as f:
            sql_file = f.read()

        commands = sql_file.split(";")
        for idx, command in enumerate(commands):
            cmd_stripped = command.strip()
            if not cmd_stripped:
                continue
            if cmd_stripped.startswith("USE") or cmd_stripped.startswith("CREATE DATABASE"):
                continue
            
            try:
                cursor.execute(cmd_stripped)
            except Exception as cmd_err:
                print(f"Statement {idx + 1} note: {cmd_err}")

        print("Database schema and seed data successfully initialized!")
finally:
    connection.close()
