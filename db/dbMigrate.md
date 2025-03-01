1.migration 1(test database 1)
  old endpoints:-
    "host": "35.200.173.231",
    "user": "naxap",
    "password": "yGWw75PnVrwckX7",
    "port": "3306",
    "database": "interface",
    "connectionLimit" : 10
  
  new endpoints:-
    "host": "testdatabase.cd5ys33hnzln.ap-south-1.rds.amazonaws.com",
    "user": "naxap",
    "password": "yGWw75PnVrwckX7",
    "port": "3306",

2. test db2 migration
   old endpoints:-
     ip: 34.126.212.167
     u: root
     p: Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU

       new endpoints2:-
     ip: beta-bytescare.cd5ys33hnzln.ap-south-1.rds.amazonaws.com
     u: root
     p: Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU

   <!-- new endpoints:-
     ip: bytescare-test.cd5ys33hnzln.ap-south-1.rds.amazonaws.com
     u: root
     p: Ycq07Zq3M0v2jwHtLWXCnOIHUhjEMU -->

 


3. testing the db migration
    old endpoints:-
      ip: 34.131.51.50
      u: user
      p: EWye1j5RA1Lq22Ca7FJRXB7mfvxDdn
    new endpoints:-
      ip: beta-interface.cd5ys33hnzln.ap-south-1.rds.amazonaws.com
      





      Mongo db self hosted

      for admin:-
       db.createUser({
         user: "admin-bytescare123",
         pwd: "8atZRL0YZJib91lMbLW9",  
         roles: [{ role: "root", db: "admin" }]
         })

      for clientScan:-
        db.createUser({
           user: "XwkSHiDzXe",        
           pwd: "heByKygTgzkJPubOalKD",     
           roles: [{ role: "readWrite", db: "clientScan" }] 
          })

        

      document db:-
        user:-bytescare 
        pass:- vRxn4S02FioVSS8
    