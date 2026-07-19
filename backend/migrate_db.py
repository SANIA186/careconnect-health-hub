import sqlite3

def migrate():
    print("Starting safe migration of database...")
    db_path = "instance/app.db"
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Try adding each column, catch OperationalError if it already exists
    columns_to_add = [
        ("symptoms", "TEXT"),
        ("volunteer_notes", "TEXT"),
        ("bp", "VARCHAR(20)"),
        ("pulse", "VARCHAR(20)"),
        ("temperature", "VARCHAR(20)"),
        ("weight", "VARCHAR(20)")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE patients ADD COLUMN {col_name} {col_type};")
            print(f"Added column {col_name} successfully.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding {col_name}: {e}")
                
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
