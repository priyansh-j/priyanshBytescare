const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;



const inputString = `
https://www.amazon.in/Oswaal-ICSE-Question-Class-Biology/dp/935634986X
https://www.amazon.in/Oswaal-ICSE-Question-Class-Geography/dp/9356349878
https://www.amazon.in/Oswaal-Question-Class-History-Civics/dp/9356349886
https://www.amazon.in/Oswaal-Sample-Question-Geography-Specimen/dp/9357288422
https://www.amazon.in/Oswaal-Sample-Question-Classes-Specimen/dp/9357288333
https://www.amazon.in/Oswaal-Sample-Question-Mathematics-Specimen/dp/9357288279
https://www.amazon.in/Oswaal-Sample-Question-Economics-Specimen/dp/9357288325
https://www.amazon.in/Oswaal-Sample-Question-English-1-Specimen/dp/9357288236
https://www.amazon.in/Oswaal-Sample-Question-Papers-English-1-ebook/dp/B0DCNMLT1F
https://www.amazon.in/Oswaal-Sample-Question-Biology-Specimen/dp/9357288406
https://www.amazon.in/Oswaal-Sample-Question-English-2-Specimen/dp/9357288244
https://www.amazon.in/Oswaal-ICSE-Question-Class-Physics/dp/9356349835
https://www.amazon.in/Oswaal-Question-Commercial-Studies-Specimen/dp/9357288449
https://www.amazon.in/Oswaal-Sample-Question-Geography-Specimen/dp/9357288309
https://www.amazon.in/Oswaal-Question-Class-Physical-Education/dp/9356349193
https://www.amazon.in/Oswaal-Sample-Question-Papers-Physics-ebook/dp/B0DCNJFQT5
https://www.amazon.in/Oswaal-Question-Class-10-English-Paper-I/dp/9356343934
https://www.amazon.in/Oswaal-Sample-Question-Physics-Specimen/dp/9357288260
https://www.amazon.in/Oswaal-English-Geography-History-Question/dp/9356340676
https://www.amazon.in/Oswaal-ICSE-Question-Class-Hindi/dp/935595428X
https://www.amazon.in/Oswaal-Question-Chemistry-Chapterwise-Topicwise/dp/9359581690
https://www.amazon.in/Oswaal-Sample-Question-English-Language/dp/9354630243
https://www.amazon.in/Oswaal-Sample-Question-Papers-Mathematics-ebook/dp/B0DCN4WKBV
https://www.amazon.in/Oswaal-Sample-Question-Class-9-Mathematics/dp/9356343837
https://www.amazon.in/Oswaal-Question-English-2-Chapterwise-Topicwise/dp/9359580643
https://www.amazon.in/Question-Business-Studies-Chapterwise-Topicwise/dp/9359581623
https://www.amazon.in/Oswaal-Question-Physics-Chapterwise-Topicwise/dp/9359583928
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Mathematics/dp/9354632734
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Physics-Chemistry/dp/936239457X
https://www.amazon.in/Oswaal-Question-SOLVED-Accounts-2024-25/dp/9359583162
https://www.amazon.in/Oswaal-Question-Commercial-Applications-Specimen/dp/9357288465
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Biology-Hardcover/dp/9359582212
https://www.amazon.in/Question-Literature-Previous-Chaptewise-Topicwise/dp/9355950454
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Computer-Science/dp/9359588776
https://www.amazon.in/Oswaal-Sample-Question-Chemistry-Specimen/dp/9357288252
https://www.amazon.in/previous-solved-year-wise-2014-2024-Class-12/dp/9359587915
https://www.amazon.in/Oswaal-ICSE-Question-Class-Economics/dp/9356349940
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Education/dp/935463091X
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Chemistry-Mathematics/dp/9362392860
https://www.amazon.in/Oswaal-Sample-Question-Class-9-Economic/dp/9356343772
https://www.amazon.in/Question-Physical-Education-Chapterwise-Topicwise/dp/9359584711
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Accounts-Economics/dp/9357283439
https://www.amazon.in/Oswaal-Question-Class-Economic-Applications/dp/9356348669
https://www.amazon.in/Oswaal-Question-SOLVED-Commerce-2024-25/dp/9359584401
https://www.amazon.in/Question-Physics-Chemistry-Biology-2022-23/dp/9355956576
https://www.amazon.in/Oswaal-Question-Chemistry-Chapterwise-Topicwise/dp/9359589632
https://www.amazon.in/Oswaal-Question-English-Paper-1-Language/dp/9355954298
https://www.amazon.in/Oswaal-Question-PAPERS_Class-11_Economics_For-2024-25/dp/9359584789
https://www.amazon.in/Question-History-Chapterwise-Topicwise-Hardcover/dp/9359583960
https://www.amazon.in/Oswaal-Question-Class-10-Computer-Applications/dp/935634390X
https://www.amazon.in/Oswaal-Sample-Question-Class-10-Mathematics/dp/9356343985
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-History/dp/9354632629
https://www.amazon.in/Oswaal-Question-SOLVED-English-2024-25/dp/9359587192
https://www.amazon.in/Oswaal-Question-Mathematics-Chapterwise-Topicwise/dp/9359589802
https://www.amazon.in/Question-Economic-Applications-Chaptewise-Topicwise/dp/935595056X
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Chemistry-Mathematics/dp/9362397315
https://www.amazon.in/Question-Language-Chapterwise-Topicwise-Syllabus/dp/9354236871
https://www.amazon.in/Question-History-Previous-Chaptewise-Topicwise/dp/9355951620
https://www.amazon.in/Question-Chemistry-Previous-Chaptewise-Topicwise/dp/9355950144
https://www.amazon.in/Oswaal-Question-Class-10-English-Paper-II/dp/9356343942
https://www.amazon.in/Oswaal-Question-Economics-Chapterwise-Topicwise/dp/9359588962
https://www.amazon.in/Oswaal-Sample-Question-Semester-Physics/dp/9354638015
https://www.amazon.in/Oswaal-Question-Commercial-Studies-Specimen/dp/9357288317
https://www.amazon.in/Oswaal-Sample-Question-Papers-Class-10/dp/9356343969
https://www.amazon.in/Oswaal-Question-SOLVED-Physics-2024-25/dp/9359585580
https://www.amazon.in/Oswaal-Question-Class-Commercial-Studies/dp/9356348677
https://www.amazon.in/Oswaal-Question-Accounts-Chapterwise-Topicwise/dp/9359581321
https://www.amazon.in/Oswaal-Question-Geography-Reduced-Syllabus/dp/935423187X
https://www.amazon.in/Oswaal-Question-Class-Commercial-Studies/dp/9356349959
https://www.amazon.in/Oswaal-Question-Class-10-Economic-Applications/dp/9356343918
https://www.amazon.in/English-Paper-1-Chemistry-Question-Specimen/dp/9356342490
https://www.amazon.in/Oswaal-Sample-Question-Class-9-Physics/dp/9356343853
https://www.amazon.in/Oswaal-Question-Chapterwise-Topicwise-Solved/dp/9359586579
https://www.amazon.in/Oswaal-Question-English-Language-Literature/dp/B0CKG62GT6
https://www.amazon.in/Oswaal-Question-Class-10-Commercial-Application/dp/9356343888
https://www.amazon.in/Oswaal-Sample-Question-Economics-Specimen/dp/9357288414
https://www.amazon.in/Oswaal-Sample-Question-Class-10-Chemistry/dp/935634387X
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Geography/dp/9354632769
https://www.amazon.in/Question-Chemistry-Previous-Chaptewise-Topicwise/dp/9355956215
https://www.amazon.in/Question-Geography-Chapterwise-Topicwise-Hardcover/dp/9359582662
https://www.amazon.in/Question-PAPERS_Class-11_Computer-Science_For-2024-25/dp/935958052X
https://www.amazon.in/Oswaal-Question-Commerce-Chapterwise-Topicwise/dp/935958035X
https://www.amazon.in/Question-Biology-Previous-Chaptewise-Topicwise/dp/9355954190
https://www.amazon.in/Chapterwise-Question-Physical-Education-Semester-ebook/dp/B09G6ST7RZ
https://www.amazon.in/Combined-Question-Mathematics-Geography-Chemistry/dp/9354638295
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Applications/dp/9354630839
https://www.amazon.in/Oswaal-Workbook-Class-2-Mathematics-Latest/dp/9355950578
https://www.amazon.in/Oswaal-Question-Economics-Chapterwise-Topicwise/dp/938846284X
https://www.amazon.in/Oswaal-Sample-Question-Class-10-History/dp/9356343977
https://www.amazon.in/Oswaal-ICSE-Question-Class-Physics/dp/9355950071
https://www.amazon.in/Oswaal-Sample-Question-Papers-Biology-ebook/dp/B0DCMQLHFZ
https://www.amazon.in/Oswaal-Sample-Question-Class-9-History/dp/9356343829
https://www.amazon.in/Oswaal-Sample-Question-Class-10-Commercial/dp/9356343896
https://www.amazon.in/Oswaal-Question-Class-9-English-Paper-II/dp/9356343799
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Literature/dp/9354632637
https://www.amazon.in/Oswaal-Question-Class-11-English-Paper-1/dp/9356344329
https://www.amazon.in/Oswaal-English-Physics-Chemistry-Question/dp/9356340641
https://www.amazon.in/Oswaal-Sample-Question-Papers-Chemistry-ebook/dp/B0DCNB8RW6
https://www.amazon.in/Oswaal-Question-Physics-Reduced-Syllabus/dp/9354231276
https://www.amazon.in/Oswaal-Sample-Question-English-2-Specimen/dp/9357288627
https://www.amazon.in/Oswaal-Sample-Question-Class-9-Geography/dp/9356343802
https://www.amazon.in/Oswaal-Sample-Question-Biology-Specimen/dp/9357288287
https://www.amazon.in/Question-Geography-Previous-Chaptewise-Topicwise/dp/935595154X
https://www.amazon.in/Oswaal-Question-Class-10-Physical-Education/dp/9356343993
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Biology/dp/9354632572
https://www.amazon.in/Question-Physics-Previous-Chaptewise-Topicwise/dp/9355954123
https://www.amazon.in/Oswaal-Question-Class-9-English-Paper-I/dp/9356343780
https://www.amazon.in/Physics-Chemistry-Biology-Question-Specimen/dp/9356342504
https://www.amazon.in/Question-Class-10-English-Paper-II-Paper-I/dp/B0C4YB621L
https://www.amazon.in/Oswaal-Sample-Question-Class-10-Biology/dp/9356343861
https://www.amazon.in/Question-Physical-Education-Chaptewise-Topicwise/dp/9355951701
https://www.amazon.in/Physics-Chemistry-Biology-Question-Specimen/dp/9356342482
https://www.amazon.in/Question-Chemistry-Chapterwise-Topicwise-Syllabus/dp/9354237037
https://www.amazon.in/Oswaal-Sample-Question-Papers-Semester/dp/9354639917
https://www.amazon.in/Oswaal-Question-Economic-Applications-Specimen/dp/9357288457
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Language/dp/9354632718
https://www.amazon.in/Question-Classes-English-Literature-Class-10/dp/B0C53HTDRR
https://www.amazon.in/Question-Geography-Previous-Chaptewise-Topicwise/dp/9355954204
https://www.amazon.in/Oswaal-Sample-Question-Class-9-Chemistry/dp/9356343721
https://www.amazon.in/Oswaal-Sample-Question-Papers-Chemistry/dp/9354630367
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Chemistry/dp/9354632726
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Commercial/dp/9354632815
https://www.amazon.in/Oswaal-Question-Chapterwise-Topicwise-Syllabus/dp/9354236790
https://www.amazon.in/Oswaal-Sample-Question-English-1-Specimen/dp/9357288481
https://www.amazon.in/Oswaal-Sample-Question-Semester-Biology/dp/9355509553
https://www.amazon.in/Oswaal-Question-Bank-Class-Accounts/dp/9356349355
https://www.amazon.in/Oswaal-Physics-Chemistry-Biology-Question/dp/9356341397
https://www.amazon.in/Oswaal-Question-Physics-Chemistry-Biology/dp/B0C8TP7SBT
https://www.amazon.in/Oswaal-Sample-Question-Papers-Mathematics/dp/9354630391
https://www.amazon.in/Oswaal-Sample-Question-Papers-History/dp/935463057X
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Economics/dp/9354632750
https://www.amazon.in/Oswaal-Question-Class-9-Commercial-Studies/dp/9356343748
https://www.amazon.in/Oswaal-Sample-Question-Papers-Economics/dp/935463043X
https://www.amazon.in/Oswaal-Sample-Question-Class-10-Economics/dp/9356343926
https://www.amazon.in/Oswaal-Physics-Chemistry-Biology-Question/dp/9356341389
https://www.amazon.in/Question-Geography-Class-10-Computer-Applications/dp/B0C53HBS72
https://www.amazon.in/Question-Class-10-Economics-English-Paper-I/dp/B0C4YSPPGK
https://www.amazon.in/Question-Class-10-History-Computer-Applications/dp/B0C4YD1L57
https://www.amazon.in/Question-Class-10-Chemistry-Computer-Applications/dp/B0C4Y92BH7
https://www.amazon.in/Oswaal-Sample-Question-Class-9-Biology/dp/9356343276
https://www.amazon.in/Question-Class-10-Chapter-wise-Topic-wise-Literature/dp/B0C5B84SPB
https://www.amazon.in/Chapterwise-Question-English-Language-Semester-ebook/dp/B09FK9QLTR
https://www.amazon.in/Oswaal-Physics-Chemistry-Biology-Question/dp/B0BJF8Q6TC
https://www.amazon.in/Oswaal-Question-Class-9-Mathematics-Science/dp/B0C5X82L28
https://www.amazon.in/English-Physics-Chemistry-Biology-Question/dp/B0BJF6VJFT
https://www.amazon.in/Oswaal-Question-History-Reduced-Syllabus/dp/9354231888
https://www.amazon.in/Oswaal-Sample-Question-English-Literature/dp/9354630286
https://www.amazon.in/Question-Commercial-Studies-English-Literature/dp/B0CKFXC5Q8
https://www.amazon.in/Oswaal-Question-English-Language-Literature/dp/B0CKFVFPP2
https://www.amazon.in/English-Physics-Chemistry-Biology-Question/dp/9356341370
https://www.amazon.in/Chapterwise-Question-Computer-Applications-Semester-ebook/dp/B09GFQ3TJ4
https://www.amazon.in/Question-Chapterwise-Topicwise-Class-10-Physics-ebook/dp/B087CC47K5
https://www.amazon.in/Oswaal-Question-English-Paper-1-Language/dp/9356349517
https://www.amazon.in/Question-Class-10-Commercial-Application-Applications/dp/B0C59ZWLVS
https://www.amazon.in/Question-Class-10-Economic-Applications-English/dp/B0C53H2C8P
https://www.amazon.in/Question-Class-10-Commercial-Application-English/dp/B0C53F1CTP
https://www.amazon.in/Question-Class-10-Commercial-English-Paper-I/dp/B0C4YS9H37
https://www.amazon.in/Oswaal-English-Geography-History-Question/dp/B0BHSJ7B5L
https://www.amazon.in/English-Economics-Commerical-Studies-Question/dp/B0BKPSGDDK
https://www.amazon.in/Chapterwise-Question-History-Semester-Nov-Dec-ebook/dp/B09G2TS2DZ
https://www.amazon.in/Oswaal-Question-Mathematics-Reduced-Syllabus/dp/9354231438
https://www.amazon.in/Oswaal-Question-Classes-Class-10-Chemistry/dp/B0C5B83R7Q
https://www.amazon.in/Oswaal-Sample-Question-Paper-Mathematics/dp/935550280X
https://www.amazon.in/Oswaal-Physics-Chemistry-Biology-Question/dp/B0BJF8RDG7
https://www.amazon.in/Question-Physics-Chemistry-Biology-2022-23/dp/B0B1P2CL52
https://www.amazon.in/Chapterwise-Question-Geography-Semester-Nov-Dec-ebook/dp/B09G2TCNMS
https://www.amazon.in/Question-History-Previous-Chaptewise-Topicwise/dp/9355954212
https://www.amazon.in/Question-Literature-Class-10-Computer-Applications/dp/B0C5BKWCMY
https://www.amazon.in/Oswaal-Question-Physics-Chemistry-Biology/dp/B0D5YLVP2V
https://www.amazon.in/Oswaal-Sample-Question-Class-12-Commerce/dp/9356344051
https://www.amazon.in/Oswaal-Question-Class-10-Biology-Science/dp/B0C5X4T6WV
https://www.amazon.in/Oswaal-Workbook-Class-3-Science-Latest/dp/9355954239
https://www.amazon.in/Oswaal-Question-Semester-English-Literature/dp/9354639836
https://www.amazon.in/Chapterwise-Question-Mathematics-Semester-Nov-Dec-ebook/dp/B09FQ8HH5Y
https://www.amazon.in/Question-Chapterwise-Topicwise-Class-10-History-ebook/dp/B0877ZC2PB
https://www.amazon.in/Gurukul-Question-Chemistry-Physics-Mathematics/dp/B0D5QNKQF6
https://www.amazon.in/Question-Chapterwise-Topicwise-Class-10-Language-ebook/dp/B086VJYMZJ
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Physics-Chemistry/dp/9362398370
https://www.amazon.in/Question-Physical-Education-Chapterwise-Topicwise/dp/935958097X
https://www.amazon.in/Oswaal-Question-Mathematics-Chapterwise-Topicwise/dp/9359586722
https://www.amazon.in/Oswaal-Question-SOLVED-Biology-2024-25/dp/9359585165
https://www.amazon.in/Oswaal-Question-Class-Physics-Board/dp/9356349533
https://www.amazon.in/Oswaal-Question-Class-Computer-Science/dp/9356349703
https://www.amazon.in/previous-solved-year-wise-2014-2024-Class-12/dp/9359587311
https://www.amazon.in/Oswaal-Question-Bank-Class-Chemistry/dp/9356349541
https://www.amazon.in/Oswaal-Question-Class-Mathematics-Board/dp/935634955X
https://www.amazon.in/previous-year-wise-2014-2023-Class-12-Commerce/dp/9359581380
https://www.amazon.in/Oswaal-Question-Class-Biology-Board/dp/9356349592
https://www.amazon.in/Question-Business-Studies-Chapterwise-Topicwise/dp/935634938X
https://www.amazon.in/Oswaal-Question-English-Paper-2-Literature/dp/9356349525
https://www.amazon.in/Previous-Class-12-2018-2024-Chemistry-Mathematics/dp/9362398753
https://www.amazon.in/Oswaal-Question-Class-Economics-Board/dp/9356349576
https://www.amazon.in/Oswaal-Sample-Question-Economics-Specimen/dp/9357288678
https://www.amazon.in/Previous-Class-12-2018-2024-Commerce-Economics/dp/9362391783
https://www.amazon.in/Oswaal-Question-Chapterwise-Topicwise-English-2/dp/935728334X
https://www.amazon.in/Oswaal-Question-Bank-Classes-Hindi/dp/9356349401
https://www.amazon.in/Oswaal-Sample-Question-Mathematics-Specimen/dp/9357288651
https://www.amazon.in/Oswaal-Sample-Question-History-Specimen/dp/9357288597
https://www.amazon.in/Oswaal-Question-Business-Studies-2024-25/dp/9359581186
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-Specimen/dp/9359581771
https://www.amazon.in/Oswaal-Question-Class-Commerce-Board/dp/9356349568
https://www.amazon.in/Oswaal-Sample-Question-Class-12-Chemistry/dp/9356344043
https://www.amazon.in/Oswaal-Previous-Solved-2018-2023-Class-12/dp/935728723X
https://www.amazon.in/Oswaal-Sample-Question-Accounts-Specimen/dp/9357288686
https://www.amazon.in/Oswaal-Sample-Question-English-1-Specimen/dp/9357288619
https://www.amazon.in/Oswaal-Question-Class-Accounts-Board/dp/9356349584
https://www.amazon.in/Oswaal-Question-Bank-Class-Economics/dp/9356349363
https://www.amazon.in/Oswaal-Question-Bank-Class-Physics/dp/9356349312
https://www.amazon.in/Oswaal-Sample-Question-English-2-Specimen/dp/935728849X
https://www.amazon.in/Oswaal-Question-Bank-Class-Biology/dp/9356349347
https://www.amazon.in/Oswaal-Question-Class-Business-Studies/dp/9356349606
https://www.amazon.in/Question-Mathematics-Chapterwise-Topicwise-Hardcover/dp/9359582050
https://www.amazon.in/Oswaal-Sample-Question-Commerce-Specimen/dp/9357288694
https://www.amazon.in/Question-Chemistry-Previous-Chaptewise-Topicwise/dp/935595123X
https://www.amazon.in/Oswaal-Question-Bank-Class-Physics/dp/9355954581
https://www.amazon.in/Previous-Year-wise-2018-2024-Chemistry-Computer/dp/9362392097
https://www.amazon.in/Oswaal-Sample-Question-Class-12-Mathematics/dp/9356344124
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Accounts-Economics/dp/B0D5YL7TFP
https://www.amazon.in/Oswaal-Question-Commerce-Chapterwise-Topicwise/dp/9356349371
https://www.amazon.in/Question-Physics-Chemistry-Biology-Specimen/dp/9359581062
https://www.amazon.in/Oswaal-Question-Bank-Class-Mathematics/dp/9356349339
https://www.amazon.in/Question-Physics-Chemistry-Biology-English/dp/9357281037
https://www.amazon.in/Question-Accounts-Economics-Commerce-Specimen/dp/9359585750
https://www.amazon.in/Oswaal-Sample-Question-Economics-Specimen/dp/9357288554
https://www.amazon.in/Oswaal-Question-Physical-Education-2023-24/dp/9356349711
https://www.amazon.in/Oswaal-Sample-Question-Class-12-Accounts/dp/9356344019
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-English/dp/9357281142
https://www.amazon.in/Oswaal-Previous-Solved-2018-2023-Class-12/dp/9357287248
https://www.amazon.in/Oswaal-Question-Semester-English-Language/dp/9354637779
https://www.amazon.in/Question-Literature-Previous-Chaptewise-Topicwise/dp/9355954573
https://www.amazon.in/Oswaal-Sample-Question-Mathematics-Specimen/dp/935728852X
https://www.amazon.in/Oswaal-Question-Computer-science-Specimen/dp/9357288708
https://www.amazon.in/Question-Physics-Chemistry-Biology-Specimen/dp/9356344663
https://www.amazon.in/Question-Accounts-Economics-Commerce-English/dp/9357281150
https://www.amazon.in/Oswaal-Question-Class-11-Computer-Science/dp/9356344302
https://www.amazon.in/Oswaal-Sample-Question-Biology-Specimen/dp/9357288538
https://www.amazon.in/Oswaal-Sample-Question-Accounts-Specimen/dp/9357288546
https://www.amazon.in/Oswaal-Sample-Question-Papers-History/dp/9356340684
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Accounts-Economics/dp/B0D7ZP9R77
https://www.amazon.in/Oswaal-Question-Business-Studies-Specimen/dp/9359589667
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Physics-Chemistry/dp/B0D5YGD8FV
https://www.amazon.in/English-Paper-1-Paper-2-Chemistry-Question/dp/9356341311
https://www.amazon.in/Oswaal-Sample-Question-Physics-Specimen/dp/9357288511
https://www.amazon.in/Oswaal-Question-Business-studies-Specimen/dp/9357288570
https://www.amazon.in/Oswaal-Sample-Question-Class-11-Mathematics/dp/9356344337
https://www.amazon.in/Question-Accountancy-Economics-Commerce-Specimen/dp/9359589330
https://www.amazon.in/Oswaal-Sample-Question-Physics-Specimen/dp/9357288643
https://www.amazon.in/Question-Business-Previous-Chaptewise-Topicwise/dp/9355954492
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Chemistry-Mathematics/dp/B0D5YNMRMQ
https://www.amazon.in/Oswaal-Sample-Question-Class-12-Physics/dp/9356344116
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-English/dp/9355957076
https://www.amazon.in/Oswaal-Sample-Question-Class-12-Economics/dp/9356344078
https://www.amazon.in/Oswaal-Question-Class-12-English-Paper-1/dp/9356344086
https://www.amazon.in/Accountancy-Economics-Business-Commerce-Question/dp/935634308X
https://www.amazon.in/Oswaal-Question-English-2-Chapterwise-Topicwise/dp/9362390973
https://www.amazon.in/Question-Chemistry-Previous-Chaptewise-Topicwise/dp/935595199X
https://www.amazon.in/Oswaal-Sample-Question-Chemistry-Specimen/dp/9357288503
https://www.amazon.in/Oswaal-Sample-Question-Computer-Science/dp/9355503814
https://www.amazon.in/Oswaal-Question-Class-12-Computer-Science/dp/935634406X
https://www.amazon.in/Oswaal-Sample-Question-Chemistry-Specimen/dp/9357288635
https://www.amazon.in/Oswaal-Sample-Question-Semester-Accounts/dp/935463835X
https://www.amazon.in/Question-Economics-Chapterwise-Topicwise-Hardcover/dp/9359583766
https://www.amazon.in/Question-Accounts-Previous-Chaptewise-Topicwise/dp/9355951302
https://www.amazon.in/Question-Chemistry-Previous-Chaptewise-Topicwise/dp/9355957084
https://www.amazon.in/Previous-Yearwise-2018-2023-Class-12-Commerce/dp/9357286837
https://www.amazon.in/Question-Business-Chapterwise-Topicwise-Hardcover/dp/9359580120
https://www.amazon.in/Chapterwise-Question-Chemistry-Semester-Nov-Dec/dp/9354638112
https://www.amazon.in/Oswaal-Sample-Question-Papers-Class-12/dp/9356344108
https://www.amazon.in/Question-Biology-Previous-Chaptewise-Topicwise/dp/9355952546
https://www.amazon.in/Oswaal-Question-Class-12-Business-Studies/dp/9356344035
https://www.amazon.in/Chapterwise-Question-Accounts-Semester-Nov-Dec/dp/935463821X
https://www.amazon.in/Oswaal-Question-Class-11-Business-Studies/dp/9356344272
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Biology/dp/9354638856
https://www.amazon.in/Chapterwise-Question-Economics-Semester-Nov-Dec-ebook/dp/B09G6TGBJ6
https://www.amazon.in/Oswaal-Sample-Question-Class-12-Biology/dp/9356344027
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Commerce/dp/9354638910
https://www.amazon.in/Question-Computer-Previous-Chaptewise-Topicwise/dp/9355954506
https://www.amazon.in/Oswaal-Sample-Question-Class-11-Chemistry/dp/9356344280
https://www.amazon.in/Oswaal-Question-Mathematics-Chapterwise-Topicwise/dp/9354634389
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Mathematics/dp/9354638821
https://www.amazon.in/Oswaal-Question-Class-12-English-Paper-2/dp/9356344132
https://www.amazon.in/Oswaal-Sample-Question-Class-11-Commerce/dp/9356344299
https://www.amazon.in/Chapterwise-Question-Physics-Semester-Nov-Dec-ebook/dp/B09FQ5DV7T
https://www.amazon.in/Chapterwise-Question-Mathematics-Semester-Nov-Dec/dp/9354638120
https://www.amazon.in/Combined-Question-Science-Physics-Chemistry/dp/9354635334
https://www.amazon.in/Oswaal-Sample-Question-Biology-Specimen/dp/935728866X
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-Specimen/dp/9356344655
https://www.amazon.in/Oswaal-Question-Chapterwise-Topicwise-Hardcover/dp/9359580422
https://www.amazon.in/Oswaal-Question-Accounts-Chapterwise-Topicwise-ebook/dp/B0CZD81FHD
https://www.amazon.in/Oswaal-Sample-Question-Semester-Mathematics/dp/9354638171
https://www.amazon.in/Oswaal-Question-Physics-Chapterwise-Topicwise/dp/9389067014
https://www.amazon.in/Oswaal-Sample-Question-Semester-Biology/dp/9354638252
https://www.amazon.in/Question-Economics-Previous-Chaptewise-Topicwise/dp/9355951299
https://www.amazon.in/Oswaal-Sample-Question-Commerce-Specimen/dp/9357288562
https://www.amazon.in/Question-Physics-Chemistry-Biology-2022-23/dp/9355956878
https://www.amazon.in/Question-Commerce-Previous-Chaptewise-Topicwise/dp/9355951264
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Chemistry-Mathematics/dp/B0D7ZNFVLL
https://www.amazon.in/Oswaal-Question-Class-Computer-Science/dp/935595137X
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Language/dp/9354637566
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Economics/dp/9354638899
https://www.amazon.in/English-Paper-1-Chemistry-Question-Specimen/dp/9356343055
https://www.amazon.in/Oswaal-Question-Solved-Papers-Accounts/dp/B0D8LBJK7W
https://www.amazon.in/Chapterwise-Question-Semester-Nov-Dec-largest/dp/9354638287
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Computer/dp/9354639747
https://www.amazon.in/Oswaal-Sample-Question-Paper-Commerce/dp/9355503423
https://www.amazon.in/Question-Biology-Previous-Chaptewise-Topicwise/dp/9355951310
https://www.amazon.in/Oswaal-Sample-Question-Class-11-Economics/dp/9356344310
https://www.amazon.in/Chapter-wise-Topic-wise-Question-Semestar-Literature/dp/9354638414
https://www.amazon.in/Oswaal-Sample-Question-Business-Studies/dp/9355503504
https://www.amazon.in/Oswaal-Question-Semester-Computer-Science/dp/9354638694
https://www.amazon.in/Oswaal-Sample-Question-Paper-History/dp/935550389X
https://www.amazon.in/Oswaal-Sample-Question-Paper-Chemistry/dp/9355502753
https://www.amazon.in/Oswaal-Sample-Question-Semester-Chemistry/dp/9354638090
https://www.amazon.in/Oswaal-Sample-Question-Semester-Economics/dp/9354638589
https://www.amazon.in/Oswaal-Physics-Chemistry-Question-Specimen/dp/9356343071
https://www.amazon.in/Question-Account-Economics-Commerce-English/dp/B0B1QBNJQ7
https://www.amazon.in/Oswaal-Sample-Question-Class-11-Accounts/dp/9356344256
https://www.amazon.in/Oswaal-Sample-Question-Class-11-Physics/dp/9356344361
https://www.amazon.in/Oswaal-Sample-Question-Papers-Biology/dp/9389340152
https://www.amazon.in/Oswaal-Question-Semester-Business-Studies/dp/9354638651
https://www.amazon.in/Oswaal-Question-Class-12-Physical-Education/dp/9356344094
https://www.amazon.in/Oswaal-Question-Class-11-English-Paper-2/dp/9356341516
https://www.amazon.in/Oswaal-Sample-Question-Papers-Semester/dp/9354638724
https://www.amazon.in/Question-Class-12-Physical-Education-Semester-1/dp/9354635695
https://www.amazon.in/Question-Physical-Education-Chaptewise-Topicwise/dp/9355951388
https://www.amazon.in/Physics-Chemistry-Biology-Question-Specimen/dp/9356343063
https://www.amazon.in/Question-Class-12-Computer-Science-Semester-1/dp/9354635555
https://www.amazon.in/Accountancy-Economics-Business-Commerce-Question/dp/9356342601
https://www.amazon.in/English-Paper-1-Paper-2-Chemistry-Question/dp/9356341303
https://www.amazon.in/Question-Account-Economics-Commerce-English/dp/9355957092
https://www.amazon.in/English-Paper-1-Paper-2-Chemistry-Question/dp/B0BJF4FNP7
https://www.amazon.in/English-Paper-1-Chemistry-Question-Specimen/dp/9356343047
https://www.amazon.in/English-Paper-1-Paper-2-Chemistry-Question/dp/B0BJF97SC4
https://www.amazon.in/Question-Physics-Chemistry-Biology-English/dp/B0C8TJVNPT
https://www.amazon.in/Question-Class-12-Physics-Language-English/dp/B0C5B84RY2
https://www.amazon.in/English-Accountancy-Economics-Business-Question/dp/9356343128
https://www.amazon.in/Oswaal-Question-Class-12-Mathematics-Physics/dp/B0C5BCX6C6
https://www.amazon.in/Oswaal-Question-Business-Studies-Class-12/dp/B0C5B4YSZ5
https://www.amazon.in/Question-Accounts-Economics-Commerce-English/dp/B0C8TSTL32
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-English/dp/B0C8TJVNTN
https://www.amazon.in/Question-Class-12-Accounts-Business-Studies/dp/B0C5X6YQV7
https://www.amazon.in/Question-Class-12-Economics-Business-Studies/dp/B0C5X6SP7G
https://www.amazon.in/Question-Class-12-Chemistry-Class-10-English/dp/B0C5X5VWRM
https://www.amazon.in/Question-Class-12-Computer-Science-Class-10/dp/B0C5X5KRYV
https://www.amazon.in/Question-Class-12-Physics-Class-10-English/dp/B0C5X58T93
https://www.amazon.in/Question-Class-12-Computer-Class-10-Applications/dp/B0C5BBH76D
https://www.amazon.in/Mathematics-Quantitative-Apptitude-Reasoning-Awareness/dp/B0C5B3YS7M
https://www.amazon.in/English-Accountancy-Economics-Business-Question/dp/B0BKQ1MC2Z
https://www.amazon.in/Accountancy-Economics-Business-Commerce-Question/dp/B0BJVMD22Z
https://www.amazon.in/Physics-Chemistry-Biology-Question-Specimen/dp/B0BJVLW2NM
https://www.amazon.in/English-Paper-1-Chemistry-Question-Specimen/dp/B0BJVKSLF8
https://www.amazon.in/Accountancy-Economics-Business-Commerce-Question/dp/B0BJVKRHK1
https://www.amazon.in/English-Paper-1-Chemistry-Question-Specimen/dp/B0BJVK54F4
https://www.amazon.in/Question-Physics-Chemistry-Biology-English/dp/B0B1QBPFNT
https://www.amazon.in/Oswaal-Question-Chapterwise-Topicwise-Accounts-ebook/dp/B086VKZVDN
https://www.amazon.in/Question-Business-Studies-Class-12-Commerce/dp/B0C5X6955V
https://www.amazon.in/Combined-Question-Commerce-Economics-Semester-1-ebook/dp/B09HSGQVSQ
https://www.amazon.in/Oswaal-Question-Bank-Class-Mathematics-ebook/dp/B0BTYVY44N
https://www.amazon.in/Oswaal-Question-Bank-Class-Mathematics-ebook/dp/B0BY5553YM
https://www.amazon.in/Oswaal-Question-Bank-Class-Physics-ebook/dp/B0BTYV4Z56
https://www.amazon.in/Oswaal-Question-Biology-Chapterwise-Topicwise/dp/9387965104
https://www.amazon.in/Question-Business-Studies-Chapterwise-Topicwise/dp/9389829291
https://www.amazon.in/Chapterwise-Question-Business-Studies-Semester-ebook/dp/B09GPMBJX6
https://www.amazon.in/Chapterwise-Question-Physical-Education-Semester-ebook/dp/B09GFLQ91L
https://www.amazon.in/Chapter-wise-Topic-wise-2009-2023-Teaching-Compulsory/dp/9359580198
https://www.amazon.in/Teaching-Research-Aptitude-Paper-1-Compulsory/dp/9362390027
https://www.amazon.in/Compulsory-Year-wise-2015-2023-Teaching-Research/dp/9359586439
https://www.amazon.in/Paper-1-Compulsory-Teaching-Research-Aptitude/dp/9359586838
https://www.amazon.in/2009-2023-Teaching-Research-Aptitude-Compulsory/dp/9357282475
https://www.amazon.in/Question-Quantitative-Reasoning-Awareness-Preparation/dp/9356346941
https://www.amazon.in/Question-Physics-Chemistry-Entrance-Preparation/dp/9356346992
https://www.amazon.in/Oswaal-Question-Mathematics-Entrance-Preparation/dp/9355953992
https://www.amazon.in/Oswaal-Question-History-Entrance-Preparation/dp/9355953984
https://www.amazon.in/Oswaal-Question-Economics-Entrance-Preparation/dp/9355954840
https://www.amazon.in/Oswaal-Question-Accountancy-Entrance-Preparation/dp/9355954662
https://www.amazon.in/Question-Computer-Informatics-Practices-Preparation/dp/9355954743
https://www.amazon.in/Question-Chapterwise-Topicwise-Computer-Science-ebook/dp/B0CPSVDBKF
https://www.amazon.in/Oswaal-Question-Entrepreneurship-Entrance-Preparation/dp/9355954859
https://www.amazon.in/Oswaal-Question-Physics-Chemistry-Biology-ebook/dp/B0C6KPNBRJ
https://www.amazon.in/Physics-Chemistry-Mathematics-Entrance-Preparation/dp/9355955405
https://www.amazon.in/Aptitude-Year-wise-2015-2023-Teaching-Compulsory/dp/B0D5YJWQXK
https://www.amazon.in/Oswaal-Chapterwise-Topicwise-Physics-1988-2022-ebook/dp/B0B7NLB5Z2
https://www.amazon.in/Oswaal-Chapterwise-Topicwise-Biology-1988-2022-ebook/dp/B0BLNDKTG7
https://www.amazon.in/Oswaal-Sample-Question-Business-Studies-ebook/dp/B0BSLNVVBZ
https://www.amazon.in/Question-Quantitative-Aptitude-Awareness-Reasoning/dp/B0C5RV82LK
https://www.amazon.in/Question-Accountancy-Business-Economics-Preparation/dp/B0BTCK33QS
https://www.amazon.in/Question-Quantitative-Awareness-Reasoning-Mathematics/dp/B0C53V56GH
https://www.amazon.in/Question-English-Chemistry-Entrance-Preparation/dp/B0BTCCJ34F
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-Language/dp/B0C5K6BJV7
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-Economics/dp/B0C5K5ZWR9
https://www.amazon.in/Oswaal-SOLVED-PAPERS-RESEARCH-APTITUDE/dp/B0C8TPFTBH
https://www.amazon.in/Oswaal-Sample-Question-Accountancy-Economics/dp/B0C4YR4GT6
https://www.amazon.in/Oswaal-Sample-Question-Geography-Economics/dp/B0C53JTVGN
https://www.amazon.in/Oswaal-Sample-Question-Biology-Chemistry/dp/B0C4YB64FD
https://www.amazon.in/Oswaal-Sample-Question-History-Economics/dp/B0C53GJ2P3
https://www.amazon.in/Oswaal-Sample-Question-Economics-Business/dp/B0C4Y8G54M
https://www.amazon.in/Question-English-Chemistry-Entrance-Preparation/dp/B0BTC8C4KJ
https://www.amazon.in/Question-Economics-Computer-Informatics-Practices/dp/B0C5B82VXF
https://www.amazon.in/Question-Accountancy-Business-Economics-Preparation/dp/B0BTCB4G1P
https://www.amazon.in/Oswaal-Question-Psychology-Language-English/dp/B0C5B6R8S6
https://www.amazon.in/Question-Accountancy-Business-Economics-Preparation/dp/B0BTCCZX6T
https://www.amazon.in/Question-Political-Science-Language-English/dp/B0C5B1WT3R
https://www.amazon.in/Oswaal-Mathematics-Applied-Question-Economics/dp/B0C5X4FK4T
https://www.amazon.in/Oswaal-Question-Sociology-Language-English/dp/B0C5B83RV3
https://www.amazon.in/University-Commission-Yearwise-2015-2023-Compulsory/dp/9357281304
https://www.amazon.in/Oswaal-Chapterwise-Topicwise-Physics-1988-2021/dp/9355500742
https://www.amazon.in/Question-Economics-Entrance-Preparation-Psychology/dp/B0C5B83SH4
https://www.amazon.in/Teaching-Research-Aptitude-Compulsory-Hardcover/dp/9362395940
https://www.amazon.in/Chapter-wise-Topic-wise-2009-2023-Compulsory-Hardcover/dp/9362391759
https://www.amazon.in/Oswaal-Chapterwise-Topicwise-Chemistry-1988-2021/dp/9355501374
https://www.amazon.in/Oswaal-Years-Solved-Papers-books/dp/9357282971
https://www.amazon.in/Oswaal-Mock-Test-Papers-2024/dp/9359582654
https://www.amazon.in/Oswaal-Solved-Papers-Year-wise-Shift-wise/dp/935958309X
https://www.amazon.in/Chapter-wise-Topic-wise-Question-2005-2008-2017-2022/dp/9356345589
https://www.amazon.in/Oswaal-ADMISSION-Year-wise-SHIFT-WISE-2017-2023/dp/9362391899
https://www.amazon.in/Mock-Test-Sample-Question-Papers/dp/9356348472
https://www.amazon.in/Oswaal-Mock-Test-Papers-VARC/dp/9359584010
https://www.amazon.in/Oswaal-Solved-Papers-Sample-Question/dp/9356347085
https://www.amazon.in/Oswaal-Admission-Yearwise-Shiftwise-2018-2022/dp/9357281126
https://www.amazon.in/Oswaal-Mock-Sample-Question-Papers/dp/9355956584
https://www.amazon.in/Chapter-wise-Topic-wise-Question-1990-2008-2017-2022-ebook/dp/B0BT7N6BHM
https://www.amazon.in/Oswaal-Solved-Papers-Sample-Question/dp/9355952430
https://www.amazon.in/Year-Solved-Paper-Chapterwise-Topicwise/dp/9354630715
https://www.amazon.in/Chapter-wise-Topic-wise-Quantitative-Aptitude-Preparation/dp/B0D8JYFL5Y
https://www.amazon.in/Oswaal-Solved-Papers-Sample-Question/dp/B0B9GDX26C
https://www.amazon.in/Oswaal-Solved-Papers-Sample-Question/dp/B0D5YY44K1
https://www.amazon.in/Years-Solved-Papers-Chapter-Wise-Topic-Wise/dp/B0D7ZN6TWP
https://www.amazon.in/Question-Chapter-wise-Topic-wise-2005-2008-2017-2022/dp/B0CP43VQSZ
https://www.amazon.in/Question-Chapter-wise-Topic-wise-2005-2008-2017-2022/dp/B0CP43224B
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated-ebook/dp/B0CNZ6LGVV
https://www.amazon.in/Formulae-Quantitative-Hardcover-Entrance-Government/dp/936239572X
https://www.amazon.in/Oswaal-Sample-Question-Papers-Hardcover/dp/9356347050
https://www.amazon.in/ADMISSION-Year-wise-SHIFT-WISE-2017-2023-Hardcover/dp/9362394839
https://www.amazon.in/Oswaal-Mock-Test-Papers-Hardcover/dp/9362398311
https://www.amazon.in/Accountancy-Business-Economics-Entrance-Preparation/dp/B0B1Q61PBP
https://www.amazon.in/Oswaal-Sample-Question-Economics-Hardcover/dp/9356346860
https://www.amazon.in/Oswaal-Sample-Question-Entrepreneurship-Hardcover/dp/9356343810
https://www.amazon.in/Question-Mathematics-Chapter-wise-Topic-wise-Objective/dp/9354234100
https://www.amazon.in/Oswaal-Previous-Years-Papers-shifts/dp/9356347417
https://www.amazon.in/Oswaal-NTPC-Test-2020-Exam/dp/9390180880
https://www.amazon.in/Chapterwise-Topicwise-Question-General-English/dp/9355951485
https://www.amazon.in/Oswaal-Edugorilla-NTPC-Test-Competition-ebook/dp/B08241XJV8
https://www.amazon.in/Chapterwise-Topicwise-Question-Quantitative-Aptitude/dp/9355951477
https://www.amazon.in/Chapterwise-Topicwise-Question-Logical-Reasoning/dp/9355951469
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-Syllabus/dp/B08SDFL7HT
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Objective-Combined/dp/9354233953
https://www.amazon.in/Toppers-Handbook-2019-2020-Physics-Chemistry/dp/9354234526
https://www.amazon.in/Toppers-Handbook-Classes-Physics-Chemistry/dp/9354234844
https://www.amazon.in/Combined-Graduate-Previous-Year-Wise-2016-2023/dp/B0D7ZNGJYH
https://www.amazon.in/Toppers-Handbook-Chemistry-Mathematics-Entrance/dp/9354235549
https://www.amazon.in/Toppers-Handbook-Classes-Physics-Chemistry/dp/9354232183
https://www.amazon.in/Combined-Secondary-Previous-Year-Wise-2017-2023/dp/B0D7YTJ54M
https://www.amazon.in/Multi-Tasking-Non-Technical-Havaldar-Previous-Year-Wise/dp/B0D7ZL683H
https://www.amazon.in/Toppers-Handbook-Classes-Physics-Chemistry/dp/9354234046
https://www.amazon.in/Oswaal-Paper-1-Previous-Year-Wise-Handbook/dp/B0D7ZMKZQQ
https://www.amazon.in/Oswaal-Indian-Navy-Secondary-Chapterwise/dp/B0D7YTJB59
https://www.amazon.in/Agniveer-Agnipath-Chapterwise-Topicwise-Mathematics/dp/B0D7ZQ1XG9
https://www.amazon.in/Government-Question-Quantitative-Reasoning-Awareness/dp/B0D7ZQ42BN
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Biology/dp/9351276198
https://www.amazon.in/Government-Question-Quantitative-Reasoning-Awareness/dp/B0D7ZQW85V
https://www.amazon.in/Toppers-Handbook-Entrance-Chemistry-Mathematics/dp/9390180651
https://www.amazon.in/Toppers-Handbook-Classes-Chemistry-Entrance/dp/9354235468
https://www.amazon.in/Government-Gradiation-Quantitative-Reasoning-Awareness/dp/B0D7ZNGCH3
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Science/dp/8184819080
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Mathematics/dp/9386339048
https://www.amazon.in/Oswaal-Mathe-Toppers-NCERT-Examplar/dp/B08GCTH4SR
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Science/dp/8184818998
https://www.amazon.in/Toppers-Handbook-Physics-Entrance-Classes/dp/B0BKVWQ54C
https://www.amazon.in/Oswaal-Teachers-Parents-Manual-Mathematics/dp/9387504468
https://www.amazon.in/Oswaal-Physics-Toppers-Handbook-Sample/dp/B0BDYV2Q33
https://www.amazon.in/Oswaal-Teachers-Parents-Manual-Rimjhim-ebook/dp/B0877CSDCC
https://www.amazon.in/Oswaal-Teachers-Parents-Manual-Rimjhim-ebook/dp/B0877C87Q4
https://www.amazon.in/Oswaal-Teachers-Parents-Manual-Rimjhim-ebook/dp/B0877BRNH5
https://www.amazon.in/Oswaal-NCERT-Teachers-Parents-Manual-ebook/dp/B07CXKBCQ7
https://www.amazon.in/Oswaal-Teachers-Parents-English-Marigold-ebook/dp/B07CXRWDFC
https://www.amazon.in/Teachers-Parents-Environmental-Studies-Looking-ebook/dp/B07CXCZDT8
https://www.amazon.in/Question-Handbook-Physics-Chemistry-Mathematic/dp/B09R2773P3
https://www.amazon.in/Oswaal-Teachers-Parents-Manual-Rimjhim-ebook/dp/B0877DWR92
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Biology-ebook/dp/B01LNPWON6
https://www.amazon.in/Arihant-General-Knowledge-Handbook-Competitive/dp/B0CQGLPLYM
https://www.amazon.in/Question-Handbook-Physics-Chemistry-Biology/dp/B08KYYTBZ2
https://www.amazon.in/Question-Handbook-Physics-Chemistry-Biology/dp/B08KYWQLP8
https://www.amazon.in/Question-Physics-Chemistry-Informatics-Practices/dp/9390180333
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Physics-ebook/dp/B01LNPWOKY
https://www.amazon.in/Oswaal-Teachers-Parents-English-Marigold-ebook/dp/B07CXVG95G
https://www.amazon.in/Question-Toppers-Handbook-Chemistry-Mathematics/dp/9390411122
https://www.amazon.in/Question-Toppers-Handbook-Classes-Chemistry/dp/9390411165
https://www.amazon.in/Question-Handbook-Physics-Chemistry-Biology/dp/B09R25R7WS
https://www.amazon.in/Question-Toppers-Handbook-Chemistry-Mathematics/dp/B0B2X26B9T
https://www.amazon.in/Question-Toppers-Handbook-Chemistry-Mathematics/dp/B08KYVBQJD
https://www.amazon.in/Oswaal-Teachers-Parents-English-Marigold-ebook/dp/B07CXP6SVK
https://www.amazon.in/Oswaal-Chemistry-Toppers-Handbook-Question/dp/B09SLV81C2
https://www.amazon.in/Teachers-Parents-Environmental-Studies-Looking-ebook/dp/B07CXRL36W
https://www.amazon.in/Oswaal-NCERT-Teachers-Parents-Manual-ebook/dp/B07CXM1XRC
https://www.amazon.in/Question-Toppers-Handbook-Chemistry-Mathematics/dp/B0B2WW2NRH
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Physics-ebook/dp/B01LNPWO0O
https://www.amazon.in/Oswaal-Sample-Question-Paper-Nov-Dec-ebook/dp/B09JGD5ZPK
https://www.amazon.in/Teachers-Parents-Environmental-Studies-Looking-ebook/dp/B07CXP48TK
https://www.amazon.in/Oswaal-Laboratory-Physics-Chemistry-Biology/dp/8184818327
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Mathematics/dp/9351277402
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Science/dp/8184819005
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Mathematics/dp/9386339064
https://www.amazon.in/Oswaal-Chimistry-Toppers-NCERT-Examplar/dp/B08GCTXY7L
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Mathematics/dp/9351277437
https://www.amazon.in/Handbook-Energy-Efficiency-Industry/dp/B08BCDMX5L
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Science-ebook/dp/B01LCWHHQ4
https://www.amazon.in/Oswaal-Teachers-Parents-English-Marigold/dp/938750445X
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Science-ebook/dp/B01JZDCWF8
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Mathematics/dp/9351277372
https://www.amazon.in/Oswaal-Teachers-Parents-Manual-Rimjhim/dp/9387504441
https://www.amazon.in/Teachers-Parents-English-Marigold-Environmental/dp/9387504581
https://www.amazon.in/Oswaal-Laboratory-Manual-Social-Science/dp/9351277410
https://www.amazon.in/Workbook-Teachers-Parents-English-Marigold/dp/9387504751
https://www.amazon.in/Workbook-Teachers-Parents-Marigold-Environmental/dp/938750476X
https://www.amazon.in/Workbook-Teachers-Parents-Marigold-Environmental/dp/9387504794
https://www.amazon.in/Workbook-Teachers-Parents-Marigold-Environmental/dp/9387504778
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Chemistry/dp/9351276171
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Mathematics/dp/9351277852
https://www.amazon.in/Oswaal-Laboratory-Physics-Chemistry-Biology/dp/8184818335
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Science/dp/8184819099
https://www.amazon.in/Oswaal-Laboratory-Manual-October-Science-ebook/dp/B01JZDCTQA
https://www.amazon.in/Oswaal-Flashcards-Class-Social-Science/dp/9390411718
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-Science-ebook/dp/B099N7TFPB
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-Mathematics-ebook/dp/B099MP8FGX
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-Science/dp/9390411688
https://www.amazon.in/Oswaal-Flashcards-English-Science-Mathematics/dp/9357285105
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-English/dp/939041170X
https://www.amazon.in/English-Science-Standard-Question-Flashcards/dp/B0C5B8KV55
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-Science-ebook/dp/B08SM68Y59
https://www.amazon.in/Flashcards-Chapterwise-Topicwise-Question-Mathematics/dp/B0C5B71Z9F
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-English-ebook/dp/B099MFVBQW
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-Mathematics-ebook/dp/B08SM611YH
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-Science/dp/9354232981
https://www.amazon.in/Oswaal-Flashcards-Class-Social-Science/dp/9354233007
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-English-ebook/dp/B08SM67K1C
https://www.amazon.in/Oswaal-CBSE-Flashcards-Class-English/dp/935423299X
https://www.amazon.in/Flashcards-Chapterwise-Topicwise-Question-Mathematics/dp/B0C59YFGMP
https://www.amazon.in/Flashcards-Chapterwise-Topicwise-Question-Mathematics/dp/B0C59SYMM2
https://www.amazon.in/Chapterwise-Question-Mathematics-Standard-Science/dp/9354239110
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631436
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631606
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Objective-Combined/dp/935423819X
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631533
https://www.amazon.in/Question-English-Language-Literature-Flashcard/dp/9354631614
https://www.amazon.in/Question-English-Language-Literature-Flashcard/dp/9354631517
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631703
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631525
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631592
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631681
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631541
https://www.amazon.in/Question-Science-Mathematics-Standard-Flashcard/dp/9354631460
https://www.amazon.in/Question-Class-10-Science-Social-English/dp/B07SJGX4ZM
https://www.amazon.in/Question-Language-Literature-Computer-Applications/dp/9354236928
https://www.amazon.in/Question-Language-Literature-Mathematics-Applications/dp/9354236987
https://www.amazon.in/Question-Language-Literature-Computer-Applications/dp/9354236936
https://www.amazon.in/Question-Standard-Computer-Applications-Sanskrit/dp/935423707X
https://www.amazon.in/Question-Language-Literature-Mathematics-Applications/dp/9354236995
https://www.amazon.in/Question-Language-Literature-Mathematics-Applications/dp/9354237010
https://www.amazon.in/Question-Language-Literature-Mathematics-Applications/dp/9354237002
https://www.amazon.in/Question-Mathematics-Standard-Computer-Applications/dp/9354237096
https://www.amazon.in/Question-English-Computer-Applications-Sanskrit/dp/9354237088
https://www.amazon.in/Question-English-Computer-Applications-Sanskrit/dp/9354237061
https://www.amazon.in/UGC-NET-2015-2021-General-Aptitude-Paper-1/dp/9355958544
https://www.amazon.in/2009-2023-Chapter-Wise-Teaching-Research-Compulsory/dp/B0D5YLN4LT
https://www.amazon.in/Yearwise-2015-2023-Aptitude-TEACHING-RESEARCH/dp/B0C8TPS7N9
https://www.amazon.in/Government-Question-Graduation-Logical-Reasoning/dp/9359585955
https://www.amazon.in/Oswaal-Chapter-wise-Topic-wise-Engineering-Mathematics/dp/9359585475
https://www.amazon.in/Oswaal-Solved-Year-wise-Engineering-Mathematics/dp/9359582549
https://www.amazon.in/Yearwise-2010-2023-Engineering-General-Aptitude/dp/9357283625
https://www.amazon.in/Chapterwise-Topicwise-2010-2023-Engineering-Mathematics/dp/9357281398
https://www.amazon.in/Oswaal-Year-wise-2010-2022-Engineering-Mathematics/dp/9355959265
https://www.amazon.in/Chapterwise-Topicwise-2010-2022-General-Aptitude/dp/9355956002
https://www.amazon.in/Year-wise-Solved-Paper-Engineering-Mathematics/dp/9354637612
https://www.amazon.in/Oswaal-Yearwise-2010-2023-Engineering-Mathematics/dp/9357281274
https://www.amazon.in/Chapter-wise-Topic-wise-Aptitude-Engineering-Mathematics/dp/B0D5YL3BX5
https://www.amazon.in/Oswaal-Year-wise-General-Aptitude-Hardcover/dp/9359587052
https://www.amazon.in/Chapterwise-Topicwise-2010-2023-Engineering-Aptitude/dp/B0C8TP8VQ7
https://www.amazon.in/Oswaal-Year-wise-Engineering-Mathematics-Hardcover/dp/9359582891
https://www.amazon.in/Chapter-wise-Topic-wise-Engineering-Mathematics-Hardcover/dp/9359587117
https://www.amazon.in/Year-wise-Engineering-Mathematics-General-Aptitute/dp/9354238939
https://www.amazon.in/Yearwise-2010-2023-Engineering-General-Aptitude/dp/B0C8TTV76P
https://www.amazon.in/Year-wise-2010-2022-Engineering-General-Aptitute/dp/B0BDYVLS84
https://www.amazon.in/Oswaal-Question-Geography-Political-Science/dp/B0C4YTHQ3D
https://www.amazon.in/Chapterwise-Topicwise-Question-Quantitative-Aptitude-ebook/dp/B09Z82TX7Z
https://www.amazon.in/Graduation-Chapterwise-Topicwise-Question-Quantitative-ebook/dp/B09ZPJ2J5N
https://www.amazon.in/Advanced-Question-Physics-Chemistry-Mathematics-ebook/dp/B0B51CQ62Y
https://www.amazon.in/Year-wise-Engineering-Mathematics-General-Aptitute/dp/B09NJNLDWV
https://www.amazon.in/Oswaal-Advanced-Years-Solved-Papers-ebook/dp/B0B51CFD7R
https://www.amazon.in/Oswaal-Solved-Chapterwise-Topicwise-Mathematics-ebook/dp/B0BBW2QS7V
https://www.amazon.in/Oswaal-Solved-Chapterwise-Topicwise-Physics-ebook/dp/B0BBW8D347
https://www.amazon.in/Oswaal-Solved-Chapterwise-Topicwise-Chemistry-ebook/dp/B0BBVY5RLQ
https://www.amazon.in/Chapterwise-Topicwise-Question-Business-Studies-ebook/dp/B0B1Q798PX
https://www.amazon.in/Question-Physics-Chemistry-Mathematics-Hardcover/dp/9356341834
https://www.amazon.in/Oswaal-NCERT-Exemplar-Problems-Solutions/dp/9389510597/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Biology/dp/9390411866/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Chemistry/dp/939041184X/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Physics/dp/9390411785/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Physics-Laboratory-Manual/dp/B0BQW63VTQ/ref=sr_1_2
https://www.amazon.in/Oswaal-CBSE-Manual-Chemistry-Class/dp/9354631630/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Mathematics-Class/dp/9354239609/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Mathematics-Class/dp/935423965X/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Physics/dp/9390411777/ref=sr_1_1
https://www.amazon.in/Oswaal-Karnataka-Accountancy-Chapterwise-Topicwise/dp/9355958919/ref=sr_1_1
https://www.amazon.in/Karnataka-Accountancy-Business-Studies-Economices/dp/B0BC8184F3/ref=sr_1_2
https://www.amazon.in/Karnataka-Business-Studies-Chapterwise-Topicwise/dp/9355958935/ref=sr_1_1
https://www.amazon.in/Oswaal-Karnataka-Economics-Chapterwise-Topicwise/dp/9355958943/ref=sr_1_1
https://www.amazon.in/Karnataka-Accountancy-Business-Studies-Economices/dp/935634003X/ref=sr_1_1
https://www.amazon.in/Legends-Tracing-Activity-Level-1-Practice/dp/9357287051/ref=sr_1_1
https://www.amazon.in/Oswaal-UPSC-Power-Bank-Medieval/dp/9357286853/ref=sr_1_1
https://www.amazon.in/Oswaal-UPSC-Power-Bank-Environment/dp/9357286721/ref=sr_1_1
https://www.amazon.in/Question-Chapterwise-Topicwise-General-Awareness/dp/9357288732/ref=sr_1_1
https://www.amazon.in/Oswaal-NCERT-Exemplar-Problems-Solutions/dp/9359584746/ref=sr_1_1
https://www.amazon.in/Oswaal-NCERT-Exemplar-Problems-Solutions/dp/B0D5YKCMSC/ref=sr_1_2
https://www.amazon.in/Oswaal-NCERT-Exemplar-Problems-Mathematics/dp/B0D5YK2G3Z/ref=sr_1_3
https://www.amazon.in/Oswaal-NCERT-Exemplar-Problems-Solutions/dp/9359582220/ref=sr_1_1
https://www.amazon.in/Oswaal-NCERT-Exemplar-Problems-Mathematics/dp/9359588520/ref=sr_1_1
https://www.amazon.in/Combined-Question-Science-Physics-Chemistry/dp/9357288791/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287337/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287485/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287442/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287450/ref=sr_1_1
https://www.amazon.in/Legends-Elephant-Fascinating-Exciting-Illustrated/dp/9357287353/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287329/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287345/ref=sr_1_1
https://www.amazon.in/Legends-Fascinating-Book-Wild-Exciting-Illustrated/dp/9357287361/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-wonderland-Illustrated/dp/935958505X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Beauty-Illustrated/dp/9359580562/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Cinderella-Illustrated/dp/935958536X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fairy-Tales-Rapunzel-Illustrated/dp/9359587583/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Sleeping-Illustrated/dp/9359584819/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Dwarfs-Illustrated/dp/935958469X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Mermaid-Illustrated/dp/9359587230/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Princess-Illustrated/dp/935958391X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Wizard-Illustrated/dp/9359585297/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Tales-Thumbelina-Illustrated/dp/9359581348/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287434/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287426/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287469/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287418/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/935728737X/ref=sr_1_1
https://www.amazon.in/Legends-Octopus-Fascinating-Exciting-Illustrated/dp/935728740X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287388/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Fascinating-Exciting-Illustrated/dp/9357287396/ref=sr_1_1
https://www.amazon.in/Humanities-Geography-Political-Psychology-Sociology/dp/9357288813/ref=sr_1_1
https://www.amazon.in/Preparation-Humanities-Geography-Political-Additional/dp/9359581445/ref=sr_1_1
https://www.amazon.in/Preparation-Accountancy-Economics-Mathematics-Additional/dp/9359586854/ref=sr_1_1
https://www.amazon.in/Preparation-Chemistry-Mathematics-Additional-Questions/dp/9359580465/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Creative-Colouring-Activity/dp/9359581615/ref=sr_1_1
https://www.amazon.in/Preparation-Combined-Question-Chemistry-Questions/dp/9357285148/ref=sr_1_1
https://www.amazon.in/Preparation-Humanities-Geography-Political-Psychology/dp/9357284605/ref=sr_1_1
https://www.amazon.in/Oswaal-Government-Question-Logical-Reasoning/dp/9359589225/ref=sr_1_1
https://www.amazon.in/Government-Question-Quantitative-Reasoning-Awareness/dp/B0D5YKZNYR/ref=sr_1_3
https://www.amazon.in/Oswaal-Government-Question-Quantitative-Aptitude/dp/9359582778/ref=sr_1_1
https://www.amazon.in/Oswaal-Government-Question-Logical-Reasoning/dp/9359585173/ref=sr_1_1
https://www.amazon.in/Government-Question-Quantitative-Reasoning-Awareness/dp/B0D5YM84WG/ref=sr_1_3
https://www.amazon.in/Oswaal-Government-Question-Quantitative-Aptitude/dp/9359581240/ref=sr_1_1
https://www.amazon.in/Oswaal-Government-Question-General-Awareness/dp/935958892X/ref=sr_1_1
https://www.amazon.in/Government-Question-Graduation-Quantitative-Aptitude/dp/9359581542/ref=sr_1_1
https://www.amazon.in/Government-Graduation-Quantitative-Reasoning-Awareness/dp/B0D5YLW886/ref=sr_1_2
https://www.amazon.in/Government-Question-Graduation-General-English/dp/9359588563/ref=sr_1_1
https://www.amazon.in/Government-Question-Graduation-General-Awareness/dp/9359584266/ref=sr_1_1
https://www.amazon.in/Agniveer-Chapterwise-Topic-wise-Knowledge-Mathematics/dp/935958200X/ref=sr_1_1
https://www.amazon.in/Combined-Graduate-Previous-Year-wise-2016-2023/dp/9359580147/ref=sr_1_1
https://www.amazon.in/Oswaal-SSC-CAPFs-Sub-Inspector-2017-2023/dp/9357287884/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Triceratops/dp/9359587826/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Stegosaurus/dp/9359585203/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Apatosorrus/dp/9359589373/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/935958584X/ref=sr_1_1
https://www.amazon.in/Question-Chemistry-Mathematics-Chapterwise-Topicwise/dp/9359587338/ref=sr_1_1
https://www.amazon.in/Combined-Secondary-Previous-Year-wise-2017-2023/dp/9359580902/ref=sr_1_1
https://www.amazon.in/Year-wise-2015-2023-Aptitude-Teaching-Compulsory/dp/9357282041/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Latest/dp/9359582522/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Mathematics/dp/B0D5YJRRP6/ref=sr_1_2
https://www.amazon.in/Oswaal-Laboratory-Manual-Mathematics-Latest/dp/9359582115/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Mathematics-Latest/dp/9359588504/ref=sr_1_1
https://www.amazon.in/Textbook-Solutions-Physics-Chemistry-Mathematics/dp/B0D5YMYBQV/ref=sr_1_2
https://www.amazon.in/Textbook-Solution-Physics-Chemistry-Biology/dp/B0D5YLGM8Q/ref=sr_1_3
https://www.amazon.in/Multi-Tasking-Non-Technical-Havaldar-Year-wise-2016-2023/dp/9359583375/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359581569/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359583014/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359587931/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359582034/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359587818/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359583871/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359581720/ref=sr_1_1
https://www.amazon.in/Oswaal-Lil-Legends-Know-Fascinating/dp/9359585416/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Mathematics/dp/9357285172/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Mathematics/dp/9357285482/ref=sr_1_1
https://www.amazon.in/Government-Question-Quantitative-Reasoning-Awareness/dp/9357283668/ref=sr_1_1
https://www.amazon.in/Government-Question-Quantitative-Reasoning-Awareness/dp/9357284672/ref=sr_1_1
https://www.amazon.in/Government-Graduation-Quantitative-Reasoning-Awareness/dp/9357283331/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Updated/dp/9359589470/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Updated/dp/9359585467/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Science-Updated/dp/9359581755/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Mathematics-Updated/dp/9359585270/ref=sr_1_1
https://www.amazon.in/Question-Workbook-English-Language-Literature/dp/9362394332/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Workbook-Science-Updated/dp/9362395118/ref=sr_1_1
https://www.amazon.in/Question-Workbook-English-Language-Literature/dp/9362397064/ref=sr_1_1
https://www.amazon.in/Question-Workbook-Mathematics-Standard-Updated/dp/9362399067/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Workbook-Science-Updated/dp/9362399369/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Workbook-Science-Updated/dp/9362396688/ref=sr_1_1
https://www.amazon.in/Illustrated-Antelope-English-Colorful-Pictures/dp/9359584258/ref=sr_1_1
https://www.amazon.in/Illustrated-English-Bedtime-Colorful-Pictures/dp/9359583774/ref=sr_1_1
https://www.amazon.in/Illustrated-English-Bedtime-Colorful-Pictures/dp/9359586455/ref=sr_1_1
https://www.amazon.in/Illustrated-Revenge-English-Colorful-Pictures/dp/9359589594/ref=sr_1_1
https://www.amazon.in/Illustrated-Friends-English-Colorful-Pictures/dp/9359581976/ref=sr_1_1
https://www.amazon.in/Illustrated-Merchant-English-Colorful-Pictures/dp/9359587265/ref=sr_1_1
https://www.amazon.in/Illustrated-English-Bedtime-Colorful-Pictures/dp/9359584754/ref=sr_1_1
https://www.amazon.in/Illustrated-Himself-English-Colorful-Pictures/dp/9359585432/ref=sr_1_1
https://www.amazon.in/Illustrated-English-Bedtime-Colorful-Pictures/dp/9359585564/ref=sr_1_1
https://www.amazon.in/Illustrated-English-Bedtime-Colorful-Pictures/dp/9359587494/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Jackal-Legends/dp/935958617X/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Singing-Legends/dp/9359586463/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Monkey-Legends/dp/935958357X/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Monkeys-Legends/dp/9359585122/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Wedding-Legends/dp/9359586811/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Intelligent-Legends/dp/9359582980/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Talkative-Tortoise/dp/9359580066/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Legends-Oswaal/dp/9359588245/ref=sr_1_1
https://www.amazon.in/Illustrated-Panchtantra-Stories-Brahmin-Legends/dp/9359582646/ref=sr_1_1
https://www.amazon.in/Karnataka-Question-Chapterwise-Topicwise-2017-2024/dp/9362395657/ref=sr_1_1
https://www.amazon.in/Karnataka-Mathematics-Chapterwise-Topicwise-2017-2024/dp/9362399318/ref=sr_1_1
https://www.amazon.in/Karnataka-Question-Chapterwise-Topicwise-2017-2024/dp/936239622X/ref=sr_1_1
https://www.amazon.in/Karnataka-Question-Chapterwise-Topicwise-2017-2024/dp/9362393433/ref=sr_1_1
https://www.amazon.in/Karnataka-Chemistry-Chapterwise-Topicwise-2017-2024/dp/9362396114/ref=sr_1_1
https://www.amazon.in/Karnataka-Question-Chapterwise-Topicwise-2017-2024/dp/9362391910/ref=sr_1_1
https://www.amazon.in/Karnataka-Accountancy-Chapterwise-Topicwise-2017-2024/dp/936239362X/ref=sr_1_1
https://www.amazon.in/Karnataka-Question-Chapterwise-Topicwise-2017-2024-ebook/dp/B0D6K331HS/ref=sr_1_1
https://www.amazon.in/Karnataka-Question-Chapterwise-Topicwise-2017-2024/dp/9362399482/ref=sr_1_1
https://www.amazon.in/Karnataka-Economics-Chapterwise-Topicwise-2017-2024/dp/9362396238/ref=sr_1_1
https://www.amazon.in/Oswaal-Workbook-Concept-Class-3-Mathematics/dp/9362399156/ref=sr_1_1
https://www.amazon.in/Oswaal-Workbook-Concept-Class-3-Science/dp/9362391775/ref=sr_1_1
https://www.amazon.in/Workbook-Concept-Class-3-English-Knowledge/dp/B0D86P286L/ref=sr_1_2
https://www.amazon.in/Question-Chapter-wise-Topic-wise-Accounts-Economics/dp/9362391031/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-learn-Alphabet/dp/9357287639/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-Learn-About/dp/9357287620/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-learn-Flowers/dp/9357287655/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-Learn-About/dp/9357287671/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-Learn-Fruits/dp/9357287604/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-learn-Habits/dp/935728768X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-learn-Numbers/dp/9357287647/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-Learn-Opposites/dp/9357287698/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-learn-Things/dp/9357287663/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-Learn-Transports/dp/935728771X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-learn-Vegetables/dp/9357287612/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Picture-learn-Animals/dp/9357287701/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Social-Science/dp/9351277380/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Social-Science/dp/9351277445/ref=sr_1_1
https://www.amazon.in/Oswaal-Laboratory-Manual-Class-Science-ebook/dp/B01JZDCX66/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Stickers-learn-Numbers/dp/9357287744/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Stickers-learn-Shapes/dp/9357287752/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Fruits/dp/9357287795/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Vegetables/dp/9357287809/ref=sr_1_1
https://www.amazon.in/Legends-Colouring-Vegetables-Flowers-Alphabets/dp/B0D5YJYKVT/ref=sr_1_2
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-About/dp/9357287817/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Animals/dp/9357287825/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Flowers/dp/9357287833/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Transport/dp/9357287841/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Clothes/dp/935728785X/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-English-Alphabet/dp/9357287868/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Numbers/dp/9357287876/ref=sr_1_1
https://www.amazon.in/Oswaal-Legends-Colouring-Learn-Shapes/dp/9357288767/ref=sr_1_1
https://www.amazon.in/Oswaal-Workbook-Concept-Class-1-Science/dp/9362398389/ref=sr_1_1
https://www.amazon.in/Workbook-Concept-Class-1-English-Knowledge/dp/B0D86J5N1T/ref=sr_1_2
https://www.amazon.in/Oswaal-Workbook-Concept-Class-4-Science/dp/9362392364/ref=sr_1_1
https://www.amazon.in/Oswaal-Constable-Ground-CAPFs-Rifles/dp/9362390434/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Workbook-English-Updated/dp/9362394545/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Workbook-Science-Updated/dp/9362398907/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Workbook-English-Updated/dp/9362399172/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Workbook-Mathematics-Updated/dp/936239670X/ref=sr_1_1
https://www.amazon.in/Oswaal-Question-Science-Social-English/dp/9362392461/ref=sr_1_1
https://www.amazon.in/legends-Written-Illustrated-Jigeesha-Pasricha/dp/9362395231/ref=sr_1_1

`;
// Split the input string to create an array of product IDs
const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

async function fetchDataAndParse(url) {
  try {
    const response = await axios.get(url, {
      
      headers: {
        'accept': 'text/html,*/*', 
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8', 
           //'cookie': 'ubid-acbin=262-6513238-1351668; s_nr=1709615209897-New; s_vnum=2141615209898%26vn%3D1; s_dslv=1709615209901; sst-acbin=Sst1|PQHJEAyM5IEMpPxnCz8I88quBs_1vn8S9NMHxKjOqmtfuWJz_z543uw1zzyNMVMVqM8zWwPV7obqXdihcho5B_flRHtb-0q21N3KFcUUxfso6eXxh5zgCl-GcpxXlaWsunLq38osj3O1vYqnooNH9A5NafmUJptYXRUMXcLtg1av64-dBFuCAVSTNYVbg3kLd-1_8Y3XJHzboQ3LvfvJMnbgE51wiYOTI5Ij7_tavgZtqIk; i18n-prefs=INR; x-amz-captcha-1=1716378424810587; x-amz-captcha-2=Vm3dsAMUhRX9d4nwCehOyg==; session-id=258-5427539-4664400; x-acbin="LggJNVgUIHkrz?N1T1kbP9rkUkEAMFVdbysw?aSJWGEu5ypw^@E0MnR?3yPEvvdSi"; at-acbin=Atza|IwEBICGfRMAREkxQ7VUwBPh0hdes6Qyuh_iwRJEIEO3gezBTeJpF_5_LojvLtdi1rueBlc3uTd0Mhefs1eOg-rlyBIj0cxAcsNMrprfc0diboRRmpWAqvKq9ydlngpFfW4cn1Cl_0yYwao5MD4sIHX-qGtmcEQOQ9IbDmggpxd6RIU7hj7qOu_T2meE6EF4VVpUScl8l4nXKb6SY7VaQOUTPYxY7Pe2j2p3uAVNJUA0y7Zq0lA; sess-at-acbin="cR7COYM09tRHdxoujlKNFHUfuA6s/fdm15OvJdkmYSs="; session-id-time=2082787201l; lc-acbin=en_IN; sp-cdn=J4F7; b2b="VFJVRQ=="; session-token=ouFMSXLdkHAFFH2Bgyf2c5xSyRIKldomnejmH3L1siVsDotr6V8DrEAwOSiDImY8KqJOz7Xu5v3fehlm+2PhJt2GoPD7F9rJ3lRxGgrvEeMk/5m1/buNxTYjR0+wlw+ZKSXPnPHsf8OmLEhYjLURAcgi4K7VO0unnA2yzSEDVlsD8OXLwLZQvcVKUWvluhC0XXn113YqHTiWRKgrc9dYO92YvvymCjLoSRsOG1vwrahycwZqnlvkmdSKxEbz9me62TNLk7sPtFndA2fRTohTvJy5t9Cdo0AVFqZSZqZDeCkDegVsYV9x1ShQUzWSbBTn3wroOcMET5TeunXzoO7LZIzzQvoSfIykz454ZKRC+uQGLYrHZHI6/jglo5L2jDGX; csm-hit=tb:s-ZDVYNGTZ58W2SDF6KJ2H|1717479046279&t:1717479049866&adb:adblk_no; i18n-prefs=INR; session-id=257-8886605-2823314; session-id-time=2082787201l; session-token=R+ZoldGPnFf9vmAXfalID8x3hjPMkmeyyFo+zHuuSAVf4c60/1TOZVcxrYxTR6ef8QEbT3sFPYL39+2+zcX6q2L3Wpx6YJPuXnVTSQAMJOLnLbRTq0ToNpEX1rA2qPEJdvqIqy+30fywG32qyMslFAc54hHigZ0m+B7LzzwRSM5ZT2RjHFUJ/D9EHf18p7h1VfZOr8nVot0zn318tCzMP4/SskZAnwa9HHcf32yeKca5yIYucMdP164MUHPVioQfCNZysn4MnHeZ2xG5hXOD04cNFPevw/pNtijMODO26n6yiBVm6zP3FUa6ayQqNC+9qlM796yK0v/LGlBDGKF5J6VFKwnss5qd', 
   'cookie': 'session-id=260-1265984-6802412; i18n-prefs=INR; ubid-acbin=260-2440372-3989933; lc-acbin=en_IN; s_nr=1701679791695-New; s_vnum=2133679791695%26vn%3D1; s_dslv=1701679791697; x-amz-captcha-1=1707815569616385; x-amz-captcha-2=Vm9+HsLnkmihJ9hD/hu8xg==; session-id-time=2082787201l; session-token=uC1BRiRFgTEdSDo1dsKXG0vm5ULimaSiP/k8l0NqGXchbgYIyURwiOQ+lBJXk7hDtwXOaqGS/QLZVwLxnwGGvEaf58qNhJw4BA4YnMJ0PsPjW2x1r3iTyR9sD8qP1UcqP+OqB1VqiAKp+0NqvOlrht2aDiF5LPTzkb3U5FFnsemLewtTFv++N/yoEo1cGG05fQwxbiEXk5RW7IqGpvN9eh+Qla/kY1aRt2nH3DgEgli2D4MrFQuJFGz8lTLz2VCTPPIcYpD0saciHpOnncLiBSTXJmp98YS0GWNdQ5rsqbaxdeE7FbxABm7WdGavbfnFrYaXVy5lo/Qhrui2bTYnGmILDIWw3Rb5; csm-hit=tb:s-K5PXAPEDKAB55Y6KZXQ8|1716458256004&t:1716458258553&adb:adblk_no; i18n-prefs=INR; session-id=257-6177112-1304819; session-id-time=2082787201l; session-token=oCqgm0d/HJKbd7oXVn/vj6C+FH3ks3YuYDbXxwvHJ+uI2vCLbkzNffO2zd+/NLCKjp9fvjjtle9m0Yo21fLCH6hlPpyBbxbrYpdzuRON7NDXVmobkWzVkTNyU0/ZpPjYDHGN677uzk/Y6sPkH5AQzgwW4zDUXmekRqxnLcLzbUagW46oNhe8fEy1GLr6dXsG/joBQVlyubafuwWmLQT8O7j1m214A7FKhrdvh8uHAZ+mBc4BljEFuvQEJpU3ta3XF6YUVGXOEdbtK1jcsZD/bqj3EHGw9ieaz5JAk1Kw4fIHjSGJDQhmNTrAYj/Dy5HObcnKaiKXXCaVjiDxUWrkSjKixvOsTv5e', 
   'device-memory': '8', 
   'downlink': '10', 
   'dpr': '1.5', 
   'ect': '4g', 
   'priority': 'u=1, i', 
   'referer': 'https://www.amazon.in/Sikshan-Abhiyogyata-Chapter-Previous-Questions/dp/811989619X/ref=sr_1_1?crid=SND6PLYN6LO0&dib=eyJ2IjoiMSJ9.YTXdwfJh77gHujyTV--uwdfwyU7c8KF4ltUHes6MkKfGjHj071QN20LucGBJIEps.jvsQClywZDMTmZqHRrxcoSJMptEXmBcP55RSI8_xh2Q&dib_tag=se&keywords=811989619X&nsdOptOutParam=true&qid=1716458252&s=books&sprefix=811989619x%2Cstripbooks%2C213&sr=1-1', 
   'rtt': '150', 
   'sec-ch-device-memory': '8', 
   'sec-ch-dpr': '1.5', 
   'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"', 
   'sec-ch-ua-mobile': '?0', 
   'sec-ch-ua-platform': '"Windows"', 
   'sec-ch-ua-platform-version': '"15.0.0"', 
   'sec-ch-viewport-width': '682', 
   'sec-fetch-dest': 'empty', 
   'sec-fetch-mode': 'cors', 
   'sec-fetch-site': 'same-origin', 
   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
   'viewport-width': '682', 
   'x-requested-with': 'XMLHttpRequest'
      }
    });

    const $ = cheerio.load(response.data);
    const extractData = () => {
      const bestSellersRankData = $('.a-text-bold').filter(function() {
        return $(this).text().trim() === 'Best Sellers Rank:';
      }).parent().text().trim();

      const cleanedData = bestSellersRankData.replace(/Best Sellers Rank:/g, '').trim();
      return { bestSellersRank: cleanedData };
    };

    const extractedData = extractData();
    console.log(`Got result for ${url}`);
    return { url, ...extractedData };
  } catch (error) {
    console.error('Error fetching or parsing page for', url);
    return { url, error: error.message };
  }
}

(async () => {
  const results = await Promise.all(urls.map(fetchDataAndParse));

  // Separating successful results from errors
  const successfulResults = results.filter(result => !result.error);
  const errorResults = results.filter(result => result.error);

  // Writing successful results to CSV
  if (successfulResults.length > 0) {
    const csvWriter = createCsvWriter({
      path: 'seller_rank.csv',
      header: [
        { id: 'url', title: 'URL' },
        { id: 'bestSellersRank', title: 'Best Sellers Rank' },
      ]
    });
    await csvWriter.writeRecords(successfulResults);
    console.log('Successfully written data to extracted_data.csv');
  }

  // Writing errors to CSV
  if (errorResults.length > 0) {
    const csvWriterError = createCsvWriter({
      path: 'error_urls.csv',
      header: [
        { id: 'url', title: 'URL' },
      ]
    });
    const errorUrls = errorResults.map(result => ({ url: result.url }));
    await csvWriterError.writeRecords(errorUrls);
    console.log('Errors written to error_urls.csv');
  }
})();





















// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs').promises;

// const urls = [
// "https://www.amazon.in/Oswaal-Question-PAPERS_Class-9_Biology_For-2024-25/dp/9359587095",
//   "https://www.amazon.in/Oswaal-Question-SOLVED-Geography-2024-25/dp/9359583294",
//   "https://www.amazon.in/Oswaal-Question-Economic-Application-2024-25/dp/9359587656",


// ];

// async function fetchDataAndParse(url) {
//   try {
//     const response = await axios.get(url, {
//       headers: {
//         'accept': 'text/html,*/*', 
//             'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8', 
         
          
//           }
//     });

//     const $ = cheerio.load(response.data);
//     const extractData = () => {
//       const bestSellersRankData = $('.a-text-bold').filter(function() {
//         return $(this).text().trim() === 'Best Sellers Rank:';
//       }).parent().text().trim();

//       const cleanedData = bestSellersRankData.replace(/Best Sellers Rank:/g, '').trim();
//       return { bestSellersRank: cleanedData };
//     };

//     const extractedData = extractData();
//     console.log(`Got result for ${url}`);
//     return { url, ...extractedData };
//   } catch (error) {
//     console.error('Error fetching or parsing page for', url, ':', error);
//     return { url, error: error.message };
//   }
// }

// (async () => {
//   const results = await Promise.all(urls.map(fetchDataAndParse));

//   // Separating successful results from errors
//   const successfulResults = results.filter(result => !result.error);
//   const errorResults = results.filter(result => result.error);

//   // Writing successful results to file
//   if (successfulResults.length > 0) {
//     await fs.writeFile('extracted_data.json', JSON.stringify(successfulResults, null, 2));
//     console.log('Successfully written data to extracted_data.json');
//   }

//   // Writing errors to file
//   if (errorResults.length > 0) {
//     await fs.writeFile('error_url.json', JSON.stringify(errorResults, null, 2));
//     console.log('Errors written to error_url.json');
//   }
// })();

  


  //  //'cookie': 'ubid-acbin=262-6513238-1351668; s_nr=1709615209897-New; s_vnum=2141615209898%26vn%3D1; s_dslv=1709615209901; sst-acbin=Sst1|PQHJEAyM5IEMpPxnCz8I88quBs_1vn8S9NMHxKjOqmtfuWJz_z543uw1zzyNMVMVqM8zWwPV7obqXdihcho5B_flRHtb-0q21N3KFcUUxfso6eXxh5zgCl-GcpxXlaWsunLq38osj3O1vYqnooNH9A5NafmUJptYXRUMXcLtg1av64-dBFuCAVSTNYVbg3kLd-1_8Y3XJHzboQ3LvfvJMnbgE51wiYOTI5Ij7_tavgZtqIk; i18n-prefs=INR; x-amz-captcha-1=1716378424810587; x-amz-captcha-2=Vm3dsAMUhRX9d4nwCehOyg==; session-id=258-5427539-4664400; x-acbin="LggJNVgUIHkrz?N1T1kbP9rkUkEAMFVdbysw?aSJWGEu5ypw^@E0MnR?3yPEvvdSi"; at-acbin=Atza|IwEBICGfRMAREkxQ7VUwBPh0hdes6Qyuh_iwRJEIEO3gezBTeJpF_5_LojvLtdi1rueBlc3uTd0Mhefs1eOg-rlyBIj0cxAcsNMrprfc0diboRRmpWAqvKq9ydlngpFfW4cn1Cl_0yYwao5MD4sIHX-qGtmcEQOQ9IbDmggpxd6RIU7hj7qOu_T2meE6EF4VVpUScl8l4nXKb6SY7VaQOUTPYxY7Pe2j2p3uAVNJUA0y7Zq0lA; sess-at-acbin="cR7COYM09tRHdxoujlKNFHUfuA6s/fdm15OvJdkmYSs="; session-id-time=2082787201l; lc-acbin=en_IN; sp-cdn=J4F7; b2b="VFJVRQ=="; session-token=ouFMSXLdkHAFFH2Bgyf2c5xSyRIKldomnejmH3L1siVsDotr6V8DrEAwOSiDImY8KqJOz7Xu5v3fehlm+2PhJt2GoPD7F9rJ3lRxGgrvEeMk/5m1/buNxTYjR0+wlw+ZKSXPnPHsf8OmLEhYjLURAcgi4K7VO0unnA2yzSEDVlsD8OXLwLZQvcVKUWvluhC0XXn113YqHTiWRKgrc9dYO92YvvymCjLoSRsOG1vwrahycwZqnlvkmdSKxEbz9me62TNLk7sPtFndA2fRTohTvJy5t9Cdo0AVFqZSZqZDeCkDegVsYV9x1ShQUzWSbBTn3wroOcMET5TeunXzoO7LZIzzQvoSfIykz454ZKRC+uQGLYrHZHI6/jglo5L2jDGX; csm-hit=tb:s-ZDVYNGTZ58W2SDF6KJ2H|1717479046279&t:1717479049866&adb:adblk_no; i18n-prefs=INR; session-id=257-8886605-2823314; session-id-time=2082787201l; session-token=R+ZoldGPnFf9vmAXfalID8x3hjPMkmeyyFo+zHuuSAVf4c60/1TOZVcxrYxTR6ef8QEbT3sFPYL39+2+zcX6q2L3Wpx6YJPuXnVTSQAMJOLnLbRTq0ToNpEX1rA2qPEJdvqIqy+30fywG32qyMslFAc54hHigZ0m+B7LzzwRSM5ZT2RjHFUJ/D9EHf18p7h1VfZOr8nVot0zn318tCzMP4/SskZAnwa9HHcf32yeKca5yIYucMdP164MUHPVioQfCNZysn4MnHeZ2xG5hXOD04cNFPevw/pNtijMODO26n6yiBVm6zP3FUa6ayQqNC+9qlM796yK0v/LGlBDGKF5J6VFKwnss5qd', 
  //  'cookie': 'session-id=260-1265984-6802412; i18n-prefs=INR; ubid-acbin=260-2440372-3989933; lc-acbin=en_IN; s_nr=1701679791695-New; s_vnum=2133679791695%26vn%3D1; s_dslv=1701679791697; x-amz-captcha-1=1707815569616385; x-amz-captcha-2=Vm9+HsLnkmihJ9hD/hu8xg==; session-id-time=2082787201l; session-token=uC1BRiRFgTEdSDo1dsKXG0vm5ULimaSiP/k8l0NqGXchbgYIyURwiOQ+lBJXk7hDtwXOaqGS/QLZVwLxnwGGvEaf58qNhJw4BA4YnMJ0PsPjW2x1r3iTyR9sD8qP1UcqP+OqB1VqiAKp+0NqvOlrht2aDiF5LPTzkb3U5FFnsemLewtTFv++N/yoEo1cGG05fQwxbiEXk5RW7IqGpvN9eh+Qla/kY1aRt2nH3DgEgli2D4MrFQuJFGz8lTLz2VCTPPIcYpD0saciHpOnncLiBSTXJmp98YS0GWNdQ5rsqbaxdeE7FbxABm7WdGavbfnFrYaXVy5lo/Qhrui2bTYnGmILDIWw3Rb5; csm-hit=tb:s-K5PXAPEDKAB55Y6KZXQ8|1716458256004&t:1716458258553&adb:adblk_no; i18n-prefs=INR; session-id=257-6177112-1304819; session-id-time=2082787201l; session-token=oCqgm0d/HJKbd7oXVn/vj6C+FH3ks3YuYDbXxwvHJ+uI2vCLbkzNffO2zd+/NLCKjp9fvjjtle9m0Yo21fLCH6hlPpyBbxbrYpdzuRON7NDXVmobkWzVkTNyU0/ZpPjYDHGN677uzk/Y6sPkH5AQzgwW4zDUXmekRqxnLcLzbUagW46oNhe8fEy1GLr6dXsG/joBQVlyubafuwWmLQT8O7j1m214A7FKhrdvh8uHAZ+mBc4BljEFuvQEJpU3ta3XF6YUVGXOEdbtK1jcsZD/bqj3EHGw9ieaz5JAk1Kw4fIHjSGJDQhmNTrAYj/Dy5HObcnKaiKXXCaVjiDxUWrkSjKixvOsTv5e', 
  //  'device-memory': '8', 
  //  'downlink': '10', 
  //  'dpr': '1.5', 
  //  'ect': '4g', 
  //  'priority': 'u=1, i', 
  //  'referer': 'https://www.amazon.in/Sikshan-Abhiyogyata-Chapter-Previous-Questions/dp/811989619X/ref=sr_1_1?crid=SND6PLYN6LO0&dib=eyJ2IjoiMSJ9.YTXdwfJh77gHujyTV--uwdfwyU7c8KF4ltUHes6MkKfGjHj071QN20LucGBJIEps.jvsQClywZDMTmZqHRrxcoSJMptEXmBcP55RSI8_xh2Q&dib_tag=se&keywords=811989619X&nsdOptOutParam=true&qid=1716458252&s=books&sprefix=811989619x%2Cstripbooks%2C213&sr=1-1', 
  //  'rtt': '150', 
  //  'sec-ch-device-memory': '8', 
  //  'sec-ch-dpr': '1.5', 
  //  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"', 
  //  'sec-ch-ua-mobile': '?0', 
  //  'sec-ch-ua-platform': '"Windows"', 
  //  'sec-ch-ua-platform-version': '"15.0.0"', 
  //  'sec-ch-viewport-width': '682', 
  //  'sec-fetch-dest': 'empty', 
  //  'sec-fetch-mode': 'cors', 
  //  'sec-fetch-site': 'same-origin', 
  //  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
  //  'viewport-width': '682', 
  //  'x-requested-with': 'XMLHttpRequest'