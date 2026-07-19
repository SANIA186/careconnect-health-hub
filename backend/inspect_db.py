import sqlite3
import pandas as pd

conn = sqlite3.connect('instance/app.db')
print('--- TABLES ---')
try:
    tables = pd.read_sql_query("SELECT name FROM sqlite_master WHERE type='table';", conn)
    print(tables)
except Exception as e:
    print(e)
print('--- USERS ---')
try:
    df = pd.read_sql_query('SELECT id, full_name, email, role FROM users', conn)
    print(df)
except Exception as e:
    print(e)
