import requests
import json
import ast
import json
import boto3
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
import traceback
import random
import os
import string
import uuid


def lambda_handler(event, context):=
    key = event["key"]
    tid = event["tid"]
    aid = event["aid"]
    crawler_list = event["crawler_list"]
    env = event["env"]

    minimum_price = event.get("minimum_price")
    input_price = event.get("input_price")
    isbn13 = event.get("isbn13")
    isbn10 = event.get("isbn10")
    crawl_params = []

    for crawler in crawler_list:
        if crawler == "meesho":
            for page in range(0, 20):  # 20 for meesho since too many results
                request_params = {"key": f"{key}", "engine": f"{crawler}",
                                  "aid": f"{aid}", "env": f"{env}", "page": f"{page}"}
                request_body = {"queryStringParameters": request_params}
                crawl_params.append(request_body)
            return crawl_main(crawl_params, aid, env, key, minimum_price, input_price, isbn10, isbn13, tid)

        for page in range(0, 10):  # 10
            request_params = {"key": f"{key}", "engine": f"{crawler}",
                              "aid": f"{aid}", "env": f"{env}", "page": f"{page}"}
            request_body = {"queryStringParameters": request_params}
            crawl_params.append(request_body)
    if crawl_params[0]["queryStringParameters"]["engine"] == 'amazon':      # for main listing
        request_params = {"key": f"{key}", "engine": f"{crawler}",
                          "aid": f"{aid}", "env": f"{env}", "page": f"{page}"}
        request_body = {"queryStringParameters": request_params}
        crawl_params.append(request_body)
    # return crawl_params
    return crawl_main(crawl_params, aid, env, key, minimum_price, input_price, isbn10, isbn13, tid)


def is_undefined_or_none(value):
    return value in ["undefined", None]


def crawl_main(crawl_params, aid, env, key, minimum_price, input_price, isbn10, isbn13, tid):

    crawl_params_sellers = []
    with ThreadPoolExecutor(max_workers=50) as pool:
        responses = pool.map(post_url, crawl_params)
        # print(responses)
        # return responses
        results = []
        # print(responses)
        try:
            for x in responses:
                try:
                    parsed_response = json.loads(x)
                    results.append(parsed_response)
                    # return results
                    # results contain Flipkart Ecom Scan output
                except Exception as e:
                    print(e)
                    continue
        except Exception as e:
            print(e)
            pass
        list_listings = []
        engine = crawl_params[0]["queryStringParameters"]["engine"]

        if engine == "amazon":

            ''' 
             for results_page in range (0,len(results)) :
              for result in range  (0,len(results[results_page]["results"])) :
                           list_listings.append((results[results_page]["results"][result]))
             listings_distinct = [dict(s) for s in set(frozenset(d.items()) for d in list_listings)]  
             return listings_distinct
            '''
            for results_page in range(0, len(results)):
                # print(len(results))
                try:
                    for result in range(0, len(results[results_page]["results"])):
                        #   print(results[results_page]["results"])
                        list_listings.append(
                            (results[results_page]["results"][result]))
                        #   print(list_listings)
                        asin = results[results_page]["results"][result]["ASIN"]
                        #   print(asin)
                        # Create crawl parameters for fetching Amazon seller data using the ASIN
                        request_params_main = {
                            "ASIN": f"{asin}", "engine": f"{engine}_seller_main"}
                        request_body_main = {
                            "queryStringParameters": request_params_main}

                        #   request_body_main_json = json.dumps(request_body_main, indent=2)
                        #   print(request_body_main)
                        # Append the seller request parameters to crawl_params_sellers list
                        crawl_params_sellers.append(request_body_main)
                        #   for page in range (0,7) : #7
                        #     # request_params = {"key": f"{asin}" ,"engine": f"{engine}_seller", "page" : f"{page}"}
                        #     # request_body = {"queryStringParameters": request_params}
                        #     # # print(request_body)
                        #     # crawl_params_sellers.append(request_body)
                        #       request_params_main = {"key": f"{asin}" ,"engine": f"{engine}_seller_main"}  #, "page" : f"{page}"
                        #       request_body_main = {"queryStringParameters": request_params}
                        #       print(request_body_main)
                        #       crawl_params_sellers.append(request_body_main)
                except:
                    continue
        elif engine == "flipkart":
            print("hello results")
            print(results)
            # return results
            for results_page in range(0, len(results)):
                #  if "results" in results[results_page]:
                for result in range(0, len(results[results_page]["results"])):
                    list_listings.append(
                        (results[results_page]["results"][result]))
                    asin = results[results_page]["results"][result]["ASIN"]
                    request_params = {"ASIN": f"{asin}",
                                      "engine": f"{engine}_seller"}
                    # Here flipkart_seller_ecom_scan is being called
                    request_body = {"queryStringParameters": request_params}
                    crawl_params_sellers.append(request_body)
                # return list_listings
                #  else:
                #      print("The 'results' key is not present in the dictionary.")
                #      print(list_listings)
                    # return list_listings

        elif engine == "meesho":

            listings_with_price = []

            for results_page in range(0, len(results)):
                # return results
                try:
                    for result in range(0, len(results[results_page]["results"])):
                        list_listings.append(
                            (results[results_page]["results"][result]))
                except:
                    continue
            listings_distinct = [dict(s) for s in set(
                frozenset(d.items()) for d in list_listings)]

            for listings in range(0, len(listings_distinct)):
                try:
                    response = requests.get(
                        listings_distinct[listings]["source"])
                    soup = BeautifulSoup(response.content, 'html.parser')
                    title = soup.title.string.strip()
                    if (float(listings_distinct[listings]["price"]) <= float(minimum_price)):
                        price = listings_distinct[listings]["price"] or "NA"
                        source = listings_distinct[listings]["source"] or "NA"
                        dicti = {}
                        dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ISBN NOT FOUND  '
                        dicti["source"] = fr'{source}'
                        dicti["description"] = fr'{title}'
                        dicti["env"] = fr'{env}'

                        listings_with_price.append(dicti)

                    else:
                        price = listings_distinct[listings]["price"] or "NA"
                        source = listings_distinct[listings]["source"] or "NA"
                        dicti = {}
                        dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ISBN NOT FOUND '
                        dicti["source"] = fr'{source}'
                        dicti["description"] = fr'{title}'
                        dicti["env"] = fr'{env}'

                        listings_with_price.append(dicti)

                except Exception as e:
                    print(e)
                    continue

            s3 = boto3.resource('s3')
            s3object = s3.Object(
                'credentials-db-new', f'data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json')
            s3object.put(
                Body=(bytes(json.dumps(listings_with_price).encode('UTF-8')))
            )
            list_result = []
            list_result.append({"bucket": "credentials-db-new",
                               "bucket_path": f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json", "env": f"{env}"})
            return list_result
            # return {"bucket" : "credentials_db","bucket_path" : f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/data.json","env" : f"{env}"}

            listings_distinct = [dict(s) for s in set(
                frozenset(d.items()) for d in list_listings)]
            # print(listings_distinct)

        elif engine == 'snapdeal':

            listings_with_price = []
            # Run loop for number of results obtained
            for results_page in range(0, len(results)):
                # print(results[results_page])
                try:
                    for result in range(0, len(results[results_page]["results"])):
                        list_listings.append(
                            (results[results_page]["results"][result]))
                except:
                    continue
            listings_distinct = [dict(s) for s in set(
                frozenset(d.items()) for d in list_listings)]
            for listings in range(0, len(listings_distinct)):

                try:
                    response = requests.get(
                        listings_distinct[listings]["source"])

                    soup = BeautifulSoup(response.content, 'html.parser')

                    s = soup.findAll('span', class_='h-content')

                    # print(s);

                    isbn10_book = s[1].getText().replace("ISBN10:", "") or "NA"
                    # print("isbn10 book is as follows " + isbn10_book);
                    isbn13_book = s[0].getText().replace(
                        "ISBN13:", "").replace("-", "") or "NA"
                    # print(listings_distinct[listings]["price"])
                    if (int(listings_distinct[listings]["price"]) <= int(minimum_price)):
                        if (int(isbn10_book) == int(isbn10) or int(isbn13_book) == int(isbn13)):
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ISBN MATCHED | ISBN10 - {isbn10_book}  | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)
                        else:
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ISBN MISMATCHED | ISBN10 - {isbn10_book}  | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)

                    else:
                        if (int(isbn10_book) == int(isbn10) or int(isbn13_book) == int(isbn13)):
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ISBN MATCHED | ISBN10 - {isbn10_book}  | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)
                        else:
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ISBN MISMATCHED | ISBN10 - {isbn10_book}  | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)
                except:
                    continue

            # print(listings_with_price)
            s3 = boto3.resource('s3')
            s3object = s3.Object(
                'credentials-db-new', f'data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json')
            s3object.put(
                Body=(bytes(json.dumps(listings_with_price).encode('UTF-8')))
            )
            list_result = []
            list_result.append({"bucket": "credentials-db-new",
                               "bucket_path": f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json", "env": f"{env}"})
            return list_result
            # return {"bucket" : "credentials_db","bucket_path" : f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/data.json","env" : f"{env}"}

            listings_distinct = [dict(s) for s in set(
                frozenset(d.items()) for d in list_listings)]
            # print(listings_distinct)

        elif engine == 'aibh':
            listings_with_price = []
            for results_page in range(0, len(results)):
                try:
                    for result in range(0, len(results[results_page]["results"])):
                        list_listings.append(
                            (results[results_page]["results"][result]))
                except:
                    continue
            listings_distinct = [dict(s) for s in set(
                frozenset(d.items()) for d in list_listings)]
            # return (listings_distinct)
            for listings in range(0, len(listings_distinct)):
                # print(listings_distinct[listings])
                try:
                    response = requests.get(
                        listings_distinct[listings]["source"])
                    soup = BeautifulSoup(response.content, 'html.parser')
                    s = soup.findAll(
                        'td', attrs={'class': 'font-weight-bold', 'itemprop': 'isbn'})
                    title_upd = soup.findAll('h1', class_='product__name')
                    # isbn10_book = s[1].getText().replace("ISBN10:","") or "NA"
                    isbn13_book = s[0].getText() or "NA"
                    if (int(listings_distinct[listings]["price"]) <= int(minimum_price)):
                        if (int(isbn13_book) == int(isbn13)):
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ISBN MATCHED | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)
                        else:
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ISBN MISMATCHED | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)

                    else:
                        if (int(isbn13_book) == int(isbn13)):
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ISBN MATCHED | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)
                        else:
                            title = listings_distinct[listings]["title"] or "NA"
                            price = listings_distinct[listings]["price"] or "NA"
                            source = listings_distinct[listings]["source"] or "NA"
                            dicti = {}
                            dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ISBN MISMATCHED | ISBN13- {isbn13_book}  '
                            dicti["source"] = fr'{source}'
                            dicti["description"] = fr'{title}'
                            dicti["env"] = fr'{env}'

                            listings_with_price.append(dicti)
                except Exception as e:
                    print(e)
                    continue

            # print(listings_with_price)
            s3 = boto3.resource('s3')
            s3object = s3.Object(
                'credentials-db-new', f'data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json')
            s3object.put(
                Body=(bytes(json.dumps(listings_with_price).encode('UTF-8')))
            )
            list_result = []
            list_result.append({"bucket": "credentials-db-new",
                               "bucket_path": f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json", "env": f"{env}"})
            return list_result
            # return {"bucket" : "credentials_db","bucket_path" : f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/data.json","env" : f"{env}"}

            listings_distinct = [dict(s) for s in set(
                frozenset(d.items()) for d in list_listings)]
            # print(listings_distinct)

        else:
            listings_with_price = []
            for results_page in range(0, len(results)):
                try:
                    for result in range(0, len(results[results_page]["results"])):
                        list_listings.append(
                            (results[results_page]["results"][result]))
                except Exception as e:
                    print(e)
                    continue
            listings_distinct = [dict(s) for s in set(
                frozenset(d.items()) for d in list_listings)]
            for listings in range(0, len(listings_distinct)):
                try:
                    if (float(listings_distinct[listings]["price"]) <= float(minimum_price)):
                        title = listings_distinct[listings]["title"] or "NA"
                        price = listings_distinct[listings]["price"] or "NA"
                        source = listings_distinct[listings]["source"] or "NA"
                        dicti = {}
                        dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ISBN NOT FOUND  '
                        dicti["source"] = fr'{source}'
                        dicti["description"] = fr'{title}'
                        dicti["env"] = fr'{env}'

                        listings_with_price.append(dicti)

                    else:
                        title = listings_distinct[listings]["title"] or "NA"
                        price = listings_distinct[listings]["price"] or "NA"
                        source = listings_distinct[listings]["source"] or "NA"
                        dicti = {}
                        dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ISBN NOT FOUND '
                        dicti["source"] = fr'{source}'
                        dicti["description"] = fr'{title}'
                        dicti["env"] = fr'{env}'

                        listings_with_price.append(dicti)

                except Exception as e:
                    print(e)
                    continue
            s3 = boto3.resource('s3')
            s3object = s3.Object(
                'credentials-db-new', f'data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json')
            s3object.put(
                Body=(bytes(json.dumps(listings_with_price).encode('UTF-8')))
            )
            list_result = []
            list_result.append({"bucket": "credentials-db-new",
                               "bucket_path": f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json", "env": f"{env}"})
            return list_result

    listings_distinct = [dict(s) for s in set(
        frozenset(d.items()) for d in list_listings)]
    # print("hello listings_distinct is being returned")
    # return listings_distinct

    return crawl_sellers(crawl_params_sellers, listings_distinct, engine, aid, env, key, minimum_price, input_price, isbn10, isbn13, tid)


def crawl_sellers(crawl_params, listings_distinct, engine, aid, env, key, minimum_price, input_price, isbn10, isbn13, tid):

    with ThreadPoolExecutor(max_workers=50) as pool:
        #  print(crawl_params)
        responses = pool.map(post_url, crawl_params)
        results = [json.loads(x) for x in responses]
        # results contains Returns seller data
        # print(results)
        # return results
        list_sellers = []
        for results_count in range(0, len(results)):
            try:
                for sellers_details in range(0, len(results[results_count]["results"])):
                    list_sellers.append(
                        results[results_count]["results"][sellers_details])
            except:
                continue

        # return list_sellers
        sellers_distinct = [dict(s) for s in set(
            frozenset(d.items()) for d in list_sellers)]

        # Create a set of distinct sellers based on the "seller" attribute
    #  distinct_sellers = {}
    #  for seller_info in list_sellers:
    #      seller_name = seller_info["seller"]
    #      if seller_name not in distinct_sellers:
    #          distinct_sellers[seller_name] = seller_info

    #  # Convert the dictionary values back to a list to get distinct seller dictionaries
    #  sellers_distinct = list(distinct_sellers.values())

    #  return listings_distinct
    #  return sellers_distinct

    #  sellers_distinct contains data from seller scan
    #  listings_distinct contains data from ecom scan
    #  print (listings_distinct)
    #  print (sellers_distinct)

        listings_with_price = []
    #  is_price_isbn_absent = minimum_price is None and isbn13 is None and isbn10 is None and input_price is None
    #  is_price_isbn_absent = minimum_price is None and isbn13 == "undefined" and isbn10 == "undefined" and input_price is None

        is_price_isbn_absent = all([
            is_undefined_or_none(minimum_price),
            is_undefined_or_none(input_price),
            is_undefined_or_none(isbn13),
            is_undefined_or_none(isbn10)
        ])

        for listings in range(0, len(listings_distinct)):

            for sellers in range(0, len(sellers_distinct)):

                try:
                    if sellers_distinct[sellers]["ASIN"] == listings_distinct[listings]["ASIN"]:
                        # print("Hello")
                        if ((int(sellers_distinct[sellers]["price"]) <= int(minimum_price))):
                            if (sellers_distinct[sellers]["ASIN"] == isbn10 or sellers_distinct[sellers]["ASIN"] == isbn13):
                                title = listings_distinct[listings]["title"] or "NA"
                                price = sellers_distinct[sellers]["price"] or "NA"
                                asin = listings_distinct[listings]["ASIN"] or "NA"
                                cover = listings_distinct[listings]["cover"] or "NA"
                                author = listings_distinct[listings]["author"] or "NA"
                                seller = sellers_distinct[sellers]["seller"] or "NA"
                                seller_id = sellers_distinct[sellers]["sellerID"] or "NA"
                                condition = sellers_distinct[sellers]["condition"] or "NA"
                                source = listings_distinct[listings]["source"] or "NA"
                                seller = seller.strip()
                                dicti = {}
                                dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ASIN - {asin} (ISBN MATCHED)| COVER IMAGE - {cover}  | AUTHOR - {author} | SELLER - {seller} | SELLER_ID - {seller_id}|  CONDITION - {condition}  '
                                dicti["source"] = fr'{source}#{seller}'
                                dicti["description"] = fr'{title}'
                                dicti["env"] = fr'{env}'

                                listings_with_price.append(dicti)
                            else:
                                title = listings_distinct[listings]["title"] or "NA"
                                price = sellers_distinct[sellers]["price"] or "NA"
                                asin = listings_distinct[listings]["ASIN"] or "NA"
                                cover = listings_distinct[listings]["cover"] or "NA"
                                author = listings_distinct[listings]["author"] or "NA"
                                seller = sellers_distinct[sellers]["seller"] or "NA"
                                seller_id = sellers_distinct[sellers]["sellerID"] or "NA"
                                condition = sellers_distinct[sellers]["condition"] or "NA"
                                source = listings_distinct[listings]["source"] or "NA"
                                seller = seller.strip()
                                dicti = {}
                                dicti["title"] = fr' TITLE - {title}| PRICE - {price} (UNDERPRICED) | ASIN - {asin} (ISBN MISMATCHED)| COVER IMAGE - {cover}  | AUTHOR - {author} | SELLER - {seller} | SELLER_ID - {seller_id}|  CONDITION - {condition}  '
                                dicti["source"] = fr'{source}#{seller}'
                                dicti["description"] = fr'{title}'
                                dicti["env"] = fr'{env}'

                                listings_with_price.append(dicti)

                        elif ((int(sellers_distinct[sellers]["price"]) > int(minimum_price))):
                            if (sellers_distinct[sellers]["ASIN"] == isbn10 or sellers_distinct[sellers]["ASIN"] == isbn13):
                                title = listings_distinct[listings]["title"] or "NA"
                                price = sellers_distinct[sellers]["price"] or "NA"
                                asin = listings_distinct[listings]["ASIN"] or "NA"
                                cover = listings_distinct[listings]["cover"] or "NA"
                                author = listings_distinct[listings]["author"] or "NA"
                                seller = sellers_distinct[sellers]["seller"] or "NA"
                                seller_id = sellers_distinct[sellers]["sellerID"] or "NA"
                                condition = sellers_distinct[sellers]["condition"] or "NA"
                                source = listings_distinct[listings]["source"] or "NA"
                                seller = seller.strip()
                                dicti = {}
                                dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ASIN - {asin}(ISBN MATCHED)| COVER IMAGE - {cover}  | AUTHOR - {author} | SELLER - {seller} | SELLER_ID - {seller_id}|  CONDITION - {condition}  '
                                dicti["source"] = fr'{source}#{seller}'
                                dicti["description"] = fr'{title}'
                                dicti["env"] = fr'{env}'

                                listings_with_price.append(dicti)
                            else:
                                title = listings_distinct[listings]["title"] or "NA"
                                price = sellers_distinct[sellers]["price"] or "NA"
                                asin = listings_distinct[listings]["ASIN"] or "NA"
                                cover = listings_distinct[listings]["cover"] or "NA"
                                author = listings_distinct[listings]["author"] or "NA"
                                seller = sellers_distinct[sellers]["seller"] or "NA"
                                seller_id = sellers_distinct[sellers]["sellerID"] or "NA"
                                condition = sellers_distinct[sellers]["condition"] or "NA"
                                source = listings_distinct[listings]["source"] or "NA"
                                seller = seller.strip()
                                dicti = {}
                                dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ASIN - {asin}(ISBN MISMATCHED)| COVER IMAGE - {cover}  | AUTHOR - {author} | SELLER - {seller} | SELLER_ID - {seller_id}|  CONDITION - {condition}  '
                                dicti["source"] = fr'{source}#{seller}'
                                dicti["description"] = fr'{title}'
                                dicti["env"] = fr'{env}'

                                listings_with_price.append(dicti)
                    elif is_price_isbn_absent:
                        title = listings_distinct[listings]["title"] or "NA"
                        price = sellers_distinct[sellers]["price"] or "NA"
                        asin = listings_distinct[listings]["ASIN"] or "NA"
                        cover = listings_distinct[listings]["cover"] or "NA"
                        author = listings_distinct[listings]["author"] or "NA"
                        seller = sellers_distinct[sellers]["seller"] or "NA"
                        seller_id = sellers_distinct[sellers]["sellerID"] or "NA"
                        condition = sellers_distinct[sellers]["condition"] or "NA"
                        source = listings_distinct[listings]["source"] or "NA"
                        seller = seller.strip()
                        dicti = {}
                        dicti["title"] = fr' TITLE - {title}| PRICE - {price} | ASIN - {asin}| COVER IMAGE - {cover}  | AUTHOR - {author} | SELLER - {seller} | SELLER_ID - {seller_id}|  CONDITION - {condition}  '
                        dicti["source"] = fr'{source}#{seller}'
                        dicti["description"] = fr'{title}'
                        dicti["env"] = fr'{env}'
                        listings_with_price.append(dicti)

                except Exception as e:
                    print(e)
                    continue

    print(listings_with_price)
    s3 = boto3.resource('s3')
    # s3object = s3.Object('credentials-db-new', f'data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json')
    unique_id = str(uuid.uuid4())
    s3object = s3.Object(
        'credentials-db-new', f'data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/{unique_id}_data.json')
    s3object.put(
        Body=(bytes(json.dumps(listings_with_price).encode('UTF-8')))
    )
    list_result = []
    # list_result.append({"bucket": "credentials-db-new","bucket_path" : f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/data.json","env" : f"{env}"})
    list_result.append({"bucket": "credentials-db-new",
                       "bucket_path": f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/{tid}/{unique_id}_data.json", "env": f"{env}"})
    # print("List result" + list_result)
    return list_result
    # return {"bucket": "credentials-db-new","bucket_path" : f"data-digital-piracy-scan/ecom-daily/{aid}/{engine}/data.json","env" : f"{env}"}


def post_url(params):
    try:
        # return json.dumps(params)
        # print(params)

        # if params['queryStringParameters']['engine'] == 'flipkart':
        #     api_endpoint_default = 'flipkart_ecom_scan'
        #     response_default = invoke_lambda_function(api_endpoint_default, params)
        #     #values_default = json.loads(response_default)
        #     return response_default

        # elif params['queryStringParameters']['engine'] == 'flipkart_seller':
        #     api_endpoint_default = 'flipkart_seller_ecom_scan'
        #     response_default = invoke_lambda_function(api_endpoint_default, params)
        #     #values_default = json.loads(response_default)
        #     return response_default

        if params['queryStringParameters']['engine'] == 'amazon':
            api_endpoint_default = 'amazon_ecom'
            response_default = invoke_lambda_function(
                api_endpoint_default, params)
            # print(response_default)
            return response_default

        if params['queryStringParameters']['engine'] == 'amazon_seller_main':
            api_endpoint_default = 'amazon_seller_ecom'
            # params2=json.dumps(params, indent=2)
            print(params)
            response_default = invoke_lambda_function(
                api_endpoint_default, params)
            print(response_default)
            return response_default

        else:
            api_endpoint_default = 'ecom-scanner-get-request'
            api_endpoint_backup = 'Ecom_Scanner_2_rate_limit_backup'
            response_default = invoke_lambda_function(
                api_endpoint_default, params)
            values_default = json.loads(response_default)

            if values_default['results_length'] == 0:
                response_backup = invoke_lambda_function(
                    api_endpoint_backup, params)
                values_backup = json.loads(response_backup)
                # print(values_backup+"values_")
                return response_backup
            return json.dumps(values_default)
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        response_backup = invoke_lambda_function(api_endpoint_backup, params)
        return response_backup


def invoke_lambda_function(api_endpoint, params):
    aws_access_key = os.environ['AWS_ACCESS_KEYS']
    aws_secret_key = os.environ['AWS_SECRET_KEYS']
    aws_region = 'ap-south-1'

    session = boto3.session.Session()

    lambda_client = session.client(
        'lambda',
        region_name=aws_region,
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key
    )

    request_body = json.dumps(params)

    response = lambda_client.invoke(
        FunctionName=api_endpoint,
        InvocationType='RequestResponse',
        Payload=request_body
    )

    response_payload = response['Payload'].read().decode('utf-8')
    # print (response_payload)
    return response_payload
