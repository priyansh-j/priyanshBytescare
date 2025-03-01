import mysql.connector
import json
import os
from datetime import datetime

def get_primary_key(connection, table_name):
    """
    Retrieves the primary key column name for the given table.
    """
    cursor = connection.cursor()
    query = f"SHOW KEYS FROM {table_name} WHERE Key_name = 'PRIMARY';"
    cursor.execute(query)
    result = cursor.fetchone()
    cursor.close()
    if result:
        return result[4]  # The 5th column in SHOW KEYS result is the column name
    else:
        raise ValueError(f"No primary key found for table {table_name}")

def fetch_all_rows(connection, table_name, primary_key):
    """
    Fetches all rows from the given table, ordered by the primary key.
    """
    cursor = connection.cursor(dictionary=True)
    query = f"SELECT * FROM {table_name} ORDER BY {primary_key};"
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    return rows

def check_only_in_gcp(rows_gcp, rows_aws):
    """
    Identifies rows present in GCP but missing in AWS.
    """
    gcp_set = {tuple(row.items()) for row in rows_gcp}
    aws_set = {tuple(row.items()) for row in rows_aws}

    # Find rows present in GCP but not in AWS
    only_in_gcp = gcp_set - aws_set
    return [dict(row) for row in only_in_gcp]

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
    # gcp_file = os.path.join(table_path, "gcp.json")
    # with open(gcp_file, "w") as json_file:
    #     json.dump(rows_gcp, json_file, indent=4)

    # Save AWS data
    # aws_file = os.path.join(table_path, "aws.json")
    # with open(aws_file, "w") as json_file:
    #     json.dump(rows_aws, json_file, indent=4)

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
table_names = ["asset","asset_info"]  # Add more table names as needed
base_data_path = "data"

try:
    for table_name in table_names:
        try:
            # Fetch the primary key for the table
            primary_key = get_primary_key(conn_gcp, table_name)
            print(f"Processing table '{table_name}' with primary key '{primary_key}'.")

            # Fetch rows from both databases
            rows_gcp = fetch_all_rows(conn_gcp, table_name, primary_key)
            rows_aws = fetch_all_rows(conn_aws, table_name, primary_key)

            # Serialize datetime objects for JSON compatibility
            rows_gcp = serialize_datetime(rows_gcp)
            rows_aws = serialize_datetime(rows_aws)

            # Identify rows present in GCP but missing in AWS
            missing_in_aws = check_only_in_gcp(rows_gcp, rows_aws)

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











# import mysql.connector
# import json
# from datetime import datetime

# def get_primary_key(connection, table_name):
#     """
#     Retrieves the primary key column name for the given table.
#     """
#     cursor = connection.cursor()
#     query = f"SHOW KEYS FROM {table_name} WHERE Key_name = 'PRIMARY';"
#     cursor.execute(query)
#     result = cursor.fetchone()
#     cursor.close()
#     if result:
#         return result[4]  # The 5th column in SHOW KEYS result is the column name
#     else:
#         raise ValueError(f"No primary key found for table {table_name}")

# def fetch_all_rows(connection, table_name, primary_key):
#     """
#     Fetches all rows from the given table, ordered by the primary key.
#     """
#     cursor = connection.cursor(dictionary=True)
#     query = f"SELECT * FROM {table_name} ORDER BY {primary_key};"
#     cursor.execute(query)
#     rows = cursor.fetchall()
#     cursor.close()
#     return rows

# def check_only_in_gcp(rows_gcp, rows_aws):
#     """
#     Identifies rows present in GCP but missing in AWS.
#     """
#     gcp_set = {tuple(row.items()) for row in rows_gcp}
#     aws_set = {tuple(row.items()) for row in rows_aws}

#     # Find rows present in GCP but not in AWS
#     only_in_gcp = gcp_set - aws_set
#     return [dict(row) for row in only_in_gcp]

# def serialize_datetime(rows):
#     """
#     Converts datetime objects in rows to ISO format strings.
#     """
#     for row in rows:
#         for key, value in row.items():
#             if isinstance(value, datetime):
#                 row[key] = value.isoformat()
#     return rows

# # Database connections
# conn_gcp = mysql.connector.connect(
#     host="34.126.212.167", user="root", password="Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU", database="interface"
# )
# conn_aws = mysql.connector.connect(
#     host="beta-bytescare.cd5ys33hnzln.ap-south-1.rds.amazonaws.com", user="root", password="Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU", database="interface"
# )

# # Table to validate
# table_name = "map"

# try:
#     # Dynamically fetch the primary key for the table
#     primary_key = get_primary_key(conn_gcp, table_name)
#     print(f"Primary Key for table '{table_name}' is '{primary_key}'")

#     # Fetch rows from both databases
#     rows_gcp = fetch_all_rows(conn_gcp, table_name, primary_key)
#     rows_aws = fetch_all_rows(conn_aws, table_name, primary_key)

#     # Serialize datetime objects for JSON compatibility
#     rows_gcp = serialize_datetime(rows_gcp)
#     rows_aws = serialize_datetime(rows_aws)

#     # Save GCP data to a JSON file
#     gcp_file = "gcp.json"
#     with open(gcp_file, "w") as json_file:
#         json.dump(rows_gcp, json_file, indent=4)
#     print(f"Entire table data from GCP saved to '{gcp_file}'.")

#     # Save AWS data to a JSON file
#     aws_file = "aws.json"
#     with open(aws_file, "w") as json_file:
#         json.dump(rows_aws, json_file, indent=4)
#     print(f"Entire table data from AWS saved to '{aws_file}'.")

#     # Identify rows present in GCP but missing in AWS
#     missing_in_aws = check_only_in_gcp(rows_gcp, rows_aws)

#     # Save the differences to a JSON file
#     diff_file = "missing_in_aws.json"
#     with open(diff_file, "w") as json_file:
#         json.dump(missing_in_aws, json_file, indent=4)

#     # Print summary
#     if missing_in_aws:
#         print(f"Rows present in GCP but missing in AWS ({len(missing_in_aws)} rows) have been saved to '{diff_file}'.")
#     else:
#         print("No rows are missing in AWS!")
# except ValueError as e:
#     print(e)
# finally:
#     # Close the database connections
#     conn_gcp.close()
#     conn_aws.close()














# import mysql.connector


# def fetch_all_rows(connection, table_name):
#     """
#     Fetches all rows from the given table, ordered by the primary key.
#     """
#     cursor = connection.cursor(dictionary=True)
#     query = f"SELECT * FROM {table_name} ORDER BY primary_key;"
#     cursor.execute(query)
#     rows = cursor.fetchall()
#     cursor.close()
#     return rows

# def check_only_in_gcp(rows_gcp, rows_aws):
#     """
#     Identifies rows present in GCP but missing in AWS.
#     """
#     gcp_set = {tuple(row.items()) for row in rows_gcp}
#     aws_set = {tuple(row.items()) for row in rows_aws}import mysql.connector

# def fetch_all_rows(connection, table_name):
#     """
#     Fetches all rows from the given table, ordered by the primary key.
#     """
#     cursor = connection.cursor(dictionary=True)
#     query = f"SELECT * FROM {table_name} ORDER BY primary_key;"
#     cursor.execute(query)
#     rows = cursor.fetchall()
#     cursor.close()
#     return rows

# def check_only_in_gcp(rows_gcp, rows_aws):
#     """
#     Identifies rows present in GCP but missing in AWS.
#     """
#     gcp_set = {tuple(row.items()) for row in rows_gcp}
#     aws_set = {tuple(row.items()) for row in rows_aws}

#     # Find rows that exist in GCP but not in AWS
#     only_in_gcp = gcp_set - aws_set
#     return [dict(row) for row in only_in_gcp]

# # Database connections
# conn_gcp = mysql.connector.connect(
#     host="34.126.212.167", user="root", password="Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU", database="interface"
# )
# conn_aws = mysql.connector.connect(
#     host="beta-bytescare.cd5ys33hnzln.ap-south-1.rds.amazonaws.com", user="root", password="Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU", database="interface"
# )

# # Table to validate
# table_name = "your_table_name"

# # Fetch rows from both databases
# rows_gcp = fetch_all_rows(conn_gcp, table_name)
# rows_aws = fetch_all_rows(conn_aws, table_name)

# # Identify rows missing in AWS
# missing_in_aws = check_only_in_gcp(rows_gcp, rows_aws)

# # Print missing rows
# if missing_in_aws:
#     print(f"Rows present in GCP but missing in AWS ({len(missing_in_aws)} rows):")
#     for row in missing_in_aws:
#         print(row)
# else:
#     print("No rows are missing in AWS!")

# # Close connections
# conn_gcp.close()
# conn_aws.close()


#     # Find rows that exist in GCP but not in AWS
#     only_in_gcp = gcp_set - aws_set
#     return [dict(row) for row in only_in_gcp]

# # Database connections
# conn_gcp = mysql.connector.connect(
#     host="gcp_host", user="username", password="password", database="db_name"
# )
# conn_aws = mysql.connector.connect(
#     host="aws_host", user="username", password="password", database="db_name"
# )

# # Table to validate
# table_name = "active_history"

# # Fetch rows from both databases
# rows_gcp = fetch_all_rows(conn_gcp, table_name)
# rows_aws = fetch_all_rows(conn_aws, table_name)

# # Identify rows missing in AWS
# missing_in_aws = check_only_in_gcp(rows_gcp, rows_aws)

# # Print missing rows
# if missing_in_aws:
#     print(f"Rows present in GCP but missing in AWS ({len(missing_in_aws)} rows):")
#     for row in missing_in_aws:
#         print(row)
# else:
#     print("No rows are missing in AWS!")

# # Close connections
# conn_gcp.close()
# conn_aws.close()
