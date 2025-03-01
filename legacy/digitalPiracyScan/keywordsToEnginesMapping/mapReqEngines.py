import json
import requests,json,ast
import json
import boto3    
s3 = boto3.client('s3')
from concurrent.futures import ThreadPoolExecutor
def lambda_handler(event, context):
       # key = file_name=event["params"]["querystring"]["key"]
       # aid = file_name=event["params"]["querystring"]["aid"]
        #data = json.loads(str(event))
       
        key = event["key"]
        aid = event["aid"]
        crawler_list = event["crawler_list"]
        env = event["env"]
        tid = event["tid"]
        '''
        crawler_list = ['libgenrs','libgenis','jeemainguru', 'facebook', 'instagram' , 'bing', 'duckduckgo' ,'freesoff' , 'duforum' , 'udemycourses',
        'serbiumforum', 'yandex' ,'vdoc' , 'epdf' , 'tuxdoc' , 'qdoc' , 'dailymotion' , 'youtube' , 'ninescripts', 'freetutsdownload' , 'jeeneetbooks'
        , 'pdfslide' , 'scribd' , 'google' , 'google_search_by_image' , 'google_image' , 'studypool' , 'tutbb' , 'studyrate' , 'googledrivelinks'
        , 'forumgoogledrivelinks' , 'studymaterialz', 'jeeboks']
        #crawler_list = ['libgenrs', 'scribd']
        '''
        crawl_params=[] 
        for crawler in crawler_list :
            request_params = {"key": f"{key}","engine": f"{crawler}", "aid" : f"{aid}" , "env" : f"{env}", "tid" : f"{tid}"}
            request_body = {"queryStringParameters": request_params}
            crawl_params.append(request_body)
        return crawl_params

    

