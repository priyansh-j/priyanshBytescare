

const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputString = `
https://www.amazon.in/SECONDARY-SCHOOL-MATHEMATICS-CLASS-AGGARWAL/dp/B0D1P5NMFF
https://www.amazon.in/Mathematics-Reference-Textbook-CBSE-class/dp/B07H18WS31
https://www.amazon.in/Secondary-School-Mathematics-Class-Examination/dp/B0BLVP5D47
https://www.amazon.in/Secondary-Mathematics-Aggarwal-ARIHANT-KNOWLEDGE/dp/B07PN569PN
https://www.amazon.in/Secondary-School-Mathematics-Class-Agarwal/dp/B07BHP4DS9
https://www.amazon.in/AGGARWALs-Secondary-School-Mathematics-Class/dp/B09929CM5F
https://www.amazon.in/Secondary-School-Mathematics-Class-IX/dp/B07DHJXD6F
https://www.amazon.in/Hindi-Reader-5-Rati-Rani/dp/8177090275
https://www.amazon.in/Hindi-Reader-Bharati-Bhawan-25609/dp/B0CLVS2KMR
https://www.amazon.in/Junior-Maths-Class-1-2019/dp/B07RXQ2L4T
https://www.amazon.in/Junior-Maths-Anindita-Banerjee-Author/dp/B0DG2YC6ZQ
https://www.amazon.in/Junior-Maths-3-D-Gupta/dp/8177099477
https://www.amazon.in/Bharati-Bhawan-Junior-Maths-Class/dp/B07RXQFCNL
https://www.amazon.in/Junior-Maths-Class-Bharati-Bhawan/dp/B0D7SSLRBX
https://www.amazon.in/Junior-Maths-Class-Das-Gupta/dp/B0BYVWHH2B
https://www.amazon.in/Bharathi-Bhawan-Junior-Maths-Class/dp/B0DQ1PK18R
https://www.amazon.in/Junior-Maths-Class-Das-Gupta/dp/B09162WR4T
https://www.amazon.in/Junior-Maths-Book-3-S/dp/B0BYVJJXVQ
https://www.amazon.in/Junior-Maths-Book-4-2019/dp/B07RYR3G7Z
https://www.amazon.in/Junior-Science-Book-C-Banerjee/dp/8177098330
https://www.amazon.in/Maths-Step-Class-Bharati-Bhawan/dp/B0D2LH1SKH
https://www.amazon.in/MATH-STEPS-GUPTA-SURYABHUSHAN-PRASAD/dp/B0CRRBV184
https://www.amazon.in/Math-Steps-Asit-Das-Gupta/dp/8177092065
https://www.amazon.in/Math-Steps-Asit-Das-Gupta/dp/8177095285
https://www.amazon.in/Math-Steps-Surya-Bhushan-Gupta/dp/B0C38Z1YRX
https://www.amazon.in/MATH-STEPS-CLASS-SURYABHUSHAN-PRASAD/dp/B0D9P3TTJN
https://www.amazon.in/Math-Steps-Set-Books/dp/B08KFW7FJC
https://www.amazon.in/MATH-STEPS-CLASS-SURYABHUSHAN-PRASAD/dp/B0D96CQS1C
https://www.amazon.in/Math-Steps-Surya-Bhushan-Gupta/dp/B0C38VPVBZ
https://www.amazon.in/MATH-STEPS-Class-ASIT-GUPTA/dp/B095KXLMBT
https://www.amazon.in/Bharati-Bhawan-Steps-Class-Gupta/dp/B0DPWXFTWK
https://www.amazon.in/FOUR-CLASS-MEETS-REQUIREMENTS-STEPS/dp/B0CYQ89M3Y
https://www.amazon.in/MATH-STEPS-2024-BHARATI-BHAWAN/dp/B0CSPD7NJ5
https://www.amazon.in/MATH-STEPS-5-GUPTA-SURYABHUSHAN-PRASAD/dp/B0CRVJXYLW
https://www.amazon.in/Math-Steps-5/dp/B00OOSHC5U
https://www.amazon.in/Mathematics-class-Aggarwal-2018-19-Session/dp/8177099825
https://www.amazon.in/Mathematics-Class-Aggarwal-Requirements-Original/dp/B0D496SC9S
https://www.amazon.in/Mathematics-Class-Aggarwal-2024-25-Paperback/dp/B0D8122Y65
https://www.amazon.in/Mathematics-Class-Examination-2022-2023-Paperback/dp/B0BBB5LWLV
https://www.amazon.in/Bharati-Bhawan-Mathematics-Class-Compliant/dp/B0D49PNCRJ
https://www.amazon.in/Mathematics-Olympiads-Talent-Search-Competitions/dp/9388704320
https://www.amazon.in/Aggarwal-Mathematics-NCERT-Ganita-Prakash/dp/B0DM1ZHT4F
https://www.amazon.in/COMBO-LAKHMIR-SCIENCE-AGGARWAL-MATHEMATICS/dp/B07QCC2V33
https://www.amazon.in/Mathematics-Class-Aggarwal-Hamari-Mapping/dp/B0D45MLJCG
https://www.amazon.in/Mathematics-Class-6-R-S-Aggarwal/dp/B0C1VC7VW9
https://www.amazon.in/Mathematics-Class-6-Examination-2024/dp/B0CZLP77WX
https://www.amazon.in/Universal-Science-Class-Mathematics-Second/dp/B0DJQZ7H4B
https://www.amazon.in/Mathematics-class-Sharma-2008-R/dp/B07FZ3YTV1
https://www.amazon.in/Aggarwal-Mathematics-2025-Examination-Class/dp/B0D2YF1Q45
https://www.amazon.in/Aggarwal-Mathematics-Examination-Perfect-Paperback/dp/B0D7ZZTW4F
https://www.amazon.in/Mathematics-Class-7-R-Aggarwal-ebook/dp/B08D3ZGDZ7
https://www.amazon.in/Mathematics-Class-RS-Aggarwal-LLL/dp/B0CZXLT6CZ
https://www.amazon.in/Mathematics-Class-Aggarwal-Hamari-Mapping/dp/B0D45G69WX
https://www.amazon.in/Aggarwal-Maths-Class-7th/dp/B09RH75HL9
https://www.amazon.in/Mathematics-Class-7-RS-Aggarwal/dp/B09PRM4T2C
https://www.amazon.in/Mathematics-Aggarwal-2018-19-bharti-bhawan/dp/B07BN7Q7LH
https://www.amazon.in/Mathematics-Class-Bharati-Bhawan-10038/dp/B0DGDLL6HK
https://www.amazon.in/Mathematics-Class-7-Answer-Key/dp/B0CG1TG91R
https://www.amazon.in/Mathematics-Class-RS-Aggarwal-Hafsa/dp/B0DNYZMK64
https://www.amazon.in/Aggarwal-Mathematics-Revised-2024-25-Paperback/dp/B0D8149F7N
https://www.amazon.in/Mathematics-Class-8-CBSE-Generic/dp/B0B8RPH72C
https://www.amazon.in/Mathematics-Class-Aggarwal-Second-Hand/dp/B0CLXXQHGS
https://www.amazon.in/Aggarwal-Mathematics-Examination-Perfect-Paperback/dp/B0D9SCBJ2T
https://www.amazon.in/Essential-Mathematics-Class-2018-19-Session/dp/935027177X
https://www.amazon.in/Mathematics-Aggarwal-Second-Hamari-Mapping/dp/B0D44TR1FW
https://www.amazon.in/Bharti-Bhawan-Mathematics-Class-8/dp/B0DG8VPG5D
https://www.amazon.in/Mathematics-Class-Aggarwal-Hamari-Mapping/dp/B0D45K8DK4
https://www.amazon.in/Bharati-Bhawan-Mathematics-Class-8/dp/B0D96JC1RD
https://www.amazon.in/Mathematics-Class-8-Examination-2021-2022/dp/B09SX3RY6H
https://www.amazon.in/Aggarwal-Mathematics-Class-R-S/dp/B0DQJ9QP5D
https://www.amazon.in/Mathematics-Class-RS-Aggarwal-Bharati/dp/B0CHPD94YV
https://www.amazon.in/Mathematic-Class-Aggarwal-Second-Hand/dp/B0CXQ1HQ6X
https://www.amazon.in/Bharti-Bhawan-Mathematics-NCERT-Textbook/dp/B0DM2B66NJ
https://www.amazon.in/Class-8-RD-Sharma-Mathematics/dp/B07BPXPYHC
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0BBTWH9X8
https://www.amazon.in/Mathematics-Olympiads-Talent-Search-Competitions-ebook/dp/B0814ZRJYN
https://www.amazon.in/Mathematics-Olympiads-Talent-Search-Competitions-ebook/dp/B0836XW3T7
https://www.amazon.in/Mathematics-Olympiads-Talent-Search-Competitions-ebook/dp/B081VFN5S2
https://www.amazon.in/Grammar-Time-Bharati-Bhawan-12006/dp/B0D7DJJ267
https://www.amazon.in/My-Grammar-Time-2018-19-Session/dp/9350271796
https://www.amazon.in/Grammar-Bharati-Sabharwal-English-Paperback/dp/B0DHQZ5TB3
https://www.amazon.in/Grammar-Time-Bharati-Bhawan-30231/dp/B0D9C4GCSK
https://www.amazon.in/Bharati-Bhawan-Grammar-Time-Book/dp/B0DG5RP2W3
https://www.amazon.in/My-Grammar-Time-2018-19-Session/dp/9350271923
https://www.amazon.in/My-Grammar-Time-2018-19-Session/dp/9350271869
https://www.amazon.in/My-Grammar-Time-2018-19-Session/dp/9350271915
https://www.amazon.in/My-Grammar-Time-2018-19-Session/dp/9350271877
https://www.amazon.in/Grammar-Time-Bharati-Bhawan-30265/dp/B0D9C2WVDH
https://www.amazon.in/Grammar-Time-Bharati-Bhawan-11313/dp/B0CX9DSCHS
https://www.amazon.in/Grammar-Time-Bharati-Bhawan-11314/dp/B0CX9F8PM8
https://www.amazon.in/Grammar-Time-Class-Second-Hand/dp/B0CZDPYF2V
https://www.amazon.in/Bharati-Bhawan-Grammar-Time-Book/dp/B0DGGP5FTN
https://www.amazon.in/Grammar-Time-Class-Second-Hand/dp/B0C1GTNDG6
https://www.amazon.in/Grammar-Time-Bharati-Bhawan-11317/dp/B0CX9D64YN
https://www.amazon.in/Grammar-Time-Class-Condition-Note/dp/B09FHR4KJN
https://www.amazon.in/Grammar-Time-Bharati-Bhawan-30285/dp/B0D9C3RSTL
https://www.amazon.in/World-Class-Bharati-Bhawan-second/dp/B0BVKM9FW9
https://www.amazon.in/Our-World-Then-Now-1/dp/9350271109
https://www.amazon.in/World-Class-Bharati-Bhawan-Second/dp/B0CYLNBDTS
https://www.amazon.in/Our-World-Then-Now-1/dp/8177098004
https://www.amazon.in/Our-World-Then-Now-Class/dp/B084V4FGV8
https://www.amazon.in/Our-World-Then-Now-2-Mukherji-ebook/dp/B08D6Y6PWV
https://www.amazon.in/World-Then-Book-Social-Studies/dp/B0D5VHDS6T
https://www.amazon.in/Our-World-Then-Now-2/dp/8177098632
https://www.amazon.in/World-Then-Book-Class-Second/dp/B0CL3BF26C
https://www.amazon.in/Our-World-Then-Book-Class/dp/B0BWCP14GP
https://www.amazon.in/World-Aggarwal-mathematics-class-boooks/dp/B0BT7Y3C2W
https://www.amazon.in/World-Then-Book-Class-Second/dp/B0CY7WGW17
https://www.amazon.in/Bharati-bhawan-Aggarwal-mathematics-boooks/dp/B0BT7Z2PM6
https://www.amazon.in/World-Then-Class-Second-Hand/dp/B09X4B4CK3
https://www.amazon.in/Worlds-Then-Book-Class-Second/dp/B0CXXVBYLZ
https://www.amazon.in/Our-World-Then-Now-2/dp/9350271117
https://www.amazon.in/Worlds-Then-Book-Class-Condition/dp/B098XNQGMJ
https://www.amazon.in/Sanskrit-Bharati-Deb-Kant-Jha/dp/9350270412
https://www.amazon.in/Sanskrit-Abhyasini-Praveshika-Gopebandhu-Mishra/dp/8177095579
https://www.amazon.in/Sugam-Sanskrit-Vyakaran-Chandra-Kant/dp/8177090410
https://www.amazon.in/Sanskrit-Bharati-Praveshika-Gopebandhu-Mishra/dp/9350270404
https://www.amazon.in/Sanskrit-Bharati-Deb-Kant-Jha/dp/8177095528
https://www.amazon.in/Sanskrit-Bharati-Deb-Kant-Jha/dp/9350270633
https://www.amazon.in/Sanskrit-Bharati-Deb-Kant-Jha/dp/9350270420
https://www.amazon.in/Sanskrit-Abhyasini-Deb-Kant-Jha/dp/8177095587
https://www.amazon.in/Sugam-Sanskrit-Vyakaran-Chandra-Kant/dp/8177090429
https://www.amazon.in/Sanskrit-Abhyasini-Deb-Kant-Jha/dp/8177095595
https://www.amazon.in/Sanskrit-Abhyasini-Deb-Kant-Jha/dp/8177095676
https://www.amazon.in/Secondary-School-Mathematics-Class-Examination/dp/9350271850
https://www.amazon.in/Math-Secondary-School-Mathematics-Class/dp/B0D3YG89RC
https://www.amazon.in/Aggarwal-Secondary-School-Mathematics-Class/dp/B0DMW6BJGS
https://www.amazon.in/Secondary-School-Mathematics-2019-20-Session/dp/B07MYK7MK4
https://www.amazon.in/Aggarwal-Secondary-Mathematics-20232024-Examination/dp/B0BY4V74CT
https://www.amazon.in/Secondary-Mathematics-Aggarwal-General-Knowledge/dp/B0DJ3CXNNL
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-Science/dp/B0DJ8QRKH6
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-Second/dp/B0CJ38VGLG
https://www.amazon.in/Secondary-school-mathematics-class-9/dp/B095PHGFR8
https://www.amazon.in/Secondary-School-Mathematics-Examination-2020-2021/dp/9388704517
https://www.amazon.in/Secondary-School-Mathematics-Class-Examination/dp/B0BBV1FJ1F
https://www.amazon.in/Secondary-School-Mathematics-Class-Old/dp/8177099965
https://www.amazon.in/Secondary-School-Mathematics-Class-Answer/dp/B0CG1YPTVV
https://www.amazon.in/aggarwal-class-Secondary-School-Mathematics/dp/B0D1W16J44
https://www.amazon.in/Bharati-Bhawan-Secondary-Mathematics-Aggarwal/dp/B082HZB6VY
https://www.amazon.in/Secondary-School-Mathematics-Class-Examination/dp/9350271818
https://www.amazon.in/Bharati-Bhawan-Secondary-School-Mathematics/dp/B0CY7YW1LZ
https://www.amazon.in/Senior-Secondary-School-Mathematics-Aggrawal/dp/B07F153RS5
https://www.amazon.in/Secondary-Mathematics-ARIHANT-GENERAL-KNOWLEDGE/dp/B07PN48GNZ
https://www.amazon.in/Aggarwal-Class-Secondary-School-Mathematics/dp/B0D9SHKJ6Z
https://www.amazon.in/Secondary-School-Mathematics-Class-Examination/dp/B0D3YG6H4K
https://www.amazon.in/Secondary-School-Mathematics-Class-Aggarwal/dp/B09FJJLDGM
https://www.amazon.in/Bharati-Bhawan-Secondary-School-Mathematics/dp/B0CY89PMWJ
https://www.amazon.in/Aggarwal-Secondary-School-Mathematics-Bharati/dp/B0D8BVNQVN
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-ENTERPRISES/dp/B0DMTGB5CL
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-ENTERPRISES/dp/B0DNKLGFVD
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-Aakash/dp/B0DJ38P99C
https://www.amazon.in/Secondary-School-Mathematics-Textbook-Aggarwal/dp/B0DKD97FDC
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-Second/dp/B0D9QTNTVZ
https://www.amazon.in/SECONDARY-SCHOOL-MATHEMATICS-CLASS-10-AGGARWAL/dp/B0D3DG6KDN
https://www.amazon.in/Secondary-school-Mathematics-Class-Aggarwal/dp/B07DCDYBKL
https://www.amazon.in/Secondary-School-Mathematics-Class-Aggarwal/dp/B07DZVTC4J
https://www.amazon.in/Mathematics-Class-Aggarwal-Second-Hand/dp/B0B2MZ2XNG
https://www.amazon.in/Secondary-Mathematics-Aggarwal-Hanuman-Chalisa/dp/B0BVVYSBGL
https://www.amazon.in/Secondary-School-Mathematics-Class-Examination/dp/B0CZY3VQDB
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-Second/dp/B0B7G78Q3X
https://www.amazon.in/Secondary-School-Mathematics-class-10/dp/B07J48QWY1
https://www.amazon.in/Secondary-School-Mathematics-Aggarwal-Condition/dp/B09JMS9L4L
https://www.amazon.in/Secondary-school-Mathematic-class-condition/dp/B09LYP2GLR
https://www.amazon.in/Combo-Pack-Chemistry-Mathematics-Examination/dp/B09MMJ9BXZ
https://www.amazon.in/Senior-Secondary-School-Mathematics-Aggarwal/dp/B0BM9YZNBT
https://www.amazon.in/Aggarwal-Senior-Secondary-School-Mathematics/dp/B09SV743PN
https://www.amazon.in/Senior-Secondary-Mathematics-Examination-2020-2021/dp/B08KFRTXGV
https://www.amazon.in/Aggarwal-Senior-Secondary-Mathematics-2024-25/dp/B0CSWRKZCL
https://www.amazon.in/Mathematics-Senior-Secondary-School-Class/dp/B0DMTKLBYD
https://www.amazon.in/Aggarwal-Senior-Secondary-School-Mathematics/dp/B07F1G65CG
https://www.amazon.in/Senior-Secondary-School-Mathematics-Class/dp/B0CBSFJP73
https://www.amazon.in/Senior-Secondary-School-Mathematics-Aggarwal/dp/B0D9FLYPDF
https://www.amazon.in/SHARMA-MATHEMATICS-CONCEPTS-PHYSICS-SECONDARY/dp/B0CKXV58D6
https://www.amazon.in/SENIOR-SECONDARY-MATHEMATICS-CLASS-11-AGGARWAL/dp/B0D33QFBFM
https://www.amazon.in/Secondary-Mathematics-Aggarwal-Paperback-2019-20/dp/B0CJ6NH6F1
https://www.amazon.in/Aggarwal-Senior-Secondary-Mathematics-Textbook/dp/B0DKD886GG
https://www.amazon.in/Senior-Secondary-Mathematics-Textbook-ENTERPRISES/dp/B0DMTHBHS8
https://www.amazon.in/Senior-Secondary-School-Mathematics-Class/dp/B071GRQC5X
https://www.amazon.in/Senior-Secondary-School-Mathematics-aggarw/dp/B079CCMDZP
https://www.amazon.in/Secondary-Mathematics-Aggarwal-English-Hanuman/dp/B0BVVWY115
https://www.amazon.in/Senior-Secondary-School-Mathematics-Second/dp/B09RQS1FHV
https://www.amazon.in/Secondary-Mathematics-Aggarwal-2018-19-Session/dp/B07BN8X6PX
https://www.amazon.in/Sugam-Sanskrit-Vyakaran-RAJ-ENTERPRISES/dp/B0CSG4LTPY
https://www.amazon.in/Sugam-Sankrit-vyakaran-part-2/dp/B09XJQLB8J
https://www.amazon.in/Carpet-Bharati-Bhawan-English-Paperback/dp/B0DHQZYCZ7
https://www.amazon.in/Magic-Carpet-Bharati-Bhawan-Author/dp/B0CYBP8DHB
https://www.amazon.in/Magic-Carpet-English-Coursebook-Class/dp/9388704223
https://www.amazon.in/Magic-Carpet-Book-Class-3/dp/9388704347
https://www.amazon.in/Magic-Carpet-4-Amber-Benerjee/dp/B09SGWB67J
https://www.amazon.in/11493/dp/B0BZFQ9PRQ
https://www.amazon.in/Magic-Carpet-Book-5/dp/9388704444
https://www.amazon.in/Magic-Carpet-6-Amber-Benerjee/dp/9388704649
https://www.amazon.in/Bharati-Bhawan-Magic-Carpet-Class/dp/B0DGGPGXRC
https://www.amazon.in/Magic-Carpet-7-Amber-Benerjee/dp/9388704711
https://www.amazon.in/Magic-Carpet-8-Amber-Benerjee/dp/938870472X
https://www.amazon.in/Bharti-magic-carpet-class-paperback/dp/B0D98V4NFS
https://www.amazon.in/Concepts-Physics-Soltions-Volumes-2023-24/dp/B0BZMWW71Z
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0CQTQXC2G
https://www.amazon.in/Concept-Physics-Part-1-2018-2019-Session/dp/8177091875
https://www.amazon.in/Concepts-Physics-Verma-Books-ORIGINAL/dp/B0DH534GW2
https://www.amazon.in/HC-VERMA-Concepts-Physics-Vol/dp/B07HLK6WGQ
https://www.amazon.in/Concepts-Physics-Verma-Combo-Solutions/dp/B0D4LRPFP1
https://www.amazon.in/Concept-Physics-Session-Books-Paperback/dp/B0B9K6F3TD
https://www.amazon.in/Concepts-Physics-Verma-Second-Hand/dp/B0CLDVP7ZJ
https://www.amazon.in/CONCEPTS-PHYSICS-VOL-2-H-VERMA/dp/B0B3MPG2CC
https://www.amazon.in/Concept-Physics-Class-Verma-Second/dp/B0CLZPZ4C4
https://www.amazon.in/Concept-Physics-Part-Session-books/dp/B07TB7GP2R
https://www.amazon.in/Concepts-Physics-VOL-Class-11-Solutions/dp/B08PSQ8X6Y
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0D5R5ZY73
https://www.amazon.in/Concepts-Physics-VOL-Class-11-Solutions/dp/B093DWQKC2
https://www.amazon.in/Concepts-Physics-Solutions-ORIGINAL-QUALITY/dp/B0D3LX73WC
https://www.amazon.in/H-C-verma-Concepts-Solutions-Paperback-H-C-Verma/dp/B0CBL5WHCF
https://www.amazon.in/Concept-physics-1-Class-Solution/dp/B08ZDN6SYT
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0D33P5PPV
https://www.amazon.in/Concept-Physics-Condition-Note-Used/dp/B09FY4YWR2
https://www.amazon.in/Concepts-Physics-Class-Verma-Second/dp/B0BLBPHMW3
https://www.amazon.in/Solutions-Concepts-Physics-H-c-Verma/dp/B071XHXFVB
https://www.amazon.in/Concept-Physics-Part-Verma-Second/dp/B0BKZZLBFS
https://www.amazon.in/Concepts-Physics-Verma-Textbook-SECOND/dp/B0DKC7BGBN
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0D33P2262
https://www.amazon.in/Verma-Concepts-Physics-Solutions-2024-2025/dp/B0D7J4CJD7
https://www.amazon.in/Concept-Physics-Solution-Revised-2024-25/dp/B0D2DGYLB3
https://www.amazon.in/Concept-Physics-Part-2-2018-2019-Session/dp/8177092324
https://www.amazon.in/Concepts-Physics-Solution-Combo/dp/B0B9K5NZRJ
https://www.amazon.in/Verma-class-concepts-Physics-part/dp/B079D7944H
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0D94NCPCG
https://www.amazon.in/Concepts-Physics-Aakash-Zoology-Second/dp/B0DG2Z97R2
https://www.amazon.in/Concepts-Physics-2-HC-Verma/dp/B0DB2JQQHS
https://www.amazon.in/Concepts-Physics-Verma-Solutions-books/dp/B0DB2KC8R6
https://www.amazon.in/Concepts-Physics-Verma-Second-Hand/dp/B0CY4JP3SX
https://www.amazon.in/Concepts-Physics-1-Examination-2022-2023/dp/B09V5DNPDG
https://www.amazon.in/Concepts-Physics-1-H-C-Verma/dp/B07CRYRZHD
https://www.amazon.in/Concepts-physics-1-H-Verma/dp/B07NWXLZ4H
https://www.amazon.in/Concepts-Physics-Class-H-C-Verma-Second/dp/B0CM9TFGPG
https://www.amazon.in/Concepts-Physics-Verma-Handbook-Second/dp/B0DPX9G7KX
https://www.amazon.in/Electromagnetism-Concept-Physics-2019-2020-Session/dp/B08K5QQFJ9
https://www.amazon.in/Concepts-Physics-Aakash-Zoology-Second/dp/B0DG31BF2N
https://www.amazon.in/Foundation-Science-Physics-Class-Examination/dp/B0857JLRH3
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0CBNJ8MT2
https://www.amazon.in/Concepts-Physics-Aakash-Botany-Second/dp/B0DG2ZYC4N
https://www.amazon.in/CONCEPTS-PHYSICS-HC-VERMA-PART/dp/B01M1AMU27
https://www.amazon.in/Concepts-Of-Physics-1/dp/B01NBVFAHJ
https://www.amazon.in/Bharati-Bhawan-Publishers-Concept-TextBook/dp/B08CLLM5ND
https://www.amazon.in/Mathematics-Concept-physics-part1-2-Simplified/dp/B0CW1XQ9GS
https://www.amazon.in/Concep-tual-Physics-Concepts-BOOKS-TOP/dp/B0D6B79YTB
https://www.amazon.in/Concept-Physics-2019-2020-Session-Foundation/dp/B07YHNRSPH
https://www.amazon.in/Concepts-Physics-Part-H-C-VERMA/dp/B08PKX7NJ4
https://www.amazon.in/Concepts-Physics-Aakash-Zoology-Second/dp/B0DG2MH7WH
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/8193109384
https://www.amazon.in/Pradeeps-Course-Chemistry-Concept-Physics/dp/B0CW1WBCPZ
https://www.amazon.in/Concepts-physics-Verma-Vol-Old/dp/B07FLF899P
https://www.amazon.in/Concepts-Physics-Verma-Solutions-Volumes/dp/B08Z47LTK4
https://www.amazon.in/Concepts-Physics-Sharma-Mathematics-Simplified/dp/B0CW37DPNZ
https://www.amazon.in/Concepts-Physics-Solutions-Formulae-Definations/dp/B0CGJVGBTK
https://www.amazon.in/HC-Verma-Concepts-Formulae-Definitions/dp/B0CGJGKZ9Y
https://www.amazon.in/Concept-physics-1-Solution-Chemistry/dp/B09169FC5P
https://www.amazon.in/HC-Verma-Concepts-Physics-Set/dp/B0CVMYJM3C
https://www.amazon.in/Hc-Verma-concepts-physics-2/dp/B07HLJD3GJ
https://www.amazon.in/VERMA-CONCEPT-PHYSICS-COMBO-BOOKS/dp/B0CQRPBHZ4
https://www.amazon.in/MATHEMATICS-IIT-JEE-Volumes-2019-2020-Session/dp/B08KPWSNFQ
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B09ZV7WWQW
https://www.amazon.in/Concepts-Physics-2-HC-Verma/dp/B07HC5J6R1
https://www.amazon.in/Concepts-Physics-Class-Only-Second/dp/B09X4C7X8Y
https://www.amazon.in/Concepts-Physics-Solutions-ORIGINAL-BOOK-TOP/dp/B0D3LZKYS5
https://www.amazon.in/Verma-Concepts-Physics-Class-Solutions/dp/B0DJBXNG2Y
https://www.amazon.in/Concepts-Physics-Second-Hamari-Mapping/dp/B0D6VR9J6G
https://www.amazon.in/Concepts-Physics-Vol-HC-Verma/dp/B0CQXC26HD
https://www.amazon.in/Concepts-Physics-Verma-USED-SECOND/dp/B0DKC71KLD
https://www.amazon.in/CONCEPT-PHYSICS-VOL-2-H-VERMA/dp/B0D8YMPCFL
https://www.amazon.in/Concepts-Physics-Solution-Vol-Combo/dp/B0B9K7SBHZ
https://www.amazon.in/Concept-of-physics-Vol-2/dp/B07DPSX5XF
https://www.amazon.in/Concepts-physics-vol-h-c-verma/dp/B07DN7JBKB
https://www.amazon.in/concept-physics-hc-verma/dp/B075ZYZGX9
https://www.amazon.in/Concepts-Physics-Class-Verma-Second/dp/B09R47C2HQ
https://www.amazon.in/Concepts-Physics-Aakash-Zoology-Second/dp/B0DG54CVSY
https://www.amazon.in/Concepts-physics-2-H-Verma/dp/B07MXYFSKV
https://www.amazon.in/hC-VERMA-Concepts-Physics-Part/dp/B07D8XT7L7
https://www.amazon.in/Concept-Physics-2019-2020-Session-Simplified/dp/B089FHMVDD
https://www.amazon.in/Concept-Physics-Part-2-Verma-Kalyan/dp/B09MSBVBPD
https://www.amazon.in/Approach-Chemical-Calculations-Concept-2019-2020/dp/B08M64B24K
https://www.amazon.in/Modern-Approach-Chemical-Calculations-Mukerjee/dp/938870407X
https://www.amazon.in/Modern-Approach-Chemical-Calculations-MUKERJEE/dp/B0B4WMP4W2
https://www.amazon.in/APPROACH-CHEMICAL-CALCULATIONS-MUKERJEE-ENGINEERING/dp/B01LX2KI31
https://www.amazon.in/Modern-Approach-Chemical-calculations-NA/dp/B09PD4QQ5T
https://www.amazon.in/Modern-Approach-Chemical-calculations-mukherjee/dp/B071XJ16FF
https://www.amazon.in/Approach-Chemical-Calculations-Introduction-Concept/dp/B09TB5XVQ7
https://www.amazon.in/Modern-Approach-Chemical-calculations-mukherjee/dp/B0BM7C4M4V
https://www.amazon.in/MODERN-APPROACH-CHEMICAL-CALCULATIONS-Mukerjee/dp/B0C6M6HJFQ
https://www.amazon.in/Learing-Modern-Approach-Chemical-calculations/dp/B09P41Y5RM
https://www.amazon.in/Modern-Approach-Physical-Chemistry-Structure/dp/9350271931
https://www.amazon.in/Chemical-Calculations-mukharjeeCondition-Note-Used/dp/B098MJVWM8
https://www.amazon.in/Approach-Calculations-2019-2020-Inorganic-Chemistry/dp/B08KPXY56Q
https://www.amazon.in/Approach-Calculations-Problems-Solutions-MATHEMATICS-CHEMISTRY/dp/B08KQ1ZHFN
https://www.amazon.in/Bhoutiki-Ki-Samajh-Vol-1-Varma/dp/9350271990
https://www.amazon.in/Buyestops-BHARATI-BHAWAN-Bhoutiki-Samajh/dp/B0CH16XF7J
https://www.amazon.in/REACTIONS-REARRANGEMENTS-REAGENTS-BHARATI-EDTION/dp/B0CB15S2Z1
https://www.amazon.in/REACTIONS-REARRANGEMENTS-REAGENTS-S-SANYA/dp/B0DCKBZS3T
https://www.amazon.in/Reactions-Rearrangements-reagents-Sanyal-NVB/dp/B0CJBV4X5G
https://www.amazon.in/Reactions-Rearrangements-Reagents-Sanyal-Condition/dp/B09JFZ7CRC
https://www.amazon.in/Reaction-Rearrangements-Reagents-Sanyal-NVB/dp/B0CJ7YTXD6
https://www.amazon.in/Physics-multiple-Choice-Question-pattern/dp/B076VR8FYJ
https://www.amazon.in/Physics-Mukherji-Second-Hand-Used/dp/B09VY2Y4XR
https://www.amazon.in/Physics-MCQ-by-D-Mukherji/dp/B076XVKJ23
https://www.amazon.in/Physics-MCQ-Deb-Mukherji-ebook/dp/B07R972S7F
https://www.amazon.in/Problems-Plus-Mathematics-Physics-Book/dp/B0DGFJ7ZQL
https://www.amazon.in/Physics-multiple-Choice-Question-pattern/dp/B0CPVWKNW6
https://www.amazon.in/Chemistry-MCQ-Ashis-Kumar-Ghosh/dp/8177097970
https://www.amazon.in/Chemistry-muliple-Choice-Question-Bank/dp/8177095641
https://www.amazon.in/Chemistry-MCQ-Condition-Note-Friend/dp/B098QX9YZ3
https://www.amazon.in/Bharati-Bhawan-Mathematics-MCQ/dp/B0D9QVVLWT
https://www.amazon.in/Pysics-MCQ-Mukherji-Mathematics-Examination/dp/B0DGF97VFF
https://www.amazon.in/Problems-Plus-Mathematics-Asit-Gupta/dp/8177096575
https://www.amazon.in/Problems-Mathematics-Gupta-2024-25-Examination/dp/B0DCJT83ZK
https://www.amazon.in/Das-Gopal-problems-Plus-MATHEMATICS/dp/B07YKW2R7P
https://www.amazon.in/Problems-Plus-IIT-Mathematics-Gupta/dp/B08RCPCGYK
https://www.amazon.in/Problems-Plus-IIT-Mathematics-Gupta/dp/B0CSXG7WCK
https://www.amazon.in/Problems-Plus-Mathematics-Gupta-Second/dp/B09SV3XQG5
https://www.amazon.in/Problems-Plus-Mathematics-Condition-Note/dp/B098XR3BK8
https://www.amazon.in/Concept-Physics-H-C-Verma-Part/dp/B0DM2CTJTR
https://www.amazon.in/IIT-mathematics-Das-Gupta/dp/B076HSBNM2
https://www.amazon.in/Concept-Solutions-2022-2023-Problems-Mathematics/dp/B0DM27ZZCL
https://www.amazon.in/HIGHER-ALGEBRA-Problems-Mathematics-books/dp/B08KQ2G9QC
https://www.amazon.in/Organic-Chemistry-Compounds-ebook/dp/B07MDDBKTC
https://www.amazon.in/High-School-Bhoutiki-Krityanand-Prasad/dp/935027017X
https://www.amazon.in/Navin-High-School-Bhoutiki-1/dp/8177097849
https://www.amazon.in/High-School-Bhoutiki-Krityanand-Prasad/dp/9350270145
https://www.amazon.in/Navin-High-School-Bhoutiki-2/dp/8177098551
https://www.amazon.in/School-Rasayanshastra-Awadhesh-Kumar-Singh/dp/9350270196
https://www.amazon.in/School-Rasayanshastra-Awadhesh-Kumar-Singh/dp/9350270161
https://www.amazon.in/Navin-High-School-Jeevvigyan-1/dp/8177097792
https://www.amazon.in/High-School-Jeevvigyan-Vivekanand-Banerjee/dp/9350270153
https://www.amazon.in/Navin-High-School-Jeevvigyan-2/dp/8177098446
https://www.amazon.in/2-Jeevvigyan-Bhag/dp/8177099116
https://www.amazon.in/High-School-Prathmik-Ganit-1/dp/8177099523
https://www.amazon.in/High-School-Prathmik-Ganit-2/dp/8177099612
https://www.amazon.in/Bundle-school-prathmic-ganit-solution/dp/9360317047
https://www.amazon.in/Sugam-Ganit-Asit-Das-Gupta/dp/8177099663
https://www.amazon.in/Sugam-Ganit-Asit-Das-Gupta/dp/9350270250
https://www.amazon.in/Sugam-Vigyan-1-Vivekanand-Banerjee/dp/9350270080
https://www.amazon.in/Sugam-Vigyan-3-Vivekanand-Banerjee/dp/9350270498
https://www.amazon.in/Sugam-Vigyan-2-Vivekanand-Banerjee/dp/9350270285
`;

// Split the input string to create an array of product URLs
const urls = inputString.split('\n').map(id => id.trim()).filter(id => id);

// Set up CSV writer
const csvWriter = createCsvWriter({
  path: 'product_data.csv',
  header: [
    { id: 'title', title: 'Title' },
    // { id: 'asin', title: 'ASIN' },
    // { id: 'price', title: 'Price' },
    // { id: 'mrp', title: 'MRP' },
    // { id: 'coverImage', title: 'Cover Image' },
    // { id: 'rating', title: 'Rating' },
    // { id: 'format', title: 'Format' },
    { id: 'productUrl', title: 'Product URL' }
  ]
});

async function fetchDataAndParse(url) {
  const productData = {
    title: '',
    // asin: '',
    // price: '',
    // mrp: '',
    // coverImage: '',
    // rating: '',
    // format: '',
    productUrl: url
  };

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

    // Extracting data using selectors
    productData.title = $('#productTitle').text().trim() || '';
    // productData.asin = $('input#ASIN').val() || '';
    // productData.price = $('#corePriceDisplay_desktop_feature_div .a-price .a-price-whole').text().trim() || '';
    // productData.mrp = $('#corePriceDisplay_desktop_feature_div .a-price.a-text-price .a-offscreen').text().trim() || '';
    // productData.coverImage = $('#imgTagWrapperId img').attr('src') || '';
    // productData.rating = $('.a-icon-alt').text().trim() || '';
    // productData.format = $('#productDetails_techSpec_section_1 tr:contains("Format") td').text().trim() || '';

  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.message);
  }

  return productData;
}

// Main function to fetch data and write to CSV
async function main() {
  for (const url of urls) {
    const productData = await fetchDataAndParse(url);
    
    // Write the product data to CSV immediately after fetching
    await csvWriter.writeRecords([productData]);
    console.log(`Data for ${url} written to CSV.`);
  }

  console.log('All data written to product_data.csv');
}

// Execute the main function
main();