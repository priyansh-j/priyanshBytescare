from enum import unique
from flask import Flask, render_template, request,redirect,abort,jsonify,send_file,Response
import boto3
import pymysql.cursors
import base64
import time
from urllib.parse import urlparse
import re
import hashlib
application = Flask(__name__)

from werkzeug.utils import secure_filename
from hashlib import md5
import json
import os
import requests
from flask_cors import CORS, cross_origin
import csv
from googleapiclient.discovery import build
from google.oauth2 import service_account

CORS(application, support_credentials=True)
application.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(application, resources={r"/pdf_combined_paper": {"origins": "https://main.d2cgj97orcq5ob.amplifyapp.com/"}})

s3 = boto3.client('s3',
                    aws_access_key_id = os.environ.get('ACCESS_KEY'),
                    aws_secret_access_key = os.environ.get('SECRET_ACCESS_KEY')
                )

BUCKET_NAME='text-marker'
RATE_LIMIT_REQUESTS = 15000
RATE_LIMIT_DURATION = 100

# OAuth 2.0 scopes required for accessing Drive resources
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

## Method to insert data into the textmarker database ##
def insert_to_db(encryption_id, user_id, access_key):
    connection = pymysql.connect(host=os.environ.get('DBHOST'),
                                 user=os.environ.get('DBUSER'),
                                 password=os.environ.get('DBPASSWORD'),
                                 database=os.environ.get('DBDATABASE'),
                                 charset='utf8mb4',
                                 cursorclass=pymysql.cursors.DictCursor
                                )

    try:
        with connection.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO `user_data` (`encryption_id`, `user_id`, `access_key`, `timestamp`) VALUES (%s, %s, %s, NOW())"
            cursor.execute(sql, (encryption_id, user_id, access_key))

        connection.commit()
    finally:
        connection.close()

## Method to return the file type based on mime type ##
def get_file_type(mime_type):
    if mime_type == 'application/vnd.google-apps.folder':
        return 'Folder'
    elif 'image/' in mime_type:
        return 'Image'
    elif 'audio/' in mime_type:
        return 'Audio'
    elif 'video/' in mime_type:
        return 'Video'
    elif 'application/vnd.google-apps.' in mime_type:
        return 'Google App'
    elif 'application/pdf' == mime_type:
        return 'PDF'
    elif 'text/' in mime_type:
        return 'Text'
    elif 'application/vnd.openxmlformats-officedocument.presentationml.presentation' == mime_type:
        return 'PPT'
    elif 'application/json' == mime_type:
        return 'JSON'
    elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' == mime_type:
        return 'DOCX'
    elif 'text/csv' == mime_type:
        return 'CSV'
    else:
        return 'Other'
    

def list_files_and_folders(drive_link, parent_folder_name='', csv_writer=None):

    # Extract the folder ID from the drive link
    folder_id = os.path.basename(drive_link)
    # Create a service instance for the Google Drive API
    credentials_path = 'credentials.json'
    # Load credentials from the JSON file
    credentials = service_account.Credentials.from_service_account_file(credentials_path, scopes=['https://www.googleapis.com/auth/drive.readonly'])
    service = build('drive', 'v3', credentials=credentials)
    # Retrieve the list of files and folders in the specified folder
    results = service.files().list(q=f"'{folder_id}' in parents", fields="files(name, mimeType, id, size, webViewLink)").execute()
    # print(results)
    items = results.get('files', [])
    if not items:
        print(f'No files or folders found in {parent_folder_name}.')
    else:
        for item in items:
            name = item['name']
            mime_type = item['mimeType']
            file_type = get_file_type(mime_type)
            if mime_type == 'application/vnd.google-apps.folder':
                folder_data = [parent_folder_name, name, '', '', '', '', file_type]
                if 'id' in item:
                    folder_link = f"https://drive.google.com/drive/folders/{item['id']}"
                    folder_data[2] = folder_link
                    if csv_writer:
                        csv_writer.writerow(folder_data)
                    list_files_and_folders(folder_link, parent_folder_name=f"{parent_folder_name}/{name}", csv_writer=csv_writer)
                else:
                    print(f"Skipping folder '{name}' due to missing ID.")
            else:
                size = item.get('size', 'Unknown')
                url = item.get('webViewLink', 'Not available')
                file_id = item.get('id', 'Unknown')
                file_data = [parent_folder_name, '', name, size, url, file_type]
                if csv_writer:
                    csv_writer.writerow(file_data)

## Method to check whether the step function has completed execution and return the reponse when done ##
def wait_for_execution_completion(client, execution_arn):
    # Custom waiter function to wait for Step Function execution to complete
    while True:
        response = client.describe_execution(executionArn=execution_arn)
        status = response['status']
        if status == 'SUCCEEDED':
            return True
        elif status in ('FAILED', 'TIMED_OUT', 'ABORTED', 'TIMING_OUT', 'FAILED', 'CANCELLED'):
            return False
        time.sleep(5)

## Method to invoke the step function ##
def invoke_step_function(step_function_arn, input_data):
    # Create a Boto3 client for Step Functions with explicit credentials and region
    client = boto3.client('stepfunctions',
                          region_name = 'ap-south-1', 
                          aws_access_key_id = os.environ.get('ACCESS_KEY'),
                          aws_secret_access_key = os.environ.get('SECRET_ACCESS_KEY')
                        )

    # Invoke the Step Function
    response = client.start_execution(
        stateMachineArn=step_function_arn,
        input=json.dumps(input_data)
    )

    # Retrieve the execution ARN
    execution_arn = response['executionArn']

    # Wait for the execution to complete
    if wait_for_execution_completion(client, execution_arn):
        response = client.describe_execution(executionArn=execution_arn)
        output_data = json.loads(response['output'])
        return output_data
    else:
        return None

## Method to extract the channel from the URL ##
def get_channel_from_link(link):
    parsed_link = urlparse(link)
    parts = parsed_link.path.split('/')
    # If the channel is 'c', then we return the next part as the channel
    if parts[1] == 'c':
        return parts[2]
    else:
        return parts[1]  # Extract the channel name from the path
    
## Method to invoke the lambda functions and return response ##
def invoke_lambda_function(input_data, function_name):
    client = boto3.client(
                            'lambda',
                            region_name='ap-south-1',
                            aws_access_key_id = os.environ.get('ACCESS_KEY'),
                            aws_secret_access_key = os.environ.get('SECRET_ACCESS_KEY')
                        )
    payload = input_data
    response = client.invoke(
        FunctionName=function_name,
        Payload=json.dumps(payload)
    )
    output = response['Payload'].read().decode('utf-8')
    parsed_output = json.loads(output)
    return parsed_output

################################### URL PATHS ###########################################

############################### GOOGLE #################################

## Google drive - Used to extract the links of all the files in that drive ##
@application.route('/google_drive', methods=['GET', 'POST'])
def google_drive():
    if request.method == 'POST':
        drive_link = request.form.get('drive_link')
        output_file = 'file_data.csv'
        with open(output_file, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Parent Folder', 'Folder Name', 'File Name', 'Size', 'URL', 'File Type'])
            start_time = time.time()
            request_count = 0
            list_files_and_folders(drive_link, csv_writer=writer)
            elapsed_time = time.time() - start_time
            if elapsed_time < RATE_LIMIT_DURATION:
                delay_time = RATE_LIMIT_DURATION / RATE_LIMIT_REQUESTS
                remaining_time = RATE_LIMIT_DURATION - elapsed_time
                if request_count > 0:
                    delay = min(delay_time, remaining_time / request_count)
                else:
                    delay = delay_time
                time.sleep(delay)

        # Troubleshooting steps
        if os.path.exists(output_file):
            return send_file(output_file, as_attachment=True)
        else:
            return "Error: File not found."
    return render_template('google_drive.html')

## Google Lens - Fetches all the matches of the image provided ##
@application.route('/google_lens', methods =["GET", "POST"])
def google_lens():
    if request.method == "POST":
        if 'image' not in request.files:
            return 'No file found in the request', 400

        image_file = request.files['image']
        
        extension = image_file.filename.lower().split('.')[-1]
        if extension not in ['jpg', 'jpeg', 'png']:
            return 'Unsupported image format', 400
        
        format_prefix = 'data:image/jpeg;base64,' if extension in ['jpg', 'jpeg'] else 'data:image/png;base64,'

        image_bytes = image_file.read()
        base64_data = base64.b64encode(image_bytes).decode('utf-8')
        data_uri = format_prefix + base64_data
        
        return jsonify(base64_image=data_uri)

############################ INSTAGRAM ###########################
## Instagram : Check whether post link is active ##
@application.route('/instagram_Post_Checker')
def instagram_post():
    return render_template('instaPost.html')

@application.route('/instagram_post', methods=['POST'])
def instagram_Post():
    data = request.get_json()
    links = data.get('links')

    if links:
        input_data = {
            "links": links
        }
        
        step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:instagram_post_StateMachine'

        output = invoke_step_function(step_function_arn, input_data)
        if output:
            return jsonify(output), 200
        else:
            return jsonify({'message': 'Step Function execution failed or was not completed.'}), 500
    else:
        return jsonify({'message': 'Missing links in the request.'}), 400

## Instagram Whitelist ##
@application.route('/instagram', methods=['GET', 'POST'])
def instagram_whitelist():

    if request.method == 'POST':
        submitted_links = request.form.get('submitted_links')
        official_usernames = request.form.get('official_usernames')
        step_function_input = {'submitted_links': submitted_links, 'official_usernames': official_usernames}

        # Invoke your Lambda function with the input_data here
        instagram_step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:InstagramWhitelistStateMachine'
        step_function_output = invoke_step_function(instagram_step_function_arn, step_function_input)

        response_dict = step_function_output
        status_code = response_dict["statusCode"]
        # Render the template with the Lambda function output

        if status_code == 200:
            body_str = response_dict["body"]
            body_dict = json.loads(body_str)

            download_link = body_dict["download_link"]
            print(download_link)
            return render_template('instagram.html', output=download_link, statusCode = status_code)
        else:
            body_str = response_dict["body"]
            if status_code == 400:
                error_links = response_dict["error_links"]
                body_str += ' The following links are creating an issue: ' + ' '.join(error_links)
            return render_template('instagram.html', statusCode = status_code, error = body_str)
    
    return render_template('instagram.html')


######################## Text Marker Endpoints ############################

## Text Marker - CDN Connection ##
@application.route('/', defaults={'path': ''})
@application.route('/<path:path>', methods=['GET'])
def textmarker_pdf(path):
    if request.method == "GET":
        
        if path:
            # Split the path to extract the user-specific segments
            path_parts = path.split('/')
            user_id = path_parts[0]
            access_key = path_parts[1]

        url = request.url
        access_key = request.args.get('access_key')
        user_id = request.args.get('user_id')

        if access_key is None or user_id is None:
            abort(400, "Invalid or insecure request. Access key and user ID are required.")
        
        # Extract the path from the parsed URL
        parsed_url = urlparse(url)
        path = parsed_url.path
        query = parsed_url.query.split('&')[0]  # take only the first part of the query up to the first '&'


        # Extract the substring between the first slash and the first ampersand
        extracted_data = path + "?" + query
        interim_font = "output.ufo"
        language = "kan"
        method = "replace"
        replace_method = "fixed"
        modify_method = "both"
        detection_method = "qcurve"
        value_input_x = 6
        value_input_y = 6
        size_key = 10
        interim_html = "sample.html"
        output_html = "output.html"
        output_pdf = "output.pdf"
        character_method = "frequency"
        download_link_timeout = 604800
        pdf_compression = "off"
        output_pdf_compressed = "compress.pdf"
        size_pool = 26
        def decode_unique_id(unique_id):
            decoded_bytes = base64.b64decode(unique_id.encode('utf-8'))
            string = decoded_bytes.decode('utf-8')
            return string

        # Example usage
        unique_id = "cG9jMy5hdmFoYW4ubmV0"
        decoded_string = decode_unique_id(unique_id)
        
        input_data = {'decoded_string': decoded_string, "extracted_data": extracted_data}

        function_name = 'arn:aws:lambda:ap-south-1:653948319023:function:Get2Pdf'
        response = invoke_lambda_function(input_data, function_name)

        hash_out = response["hash_out"]
        tmp_folder = '/tmp/'
        #tmp_folder = r"E:\download\1693289693873-Upload-flask"

        pdf_filename = 'input.pdf'

        dic_input = {
            'interim_font': interim_font,
            'language': language,
            'edit_json': "alpha_map.json",
            'input_json': "lang.json",
            'char_swap_json': "alpha_map2.json",
            'char_map_json': "alpha_map.json",
            'method': method,
            'replace_method': replace_method,
            'modify_method': modify_method,
            'detection_method': detection_method,
            'value_input_x': int(value_input_x),
            'value_input_y': int(value_input_y),
            'size_key': int(size_key),
            'interim_html': interim_html,
            'output_html': output_html,
            'output_pdf': output_pdf,
            'character_method': character_method,
            'download_link_timeout': int(download_link_timeout),
            'pdf_compression': pdf_compression,
            'output_pdf_compressed': output_pdf_compressed,
            'size_pool': int(size_pool),
            'input_pdf': pdf_filename
        }

        with open(os.path.join(tmp_folder, "config.json"), "w") as outfile:
            json.dump(dic_input, outfile, indent=1)
        s3.upload_file(os.path.join(tmp_folder, 'config.json'), BUCKET_NAME, hash_out + '/config.json')
        os.remove(os.path.join(tmp_folder, "config.json"))

        input_invoker = {'Unique_ID': hash_out, "Encryption_ID": ''}
        
        function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:PdfCreator'
        response = invoke_lambda_function(input_invoker, function_name)

        encryption_id = response["Unique_ID"]
        insert_to_db(encryption_id, user_id, access_key)
        return redirect(response["Output"])
    return render_template("textmarker_pdf.html")

## Basic Textmarker PDF call ##
@application.route('/textmarker',methods =["GET", "POST"])
def textmarker():
    if request.method == "POST":   
       

        input_pdf = request.files['input_pdf']
        filename = secure_filename(input_pdf.filename)
        input_pdf.save(filename)
        interim_font = "output.ufo"
        language = "en"
        method = "replace"
        replace_method = "fixed"
        modify_method = "both"
        detection_method = "qcurve"
        value_input_x = 6
        value_input_y = 6
        size_key = 15
        interim_html = "sample.html"
        output_html = "output.html"
        output_pdf = "output.pdf"
        character_method = "frequency"
        download_link_timeout = 604800
        pdf_compression = "off"
        output_pdf_compressed = "compress.pdf"
        size_pool = 30

        dic_input = {
            'interim_font': interim_font,
            'language': language,
            'edit_json': "alpha_map.json",
            'input_json': "lang.json",
            'char_swap_json': "alpha_map2.json",
            'char_map_json': "alpha_map.json",
            'method': method,
            'replace_method': replace_method,
            'modify_method': modify_method,
            'detection_method': detection_method,
            'value_input_x': int(value_input_x),
            'value_input_y': int(value_input_y),
            'size_key': int(size_key),
            'interim_html': interim_html,
            'output_html': output_html,
            'output_pdf': output_pdf,
            'character_method': character_method,
            'download_link_timeout': int(download_link_timeout),
            'pdf_compression': pdf_compression,
            'output_pdf_compressed': output_pdf_compressed,
            'size_pool': int(size_pool),
            'input_pdf': filename
        }


        m = md5()
        tmp_folder = '/tmp/'
        with open(os.path.join(tmp_folder,"config.json"), "w") as outfile:
            json.dump(dic_input, outfile,indent=1)
            
    
        data_pdf = input_pdf.read()
        
        m.update(data_pdf)
        hash_pdf = m.hexdigest()
        hash_out = hash_pdf
        path = hash_out
        print(hash_out)
        s3_list = s3.list_objects(Bucket=BUCKET_NAME, Prefix=path, MaxKeys=1)

        if 'Contents' in s3_list:
            input_invoker = {'Unique_ID': hash_out, "Encryption_ID": ''}

            function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:PdfCreator'
            response = invoke_lambda_function(input_invoker, function_name)

            encryption_id = response["Unique_ID"]
            return response["Output"]
        else:
            s3.upload_file(Bucket=BUCKET_NAME, Filename=filename, Key=hash_out + '/' + filename)
            s3.upload_file(os.path.join(tmp_folder, 'config.json'), BUCKET_NAME, hash_out + '/config.json')
            os.remove(os.path.join(tmp_folder, "config.json"))

            input_invoker = {'Unique_ID': hash_out, "Encryption_ID": ''}

            function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:PdfCreator'
            response = invoke_lambda_function(input_invoker, function_name)
            return response["Output"]
    return None


## Textmarker for Documents ##
@application.route('/upload_doc',methods =["GET", "POST"])
def upload_doc():
    if request.method == "POST":
       
        input_doc = request.files['input_doc']
        filename = secure_filename(input_doc.filename)
        input_doc.save(filename)

        s3.upload_file(
                        Bucket = BUCKET_NAME,
                        Filename=filename,
                        Key = 'plag/' + filename
                    )

        input_invoker = {'input_doc' : filename}

        function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:plag_doc2txt'
        response = invoke_lambda_function(input_invoker, function_name)  

        return response
    return render_template("upload_doc.html")


## TextMarker for Epub files ##
@application.route('/upload_epub',methods =["GET", "POST"])
def upload_epub():
    if request.method == "POST":
        '''
        interim_font = request.form.get("interim_font")
        language = request.form.get("language")
        method = request.form.get("method")
        replace_method = request.form.get("replace_method")
        modify_method = request.form.get("modify_method")
        detection_method = request.form.get("detection_method")
        value_input_x = request.form.get("value_input_x")
        value_input_y = request.form.get("value_input_y")
        current_font_name = request.form.get("current_font_name")
        new_font_name = request.form.get("new_font_name")
        size_key = request.form.get("size_key")
        output_epub = request.form.get("output_epub")
        interim_epub = request.form.get("interim_epub")               
        character_method = request.form.get("character_method")
        download_link_timeout = request.form.get("download_link_timeout")
        size_pool = request.form.get("size_pool")
        '''
        input_pdf = request.files['input_epub']
        filename = secure_filename(input_pdf.filename)
        input_pdf.save(filename)  

        dic_input = {}
        dic_input['interim_font']= "output.ufo"
        dic_input['language'] = "ben"
        dic_input['edit_json'] = "alpha_map.json"
        dic_input['char_swap_json'] = "alpha_map2.json"
        dic_input['input_json'] = "lang.json"
        dic_input['method']= "replace"
        dic_input['replace_method']= "fixed"
        dic_input['modify_method']= "both"
        dic_input['detection_method']= "qcurve"
        dic_input['value_input_x']= 30
        dic_input['value_input_y']= 30
        dic_input['current_font_name']= 'Arial'
        dic_input['new_font_name']= 'custom'
        dic_input['size_key']= 10
        dic_input['input_epub']= filename
        split_tupple = os.path.splitext(filename)
        interim_epub = split_tupple[0] + '.zip'
        dic_input['output_epub']= "output.epub"
        dic_input['interim_epub']= interim_epub
        dic_input['character_method']= "frequency"
        dic_input['download_link_timeout']= 604800
        dic_input['size_pool']= 15
        m = md5()
        tmp_folder = '/tmp/'

        with open(os.path.join(tmp_folder,"config.json"), "w") as outfile:
            json.dump(dic_input, outfile,indent=1)
            
        read_conifg = open(os.path.join(tmp_folder,"config.json"),"rb")
        data_config =read_conifg.read()
        m.update(data_config)
        hash_config = m.hexdigest()
        read_conifg.close() 
        
        
        data_pdf = input_pdf.read()
        
        m.update(data_pdf)
        hash_pdf = m.hexdigest()
        hash_out = hash_pdf + hash_config
        path = hash_out
        s3_list = s3.list_objects(Bucket=BUCKET_NAME, Prefix=path, MaxKeys=1)

        if 'Contents' in s3_list:
                return {
                    'Unique_ID': hash_out,
                    'Status' : 'File Already Exists'
                }
        else:
            s3.upload_file(
                            Bucket = BUCKET_NAME,
                            Filename=filename,
                            Key = hash_out + '/' + filename
                        )       
                        
            s3.upload_file(tmp_folder+'/config.json', BUCKET_NAME, hash_out +'/config.json')
            os.remove(os.path.join(tmp_folder,"config.json"))
            return {
                    'Unique_ID': hash_out,
                    'Status' : 'Upload Successful'
                }
    return render_template("input_epub.html")


## TextMarker for Fonts ##
@application.route('/upload_font',methods =["GET", "POST"])
def upload_font():
    if request.method == "POST":
        interim_font = 'output.ufo'
        language = 'en'
        method = 'replace'
        replace_method = 'fixed'
        modify_method = 'both'
        detection_method = 'qcurve'
        value_input_x = 8
        value_input_y = 8
        size_key = 8

        input_pdf = request.files['input_font']
        filename = secure_filename(input_pdf.filename)
        input_pdf.save(filename)  

        dic_input = {}
        dic_input['interim_font']= interim_font
        dic_input['language'] = language
        dic_input['edit_json'] = "alpha_map.json"
        dic_input['input_json'] = "lang.json"
        dic_input['method']= method
        dic_input['replace_method']= replace_method
        dic_input['modify_method']= modify_method
        dic_input['detection_method']= detection_method
        dic_input['value_input_x']= int(value_input_x)
        dic_input['value_input_y']= int(value_input_y) 
        dic_input['size_key']= int(size_key)
        m = md5()
        tmp_folder = '/tmp/'
        #tmp_folder= r"E:\Projects\textual-watermark\aws-upload"
        with open(os.path.join(tmp_folder,"config.json"), "w") as outfile:
            json.dump(dic_input, outfile,indent=1)
            
        read_conifg = open(os.path.join(tmp_folder,"config.json"),"rb")
        data_config =read_conifg.read()
        m.update(data_config)
        hash_config = m.hexdigest()
        read_conifg.close() 
        
        
        data_pdf = input_pdf.read()
        
        m.update(data_pdf)
        hash_pdf = m.hexdigest()
        hash_out = hash_pdf + hash_config
        path = hash_out
        s3_list = s3.list_objects(Bucket=BUCKET_NAME, Prefix=path, MaxKeys=1)

        if 'Contents' in s3_list:
                return {
                    'Unique_ID': hash_out,
                    'Status' : 'File Already Exists'
                }
        else:
            s3.upload_file(
                            Bucket = BUCKET_NAME,
                            Filename=filename,
                            Key = hash_out + '/' + filename
                        )       
                        
            s3.upload_file(tmp_folder+'/config.json', BUCKET_NAME, hash_out +'/config.json')
            os.remove(os.path.join(tmp_folder,"config.json"))
            return {
                    'Unique_ID': hash_out,
                    'Status' : 'Upload Successful'
                }
    return render_template("input_font.html")

## PDF Textmarker Single Call ##
@application.route('/pdf_combined_paper',methods =["GET", "POST"])
@cross_origin(origin='https://main.d2cgj97orcq5ob.amplifyapp.com/',headers=['Content- Type','Authorization'])
def pdf_combined_paper():
    if request.method == "POST":
       
        input_pdf = request.files['input_pdf']
        filename = secure_filename(input_pdf.filename)
        input_pdf.save(filename)  

        dic_input = {}
        dic_input['interim_font']= "output.ufo"
        dic_input['language'] = "tam"
        dic_input['edit_json'] = "alpha_map1.json"
        dic_input['char_swap_json'] = "alpha_map2.json"
        dic_input['char_map_json'] = "alpha_map.json"
        dic_input['input_json'] = "lang.json"
        dic_input['method']= "replace"
        dic_input['replace_method']= "fixed"
        dic_input['modify_method']="both"
        dic_input['detection_method']= "qcurve"
        dic_input['value_input_x']= 6
        dic_input['value_input_y']= 6 
        dic_input['size_key']= 10
        dic_input['input_pdf']= filename
        dic_input['interim_html']= "sample.html"
        dic_input['output_html']= "output.html"
        dic_input['output_pdf']= "output.pdf"
        dic_input['character_method']= "frequency"
        dic_input['download_link_timeout']= 604800
        dic_input['pdf_compression']= "on"
        dic_input['output_pdf_compressed']= "compress.pdf"
        dic_input['size_pool']= 26
        m = md5()
        tmp_folder = '/tmp/'

        with open(os.path.join(tmp_folder,"config.json"), "w") as outfile:
            json.dump(dic_input, outfile,indent=1)
            
        read_conifg = open(os.path.join(tmp_folder,"config.json"),"rb")
        data_config =read_conifg.read()
        m.update(data_config)
        hash_config = m.hexdigest()
        read_conifg.close() 
        
        
        data_pdf = input_pdf.read()
        
        m.update(data_pdf)
        hash_pdf = m.hexdigest()
        hash_out = hash_pdf + hash_config
        path = hash_out
        s3_list = s3.list_objects(Bucket=BUCKET_NAME, Prefix=path, MaxKeys=1)

        if 'Contents' in s3_list:
                return {
                    'Unique_ID': hash_out,
                    'Status' : 'File Already Exists'
                }
        else:
            s3.upload_file(
                            Bucket = BUCKET_NAME,
                            Filename= filename,
                            Key = hash_out + '/' + filename
                        )       
                        
            s3.upload_file(tmp_folder+'/config.json', BUCKET_NAME, hash_out +'/config.json')
            os.remove(os.path.join(tmp_folder,"config.json"))

            input_invoker = {'unique_id' : hash_out, 'encryption_ID' : ''}

            function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:PDF_Creator_Beanstalk'
            response = invoke_lambda_function(input_invoker, function_name)

            return {
                    'Unique_ID': hash_out,
                    'Status' : 'Upload Successful'
                }
    return render_template("pdf_combined_paper.html")

# Client endpoint
@application.route('/pdf_hindu',methods =["GET", "POST"])
def pdf_hindu():
    if request.method == "POST":
       
        input_pdf = request.files['input_pdf']
        filename = secure_filename(input_pdf.filename)
        input_pdf.save(filename)  

        dic_input = {}
        dic_input['interim_font']= "output.ufo"
        dic_input['language'] = "en"
        dic_input['edit_json'] = "alpha_map1.json"
        dic_input['char_swap_json'] = "alpha_map2.json"
        dic_input['char_map_json'] = "alpha_map.json"
        dic_input['input_json'] = "lang.json"
        dic_input['method']= "replace"
        dic_input['replace_method']= "fixed"
        dic_input['modify_method']="both"
        dic_input['detection_method']= "qcurve"
        dic_input['value_input_x']= 10
        dic_input['value_input_y']= 10 
        dic_input['size_key']= 10
        dic_input['input_pdf']= filename
        dic_input['interim_html']= "sample.html"
        dic_input['output_html']= "output.html"
        dic_input['output_pdf']= "output.pdf"
        dic_input['character_method']= "frequency"
        dic_input['download_link_timeout']= 604800
        dic_input['pdf_compression']= "off"
        dic_input['output_pdf_compressed']= "compress.pdf"
        dic_input['size_pool']= 26
        m = md5()
        tmp_folder = '/tmp/'
        #tmp_folder= r"E:\Projects\textual-watermark\aws-upload"
        with open(os.path.join(tmp_folder,"config.json"), "w") as outfile:
            json.dump(dic_input, outfile,indent=1)
            
        read_conifg = open(os.path.join(tmp_folder,"config.json"),"rb")
        data_config =read_conifg.read()
        m.update(data_config)
        hash_config = m.hexdigest()
        read_conifg.close() 
        
        
        data_pdf = input_pdf.read()
        
        m.update(data_pdf)
        hash_pdf = m.hexdigest()
        hash_out = hash_pdf + hash_config
        path = hash_out
        s3_list = s3.list_objects(Bucket=BUCKET_NAME, Prefix=path, MaxKeys=1)

        if 'Contents' in s3_list:
                return {
                    'Unique_ID': hash_out,
                    'Status' : 'File Already Exists'
                }
        else:
            s3.upload_file(
                            Bucket = BUCKET_NAME,
                            Filename= filename,
                            Key = hash_out + '/' + filename
                        )       
                        
            s3.upload_file(tmp_folder+'/config.json', BUCKET_NAME, hash_out +'/config.json')
            os.remove(os.path.join(tmp_folder,"config.json"))

            input_invoker = {'unique_id' : hash_out, 'encryption_ID' : ''}

            function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:PDF_Creator_Beanstalk'
            response = invoke_lambda_function(input_invoker, function_name)

            return {
                    'Unique_ID': hash_out,
                    'Status' : 'Upload Successful'
                }
    return render_template("pdf_hindu.html")

######################### YOUTUBE ############################
## Used to get all the channel data like videos and shorts ##
@application.route('/youtube_channel')
def youtube_channel():
    return render_template('youtube_channel.html')

@application.route('/youtube_channel_output', methods=['POST'])
def youtube_channel_output():
    data = request.get_json()
    links = data.get('links')
    video_type =data.get('videoType')

    # print(video_type)
    # print(links)
    if(video_type == 'videos'):
        step_function = 'arn:aws:states:ap-south-1:805465755323:stateMachine:youtube_channel_videosStateMachine'
    else:
        step_function = 'arn:aws:states:ap-south-1:805465755323:stateMachine:youtube_StateMachine'

    if links:
        input_data = {
            "links": links
        }

        # Replace 'your_step_function_arn' with the ARN of your AWS Step Function
        # step_function_arn = 'arn:aws:states:ap-south-1:653948319023:stateMachine:youtube_state_Machine'
        step_function_arn = step_function

        output = invoke_step_function(step_function_arn, input_data)
        if output:
            return jsonify(output), 200
        else:
            return jsonify({'message': 'Step Function execution failed or was not completed.'}), 500
    else:
        return jsonify({'message': 'Missing links in the request.'}), 400
    

## Youtube Channel Status Checker ##
@application.route('/youtube_channel_status_checker')
def youtube_channel_status():
    return render_template('youtube_channel_status.html')
@application.route('/youtube_channel_status_output', methods=['POST'])
def youtube_channel_status_output():
    data = request.get_json()
    links = data.get('links')

    if links:
        input_data = {
            "links": links
        }

        step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:youtube_channel_checker_StateMachine'
        output = invoke_step_function(step_function_arn, input_data)
        if output:
            return jsonify(output), 200
        else:
            return jsonify({'message': 'Step Function execution failed or was not completed.'}), 500
    else:
        return jsonify({'message': 'Missing links in the request.'}), 400 


## Youtube Status - for videos and shorts ##
@application.route('/youtube_status')
def index():
    return render_template('youtube_status.html')

@application.route('/youtube_status_output', methods=['POST'])
def invoke_step_function_api():
    data = request.get_json()
    links = data.get('links')

    if links:
        input_data = {
            "links": links
        }

        step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:youtube_video_StateMachine'

        output = invoke_step_function(step_function_arn, input_data)
        if output:
            return jsonify(output), 200
        else:
            return jsonify({'message': 'Step Function execution failed or was not completed.'}), 500
    else:
        return jsonify({'message': 'Missing links in the request.'}), 400
    
## Youtube Whitelist ##
@application.route('/youtube_whitelist', methods=['GET', 'POST'])
def youtube_whitelist():
    if request.method == 'POST':
        submitted_links = request.form.get('submitted_links')
        official_usernames = request.form.get('official_usernames')

        # Split submitted links and official usernames into lists
        submitted_links_list = [link.strip() for link in submitted_links.split('\n') if link.strip()]
        official_usernames_list = [username.strip() for username in official_usernames.split('\n') if username.strip()]

        official_usernames_list_in = []
        official_usernames_error = []
        entered_links = []
        for i in official_usernames_list:
            response = requests.get(i)

            # Check if the request was successful
            if response.status_code == 200:
            
                content = response.text
                external_id_match = re.search(r'"externalId":"(.*?)"', content)
                channel_match = re.search(r'"channelIds":\["(.*?)"\]', content)
                try:
                    external_id = external_id_match.group(1)
                    #print(external_id)
                    official_usernames_list_in.append(external_id)
                except:
                    try:
                        external_id = channel_match.group(1)
                        official_usernames_list_in.append(external_id)
                    except:
                        official_usernames_error.append(i)
                    
        matched_links = []
        unmatched_links = []
        unknown_username_links = []

        # Process each submitted link
        for link in submitted_links_list:
            # Add 'https://' prefix if missing
            if not link.startswith('https://') and not link.startswith('http://'):
                link = 'https://' + link

            # Send GET request
            response = requests.get(link)

            # Check if the request was successful
            if response.status_code == 200:
                # Get the content of the response
                content = response.text

                external_match = re.search(r'"externalId":"(.*?)"', content)
                match = re.search(r'"channelIds":\["(.*?)"\]', content)

                try:
                    username = match.group(1)
                except:
                    try:
                        username = external_match.group(1) 
                    except:
                        username = 'Video_does_not_exist'

                # Check if the extracted username matches any of the official usernames
                if username in official_usernames_list_in:
                    matched_links.append(link)
                elif username == "Video_does_not_exist":    
                    entered_links.append(link)
                else:
                    unmatched_links.append(link)
            else:
                unmatched_links.append(link)

        return render_template('youtube_whitelist.html', matched_links=matched_links, unmatched_links=unmatched_links, unknown_username_links=unknown_username_links,error_links=official_usernames_error,entered_links= entered_links)

    return render_template('youtube_whitelist.html')

# YOUTUBE SEARCH KEYWORDS
@application.route('/youtube_search_keyword')
def index_search():
    return render_template('youtube_search.html')
@application.route('/youtube_search_keyword_information', methods=['GET', 'POST'])
def youtube_search_video():
    if request.method == 'POST':
        search_keyword = request.form['search_keyword']
        filter = request.form['filter']
        lambda_function = 'youtube_search'  # Default Lambda function
        if filter == 'Shorts':
            lambda_function = 'youtube_search_shorts'
        if filter == 'Channels':
            lambda_function = 'youtubeCrawler_channel'
          
        lambda_payload = {
            "queryStringParameters": {
                "search_keyword": search_keyword,
                "filter": filter
            }
        }
        try:
            response = invoke_lambda_function(lambda_payload, lambda_function)
            # Parse the body from the result
            body = json.loads(response.get('body', '{}'))
            # Extract the download_link
            s3_url = body.get('download_link', '#')
            return render_template('youtube_search.html', s3_url=s3_url)
        except Exception as e:
            return str(e)
    else:
        return "This endpoint expects a POST request."


######################### TWITTER ###########################
## Twitter Whitelist ##
@application.route('/twitter')
def twitter_index():
    return render_template('twitter.html')

@application.route('/process_data_twitter', methods=['POST'])
def twitter_process_data():
    data = request.get_json()
    official_usernames = data.get('official_usernames', [])
    submitted_links = data.get('submitted_links', [])

    if official_usernames and submitted_links:
        input_data = {
            "official_usernames": official_usernames,
            "submitted_links": submitted_links
        }

        # Replace 'your_step_function_arn' with the ARN of your AWS Step Function
        step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:Twitter_whitelist_StateMachine'

        output = invoke_step_function(step_function_arn, input_data)
        if output:
            return jsonify(output), 200
        else:
            return jsonify({'message': 'Step Function execution failed or was not completed.'}), 500
    else:
        return jsonify({'message': 'Missing official_usernames or submitted_links in the request.'}), 400
    
####################### FACEBOOK #########################
## Facebook Whitelist ##
@application.route('/facebook', methods=['GET', 'POST'])
def facebook():

    if request.method == 'POST':
        submitted_links = request.form.get('submitted_links')
        official_usernames = request.form.get('official_usernames')
        step_function_input = {'submitted_links': submitted_links, 'official_usernames': official_usernames}

        # Invoke your Lambda function with the input_data here
        facebook_step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:FacebookWhitelistStateMachine'
        step_function_output = invoke_step_function(facebook_step_function_arn, step_function_input)

        response_dict = step_function_output
        status_code = response_dict["statusCode"]

        if status_code == 200:
            body_str = response_dict["body"]
            body_dict = json.loads(body_str)

            download_link = body_dict["download_link"]
            print(download_link)
            return render_template('facebook.html', output=download_link, statusCode = status_code)
        else:
            body_str = response_dict["body"]
            if status_code == 400:
                error_links = response_dict["error_links"]
                body_str += ' The following links are creating an issue: ' + ' '.join(error_links)
            return render_template('facebook.html', statusCode = status_code, error = body_str)
    
    return render_template('facebook.html')


## Facebook Active Link Checker ##
@application.route('/facebook-status-check', methods=['GET', 'POST'])
def facebook_status_check():

    if request.method == 'POST':
        submitted_links = request.form.get('submitted_links')
        step_function_input = {'submitted_links': submitted_links}

        facebook_ative_check_step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:FacebookLinkActiveCheck'
        step_function_output = invoke_step_function(facebook_ative_check_step_function_arn, step_function_input)

        response_dict = step_function_output
        status_code = response_dict["statusCode"]

        if status_code == 200:
            body_str = response_dict["body"]
            body_dict = json.loads(body_str)

            download_link = body_dict["download_link"]
            print(download_link)
            return render_template('facebook_active_check.html', output=download_link, statusCode = status_code)
        else:
            body_str = response_dict["body"]
            return render_template('facebook_active_check.html', statusCode = status_code, error = body_str)
    
    return render_template('facebook_active_check.html')

######################## TELEGRAM #########################
## Telegram Whitelist ##
@application.route('/telegram-whitelist', methods=['GET', 'POST'])
def whitelist():
    if request.method == 'POST':
        submitted_link = request.form['submitted_link']
        submitted_official_links = request.form['official_links']

        # Split submitted links and official links into lists
        submitted_links_list = [link.strip() for link in submitted_link.split('\n') if link.strip()]

        # Build official_channels_set, skipping 'joinchat' channels
        official_channels_set = set()
        for link in submitted_official_links.split('\n'):
            link = link.strip()
            if link:
                channel = get_channel_from_link(link).lower()
                if channel != 'joinchat':
                    official_channels_set.add(channel)

        whitelisted = set()
        non_whitelisted = set()

        for link in submitted_links_list:
            channel = get_channel_from_link(link).lower()
            if channel in official_channels_set:
                whitelisted.add(link)
            else:
                non_whitelisted.add(link)

        whitelisted_count = len(whitelisted)

        return render_template('index.html', whitelisted=whitelisted, non_whitelisted=non_whitelisted, whitelisted_count=whitelisted_count)

    return render_template('index.html')

## Telegram : Telemetr Scan ##
@application.route('/telegram', methods=['GET', 'POST'])
def telegram():
    if request.method == 'POST':
        input_data = request.form['input_data']
        input = {
            "params": {
                "querystring": {
                    "input_data": input_data
                }
            }
        }
        # Invoke your Lambda function with the input_data here
        function_name = 'Telemetr_Top_Layer'
        lambda_output = invoke_lambda_function(input, function_name)
        sorted_results = sorted(lambda_output['results'], key=lambda x: x['score'], reverse=True)
        lambda_output['results'] = sorted_results
        # Render the template with the Lambda function output
        return render_template('output_telegram.html', output=lambda_output)
    
    return render_template('telegram.html')

## Telegram Channel Check ##
@application.route('/telegram/channel-check', methods=['GET', 'POST'])
def telegram_check():

    if request.method == 'POST':
        submitted_links = request.form.get('submitted_links')
        # links_list = submitted_links.split('\n')
        # links_list = [link.strip() for link in links_list if link.strip()]

        # # Check if the number of links exceeds 400
        # if len(links_list) > 400:
        #     flash("Error: More than 400 links submitted. Please submit fewer links.", "error")
        #     return redirect(url_for('telegram_check'))
        step_function_input = {'submitted_links': submitted_links }
        # Invoke your Lambda function with the input_data here
        facebook_step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:telegram_check_active_channels'
        step_function_output = invoke_step_function(facebook_step_function_arn, step_function_input)

        response_dict = step_function_output
        body_str = response_dict["body"]
        body_dict = json.loads(body_str)

        download_link = body_dict["download_link"]
        print(download_link)
        # Render the template with the Lambda function output
        return render_template('telegram_channel_check.html', output=download_link)
    
    return render_template('telegram_channel_check.html')

## Telegram Channel Scanner ##
@application.route('/telegram_channel',methods =["GET", "POST"])
def telegram_channel():
    if request.method == 'POST':
        queries = request.form.getlist('query')[:10]  # Limit to 10 queries
        queries = [element for query in queries for element in query.split(',')]
        print(queries)

        # Prepare payload
        payload = {
            "queries": queries
        }

        function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:Telegram_Channel_Scanner'
        response = invoke_lambda_function(payload, function_name)

        result_message = response.get('body', '')
        csv_data = result_message.split('\n')[1:]  # Extract CSV rows (excluding header)

        return render_template('telegram_channel.html', csv_data=csv_data)
    return render_template('telegram_channel.html')

@application.route('/download_csv', methods=['GET'])
def download_csv():
    csv_data = request.args.get('csv_data', '')
    print(csv_data)

    response = Response(csv_data, content_type='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=search_results.csv'

    return response


## Telegram Channel Id Extract ##
@application.route('/telegram_id_extract', methods=['GET', 'POST'])
def telegram_id_extract():

    if request.method == 'POST':
        submitted_links = request.form.get('submitted_links')
        input = {'submitted_links': submitted_links}

        # Invoke your Lambda function with the input_data here
        step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:TelegramIdExtractStateMachine'

        step_function_output = invoke_step_function(step_function_arn, input)

        response_dict = step_function_output
        status_code = response_dict["statusCode"]
        # Render the template with the Lambda function output

        if status_code == 200:
            body_str = response_dict["body"]
            body_dict = json.loads(body_str)

            download_link = body_dict["download_link"]
            print(download_link)
            return render_template('telegram_id_extract.html', output=download_link, statusCode = status_code)
        else:
            body_str = response_dict["body"] 
            return render_template('telegram_id_extract.html', statusCode = status_code, error = body_str)
    
    return render_template('telegram_id_extract.html')


## Telegram Post Checker ##
@application.route('/telegram_post_checker')
def telegram_post_get():
    return render_template('telegramPost.html')  # assuming the HTML file is named 'index.html'

@application.route('/telegram_post', methods=['POST'])
def telegram_post_check():
    data = request.get_json()
    links = data.get('links')
    print(links)
    if links:
        input_data = {
            "links": links
        }
        # Replace 'your_step_function_arn' with the ARN of your AWS Step Function
        step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:Telegram_post_StateMachine'
        output = invoke_step_function(step_function_arn, input_data)
        if output:
            return jsonify(output), 200
        else:
            return jsonify({'message': 'Step Function execution failed or was not completed.'}), 500
    else:
        return jsonify({'message': 'Missing links in the request.'}), 400


######################### WEBMARKER ###########################
## Webmarker submit assets ##
@application.route('/submit', methods =["GET", "POST"])
def submit():
    eid = request.form['eid']
    #html_file = request.files['html_file']
    css_attach = request.form['css_attach']
    html_type = request.form['html_type']
    resource_path = request.form['resource_path']

    html_file = request.files['html_file']
    filename = secure_filename(html_file.filename) 
    html_file.save(filename)

    s3.upload_file(
                        Bucket = BUCKET_NAME,
                        Filename=filename,
                        Key = 'Webmarker/' + eid + '/' + filename
                    )
    
    input_invoker = {'eid':eid, 'html_input' : filename, 'css_attach' : css_attach, "html_type" : html_type, 'resource_path':resource_path}

    function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:Webmarker'
    response = invoke_lambda_function(input_invoker, function_name)
    
    return response

## Web Marker - HTML Encryption ##
@application.route('/html_encryption', methods =["GET", "POST"])
def submit_text():
    eid = request.form['eid']
    #html_file = request.files['html_file']
    css_attach = request.form['attach_assests']
    resource_path = request.form['resource_path']

    html_input = request.form['html']

    input_invoker = {'eid':eid, 'html_input' : html_input, 'css_attach' : css_attach, 'resource_path':resource_path}

    function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:WebmarkerText'
    response = invoke_lambda_function(input_invoker, function_name)
    
    return response

# ## Setup for the webMarker HTML Encryption endpoint ##
# @application.route('/setup', methods =["GET", "POST"])
# def webmarker_font():
#     eid = request.form['eid']
#     font_format = request.form['font_format']
#     input_tag = request.form['input_tag']
#     font_file = request.files['font_file']
#     filename = secure_filename(font_file.filename) 
#     font_file.save(filename)

#     s3.upload_file(
#                         Bucket = BUCKET_NAME,
#                         Filename=filename,
#                         Key = 'Webmarker/' + eid + '/' + filename
#                     )
    
#     input_invoker = {'eid':eid ,'font_format' : font_format, 'input_tag' : input_tag}

#     function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:WebmarkerText'
#     response = invoke_lambda_function(input_invoker, function_name)
    
#     return response

## Client Endpoint - Webmarker HTML Encryption ##
@application.route('/boost_html_encryption', methods =["GET", "POST"])
def boost_encryption():
    eid = '201345678'
    #html_file = request.files['html_file']
    css_attach = 'no'
    resource_path = 'static'

    html_input = request.form['html']

    input_invoker = {'eid':eid, 'html_input' : html_input, 'css_attach' : css_attach, 'resource_path':resource_path}

    function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:WebmarkerText'
    response = invoke_lambda_function(json.dumps(input_invoker), function_name) 

    return response

## Setup Endpoint for the above method ##
@application.route('/boost_setup', methods =["GET", "POST"])
def boost_setup():

    font_file = request.files['font_file']
    filename = secure_filename(font_file.filename) 
    font_file.save(filename)

    with open(filename, 'rb') as file:
        content = file.read()

    md5_hash = hashlib.md5(content)
    eid = md5_hash.hexdigest()[:8]  # Take the first 8 characters of the hash

    s3.upload_file(
                    Bucket = BUCKET_NAME,
                    Filename=filename,
                    Key = 'Webmarker/' + eid + '/' + filename
                    )
    
    input_invoker = {'eid':eid }

    function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:BoostFontGen'
    response = invoke_lambda_function(input_invoker, function_name)
    
    return response

## Setup for the webMarker HTML Encryption endpoint ##
@application.route('/setup', methods =["GET", "POST"])
def webmarker_font():
    eid = request.form['eid']
    font_format = request.form['font_format']
    input_tag = request.form['input_tag']
    font_file = request.files['font_file']
    filename = secure_filename(font_file.filename) 
    font_file.save(filename)

    s3.upload_file(
                        Bucket = BUCKET_NAME,
                        Filename=filename,
                        Key = 'Webmarker/' + eid + '/' + filename
                    )
    
    input_invoker = {'eid':eid ,'font_format' : font_format, 'input_tag' : input_tag}

    function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:WebmarkerFont'
    response = invoke_lambda_function(input_invoker, function_name)
    
    return response

## WebMarker HTML encode ##
@application.route('/html_encode',methods =["GET", "POST"])
def html_encode():
    if request.method == "POST":
        html_input = request.form.get("html_input")
        character_method = request.form.get("character_method")
        encrypted_input = request.form.get("encrypted_input")

        input_invoker = {'html_input' : html_input, 'character_method' : character_method, 'encrypted_input' : encrypted_input}

        function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:Html_Encode'
        response = invoke_lambda_function(input_invoker, function_name)

        return response            
    return render_template("html_encode.html")

## Webmarker to encrypt entire data ##
@application.route('/anti_scrapping',methods =["GET", "POST"])
def anti_scrapping():
    if request.method == "POST":
        html_input = request.form.get("html_input")

        input_invoker = {'html_input' : html_input}

        function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:Anti_scrapping_html'
        response = invoke_lambda_function(input_invoker, function_name)

        return response            
    return render_template("anti_scrapping.html")


## Webmarker HTML Encode for Tamil ##
@application.route('/html_encode_tam',methods =["GET", "POST"])
def html_encode_tam():
    if request.method == "POST":
        html_input = request.form.get("html_input")
        character_method = request.form.get("character_method")
        encrypted_input = request.form.get("encrypted_input")

        input_invoker = {'html_input' : html_input, 'character_method' : character_method, 'encrypted_input' : encrypted_input}

        function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:Html_Encode_Tam'
        response = invoke_lambda_function(input_invoker, function_name)

        return response            
    return render_template("html_encode_tam.html")


#################### TRADEMARK #########################

## Trademark ##
@application.route('/trademark', methods = ['GET'])
def trademark_index():
    return render_template('trademark.html')

@application.route('/trademark', methods=['POST'])
def trademark_process_data():
    if request.method == 'POST':
        brand_name = request.form.get("brandName")
        strategy = request.form.get("strategy")

        input_data = {
            "queryStringParameters": {
                "brandName": brand_name,
                "strategy": strategy
            }
        }

        # Replace with your actual Step Function ARN
        step_function_arn = 'arn:aws:states:ap-south-1:805465755323:stateMachine:trademark_wipo_StateMachine'

        output = invoke_step_function(step_function_arn, input_data)
        print(output)
        if output:
            decoded_outputs = []
            for item in output:
                try:
                    decoded_output = json.loads(item['body'])
                    decoded_outputs.append(decoded_output)
                except json.JSONDecodeError:
                    pass  # Handle the error case if needed

            response_data = json.dumps(decoded_outputs, ensure_ascii=False).encode('utf-8')
            response = Response(response_data, status=200, content_type='application/json; charset=utf-8')
        else:
            response_data = json.dumps({'message': 'Step Function execution failed or was not completed.'}).encode('utf-8')
            response = Response(response_data, status=500, content_type='application/json; charset=utf-8')

        return response
    

######################### PLAGIARISM CHECK ############################

## Plagiarism Check ##
@application.route('/plag_percent',methods =["GET", "POST"])
def plag_percent():
    if request.method == "POST":
        input_text = request.form.get("input_text")

        input_invoker = {'input_text' : input_text}

        function_name = 'arn:aws:lambda:ap-south-1:805465755323:function:plag_text'
        response = invoke_lambda_function(json.dumps(input_invoker), function_name)

        return response
    return render_template("plag_percent.html")

if __name__ == "__main__":
    application.run(debug=True)

# @application.route('/upload_pdf',methods =["GET", "POST"])
# def upload_pdf():
#     if request.method == "POST":
       
#         interim_font = request.form.get("interim_font")
#         language = request.form.get("language")
#         method = request.form.get("method")
#         replace_method = request.form.get("replace_method")
#         modify_method = request.form.get("modify_method")
#         detection_method = request.form.get("detection_method")
#         value_input_x = request.form.get("value_input_x")
#         value_input_y = request.form.get("value_input_y")
#         current_font_name = request.form.get("current_font_name")
#         new_font_name = request.form.get("new_font_name")
#         size_key = request.form.get("size_key")
#         interim_html = request.form.get("interim_html")
#         output_html = request.form.get("output_html")
#         output_pdf = request.form.get("output_pdf")               
#         character_method = request.form.get("character_method")
#         download_link_timeout = request.form.get("download_link_timeout")
#         pdf_compression = request.form.get("pdf_compression")
#         output_pdf_compressed = request.form.get("output_pdf_compressed")
#         size_pool = request.form.get("size_pool")

#         input_pdf = request.files['input_pdf']
#         filename = secure_filename(input_pdf.filename)
#         input_pdf.save(filename)  

#         dic_input = {}
#         dic_input['interim_font']= interim_font
#         dic_input['language'] = language
#         dic_input['edit_json'] = "alpha_map.json"
#         dic_input['input_json'] = "lang.json"
#         dic_input['method']= method
#         dic_input['replace_method']= replace_method
#         dic_input['modify_method']= modify_method
#         dic_input['detection_method']= detection_method
#         dic_input['value_input_x']= int(value_input_x)
#         dic_input['value_input_y']= int(value_input_y) 
#         dic_input['size_key']= int(size_key)
#         dic_input['input_pdf']= filename
#         dic_input['interim_html']= interim_html
#         dic_input['output_html']= output_html
#         dic_input['output_pdf']= output_pdf
#         dic_input['character_method']= character_method
#         dic_input['download_link_timeout']= int(download_link_timeout)
#         dic_input['pdf_compression']= pdf_compression   
#         dic_input['output_pdf_compressed']= output_pdf_compressed
#         dic_input['size_pool']= int(size_pool)
#         m = md5()
#         tmp_folder = '/tmp/'
#         #tmp_folder= r"E:\Projects\textual-watermark\aws-upload"
#         with open(os.path.join(tmp_folder,"config.json"), "w") as outfile:
#             json.dump(dic_input, outfile,indent=1)
            
#         read_conifg = open(os.path.join(tmp_folder,"config.json"),"rb")
#         data_config =read_conifg.read()
#         m.update(data_config)
#         hash_config = m.hexdigest()
#         read_conifg.close() 
        
        
#         data_pdf = input_pdf.read()
        
#         m.update(data_pdf)
#         hash_pdf = m.hexdigest()
#         hash_out = hash_pdf + hash_config
#         path = hash_out
#         s3_list = s3.list_objects(Bucket=BUCKET_NAME, Prefix=path, MaxKeys=1)

#         if 'Contents' in s3_list:
#                 return {
#                     'Unique_ID': hash_out,
#                     'Status' : 'File Already Exists'
#                 }
#         else:
#             s3.upload_file(
#                             Bucket = BUCKET_NAME,
#                             Filename=filename,
#                             Key = hash_out + '/' + filename
#                         )       
                        
#             s3.upload_file(tmp_folder+'/config.json', BUCKET_NAME, hash_out +'/config.json')
#             os.remove(os.path.join(tmp_folder,"config.json"))
#             return {
#                     'Unique_ID': hash_out,
#                     'Status' : 'Upload Successful'
#                 }
#     return render_template("input_pdf.html")
#
