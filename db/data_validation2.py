import mysql.connector
import json
import os
from datetime import datetime

def get_primary_keys(connection, table_name):
    """
    Retrieves the primary key column names for the given table. If no primary key exists,
    return unique indexed columns as a fallback.
    """
    cursor = connection.cursor()
    query = f"SHOW KEYS FROM {table_name} WHERE Key_name = 'PRIMARY';"
    cursor.execute(query)
    result = cursor.fetchall()
    cursor.close()
    if result:
        return [row[4] for row in result]  # The 5th column in SHOW KEYS result is the column name
    else:
        # Fallback to unique indexed columns (MUL) if no primary key exists
        cursor = connection.cursor()
        query = f"SHOW INDEX FROM {table_name};"
        cursor.execute(query)
        index_result = cursor.fetchall()
        cursor.close()
        
        # Deduplicate indexed columns
        indexed_columns = sorted(set(row[4] for row in index_result if row[2] != 'PRIMARY'))
        if indexed_columns:
            print(f"Warning: Table '{table_name}' has no primary key. Using unique indexed columns: {indexed_columns}")
            return indexed_columns
        else:
            raise ValueError(f"Table '{table_name}' has no primary or indexed columns to use as a key.")


def fetch_all_rows(connection, table_name, primary_keys):
    """
    Fetches all rows from the given table, ordered by the primary keys.
    """
    cursor = connection.cursor(dictionary=True)
    if primary_keys:
        order_by_clause = ", ".join(primary_keys)
        query = f"SELECT * FROM {table_name} ORDER BY {order_by_clause};"
    else:
        query = f"SELECT * FROM {table_name};"
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    return rows

def check_only_in_gcp(rows_gcp, rows_aws, keys=None):
    """
    Identifies rows present in GCP but missing in AWS.
    If no keys are specified, compare entire rows.
    """
    if keys:
        def row_to_key(row):
            return tuple(row[key] for key in keys)

        gcp_dict = {row_to_key(row): row for row in rows_gcp}
        aws_dict = {row_to_key(row): row for row in rows_aws}
    else:
        gcp_set = {tuple(row.items()) for row in rows_gcp}
        aws_set = {tuple(row.items()) for row in rows_aws}
        gcp_dict = {tuple(row.items()): row for row in rows_gcp}
        aws_dict = {tuple(row.items()): row for row in rows_aws}

    # Find rows present in GCP but not in AWS
    only_in_gcp = [gcp_dict[key] for key in gcp_dict if key not in aws_dict]
    return only_in_gcp

def serialize_datetime(rows):
    """
    Converts datetime objects in rows to ISO format strings.
    """
    for row in rows:
        for key, value in row.items():
            if isinstance(value, datetime):
                row[key] = value.isoformat()
    return rows

def save_data_to_files(base_path, table_name, rows_gcp, rows_aws, missing_in_aws):
    """
    Saves table data and differences to JSON files under the specified base path.
    """
    table_path = os.path.join(base_path, table_name)
    os.makedirs(table_path, exist_ok=True)

    # Save GCP data
    gcp_file = os.path.join(table_path, "gcp.json")
    with open(gcp_file, "w") as json_file:
        json.dump(rows_gcp, json_file, indent=4)

    # Save AWS data
    aws_file = os.path.join(table_path, "aws.json")
    with open(aws_file, "w") as json_file:
        json.dump(rows_aws, json_file, indent=4)

    # Save differences
    diff_file = os.path.join(table_path, "missing_in_aws.json")
    with open(diff_file, "w") as json_file:
        json.dump(missing_in_aws, json_file, indent=4)

# Database connections
conn_gcp = mysql.connector.connect(
    host="34.126.212.167", user="root", password="Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU", database="interface"
)
conn_aws = mysql.connector.connect(
    host="beta-bytescare.cd5ys33hnzln.ap-south-1.rds.amazonaws.com", user="root", password="Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU", database="interface"
)

# List of tables to process
table_names = ["asset"]  # Add more table names as needed
base_data_path = "data"

try:
    for table_name in table_names:
        try:
            # Fetch the primary or fallback keys for the table
            primary_keys = get_primary_keys(conn_gcp, table_name)
            if not primary_keys:
                print(f"Skipping table '{table_name}' as no suitable key was found.")
                continue

            print(f"Processing table '{table_name}' with keys {primary_keys}.")
            
            # Fetch rows from both databases
            rows_gcp = fetch_all_rows(conn_gcp, table_name, primary_keys)
            rows_aws = fetch_all_rows(conn_aws, table_name, primary_keys)

            # Serialize datetime objects for JSON compatibility
            rows_gcp = serialize_datetime(rows_gcp)
            rows_aws = serialize_datetime(rows_aws)

            # Identify rows present in GCP but missing in AWS
            missing_in_aws = check_only_in_gcp(rows_gcp, rows_aws, primary_keys)

            # Save data to JSON files
            save_data_to_files(base_data_path, table_name, rows_gcp, rows_aws, missing_in_aws)

            # Print summary
            if missing_in_aws:
                print(f"Rows present in GCP but missing in AWS for table '{table_name}' saved to 'missing_in_aws.json'.")
            else:
                print(f"No rows are missing in AWS for table '{table_name}'.")
        except ValueError as e:
            print(f"Error processing table '{table_name}': {e}")

finally:
    # Close the database connections
    conn_gcp.close()
    conn_aws.close()
