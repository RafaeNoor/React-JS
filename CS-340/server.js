const fs = require('fs')
const http = require('http')
const socketio = require('socket.io')
const mysql = require('mysql');

const server = http.createServer(async (req, resp) => {
  resp.end(await readFile(req.url.substr(1)))
})

const readFile = f => new Promise((resolve, reject) =>
  fs.readFile(f, (e, d) => e ? reject(e) : resolve(d)))

let isDBlinked = false;
var dbCon = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'MSI',
  port: 8889,
});

dbCon.connect(function(err) {
  if (err) throw err;
  isDBlinked = true;
  console.log("Database Connected!");
});

sqlEntry = sqlStmt => {
  dbCon.query(sqlStmt, (err, result) => {
    if (err) {
      console.log('==================================================================');
      console.log(err);
      console.log('==================================================================');
    } else {
      console.log("1 record inserted successfully");
    }
  })
};

sqlDelete = sqlStmt => {
  dbCon.query(sqlStmt, (err, result) => {
    if (err) {
      console.log('==================================================================');
      console.log(err);
      console.log('==================================================================');
    } else {
      console.log("1 record deleted successfully");
    }
  });
}

sqlUpdate = sqlStmt => {
  dbCon.query(sqlStmt, (err, result) => {
    if (err) {
      console.log('==================================================================');
      console.log(err);
      console.log('==================================================================');
    } else {
      console.log("record(s) updated successfully");
    }
  });
}

sqlQuery = (sqlStmt, callback) => {
  dbCon.query(sqlStmt, (err, result) => {
    if (err) {
      console.log('==================================================================');
      console.log(err);
      return [];
      console.log('==================================================================');
    } else {
      callback(result);
    }
  });

}



const io = socketio(server)
io.sockets.on('connection', socket => {
  console.log('A user connected')
  socket.on('msg', data => {
    console.log(`socket_id:${socket.id} has connected to server`);
  })
  socket.on('disconnect', () => {
    console.log('user DC')
  })
  socket.on('insert', data => {
    let object = JSON.parse(data);
    console.log(object);
    if (object.tableName == "Customer") {
      let custRec = {
        cust_id: object['cust_id'],
        cust_name: object['cust_name'],
        date_of_birth: object['date_of_birth'],
        gender: object['gender']
      };
      var sqlStmt = "INSERT INTO `CUSTOMER` (cust_id, cust_name, date_of_birth, gender) VALUES('" +
        custRec.cust_id + "','" + custRec.cust_name + "','" + custRec.date_of_birth + "','" + custRec.gender + "')";
      console.log(sqlStmt);

      sqlEntry(sqlStmt);
      let phoneRec = {
        cust_id: object['cust_id'],
        phone_no: object['phone_no']
      };

      phoneRec['phone_no'].forEach(number => {
        let phoneSQL = "INSERT INTO `CUST_CONTACT` (phone_no,cust_id) VALUES('" +
          number + "','" + phoneRec['cust_id'] + "')";
        console.log(phoneSQL);
        sqlEntry(phoneSQL);
      });
    } else if (object.tableName == "Artist") {
      var sqlStmt = "INSERT INTO `ARTIST` (artist_id, artist_name, preferred_genre, num_records) VALUES('" +
        object.artist_id + "','" + object.artist_name + "','" + object.preferred_genre + "','" + object.num_records + "')";
      console.log(sqlStmt);
      sqlEntry(sqlStmt);
    } else if (object.tableName == "Album") {
      var sqlStmt = "INSERT INTO `ALBUM` (album_id, album_name, genre, price,inventory_count,duration,date_of_release) VALUES('" +
        object.album_id + "','" + object.album_name + "','" + object.genre + "','" + object.price + "','" + object.inventory_count + "','" + object.duration + "','" + object.date_of_release + "')";
      console.log(sqlStmt);
      sqlEntry(sqlStmt);

      object['artist_id'].forEach(artist => {
        let artistSQL = "INSERT INTO `ARTIST_ALBUM` (artist_id,album_id) VALUES('" +
          artist + "','" + object.album_id + "')";
        console.log(artistSQL);
        sqlEntry(artistSQL);
      });
    } else if (object.tableName == "Admin") {
      var sqlStmt = "INSERT INTO `ADMIN` (admin_id, admin_name, start_date, access_level) VALUES('" +
        object.admin_id + "','" + object.admin_name + "','" + object.start_date + "','" + object.access_level + "')";
      console.log(sqlStmt);
      sqlEntry(sqlStmt);
    } else if (object.tableName == "Order") {
      object['album_id'].forEach((album, index) => {
        var orderSQL = "INSERT INTO `_ORDER` (order_id, cust_id, album_id, quantity_purchased, admin_id, date_of_purchase) VALUES ('" +
          object.order_id + "','" + object.cust_id + "','" + album + "','" + object.quantity_purchased[index] + "','" + object.admin_id + "','" + object.date_of_purchase + "')";
        console.log(orderSQL);
        sqlEntry(orderSQL);
      });
    }
    socket.emit('return', JSON.stringify({
      'message': 'Succesfully Inserted'
    }));

  });

  socket.on('delete', data => {
    let object = JSON.parse(data);
    if (object.tableName == "Customer") {
      var sqlStmt = "DELETE FROM `CUSTOMER` WHERE ";
      var phoneSQL = "DELETE FROM `CUST_CONTACT` WHERE ";
      let del1 = del2 = false;
      whereClause = [];
      for (key in object) {
        if (key != 'phone_no' && key != 'tableName' && object[key] != "") {
          del1 = true;
          whereClause.push("`" + key + "`= '" + object[key] + "'");
        } else if (key == 'phone_no' && object[key].length != 0) {
          del2 = true;

          phoneSQL = phoneSQL + "`phone_no` = '" + object[key][0] + "';";
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlStmt = sqlStmt + whereClause[i] + ' AND '

        } else {
          sqlStmt = sqlStmt + whereClause[i] + ';';
        }
      }

      if (del1) {
        console.log(sqlStmt);
        sqlDelete(sqlStmt);
      }
      if (del2) {
        console.log(phoneSQL);
        sqlDelete(phoneSQL);
      }


    } else if (object.tableName == "Artist") {
      var sqlStmt = "DELETE FROM `ARTIST` WHERE ";
      let del1 = false;
      whereClause = [];
      for (key in object) {
        if (key != 'tableName' && object[key] != "") {
          del1 = true;
          whereClause.push("`" + key + "`= '" + object[key] + "'");
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlStmt = sqlStmt + whereClause[i] + ' AND '

        } else {
          sqlStmt = sqlStmt + whereClause[i] + ';';
        }
      }

      if (del1) {
        console.log(sqlStmt);
        sqlDelete(sqlStmt);
      }


    } else if (object.tableName == "Album") {
      var sqlStmt = "DELETE FROM `ALBUM` WHERE ";
      var featureSQL = "DELETE FROM `ARTIST_ALBUM` WHERE ";
      let del1 = del2 = false;
      whereClause = [];
      for (key in object) {
        if (key != 'artist_id' && key != 'tableName' && object[key] != "") {
          del1 = true;
          whereClause.push("`" + key + "`= '" + object[key] + "'");
        }
      }

      if (object['album_id'] != undefined && object['album_id'] != '') {
        featureSQL = featureSQL + "`album_id` = '" + object['album_id'] + "';";
        del2 = true;
      }


      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlStmt = sqlStmt + whereClause[i] + ' AND '

        } else {
          sqlStmt = sqlStmt + whereClause[i] + ';';
        }
      }

      if (del1) {
        console.log(sqlStmt);
        sqlDelete(sqlStmt);
      }
      if (del2) {
        console.log(featureSQL);
        sqlDelete(featureSQL);
      }


    } else if (object.tableName == "Admin") {
      var sqlStmt = "DELETE FROM `ADMIN` WHERE ";
      let del1 = false;
      whereClause = [];
      for (key in object) {
        if (key != 'tableName' && object[key] != "") {
          del1 = true;
          whereClause.push("`" + key + "`= '" + object[key] + "'");
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlStmt = sqlStmt + whereClause[i] + ' AND '

        } else {
          sqlStmt = sqlStmt + whereClause[i] + ';';
        }
      }

      if (del1) {
        console.log(sqlStmt);
        sqlDelete(sqlStmt);
      }

    } else if (object.tableName == "Order") {
      var sqlStmt = "DELETE FROM `_ORDER` WHERE ";
      let del1 = false;
      whereClause = [];
      for (key in object) {
        if (key != 'album_id' && key != 'quantity_purchased' && key != 'tableName' && object[key] != "") {
          del1 = true;
          whereClause.push("`" + key + "`= '" + object[key] + "'");
        } else if (key == 'album_id' && object[key].length != 0) {
          whereClause.push("`" + key + "`= " + object[key][0] + "'");
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlStmt = sqlStmt + whereClause[i] + ' AND ';

        } else {
          sqlStmt = sqlStmt + whereClause[i] + ';';
        }
      }

      if (del1) {
        console.log(sqlStmt);
        sqlDelete(sqlStmt);
      }
    }
    socket.emit('return', JSON.stringify({
      'message': 'Succesfully Deleted'
    }));

  });

  socket.on('update', data => {
    let object = JSON.parse(data);
    console.log(object);

    if (object['tableName'] == "Customer") {
      let sqlStmt = "UPDATE `CUSTOMER` SET ";
      let sqlWhere = "WHERE ";
      let phoneSql = "UPDATE `CUST_CONTACT` SET ";
      let phoneWhere = "WHERE ";
      let isPhoneUpdate = false;
      whereClause = [];
      setClause = [];
      for (key in object) {
        if (key != 'phone_no' && key != 'tableName' && key != 'updateArray' && object[key] != "") {
          if (!object['updateArray'][key]) {
            setClause.push("`" + key + "` = '" + object[key] + "'");
          } else {
            whereClause.push("`" + key + "`= '" + object[key] + "'");
          }
        } else if (key == 'phone_no' && object[key].length != 0) {}
      }

      for (let i = 0; i < setClause.length; i++) {
        if (i != setClause.length - 1) {
          sqlStmt = sqlStmt + setClause[i] + ', ';

        } else {
          sqlStmt = sqlStmt + setClause[i] + ' ';
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlWhere = sqlWhere + whereClause[i] + ' AND ';

        } else {
          sqlWhere = sqlWhere + whereClause[i] + ';';
        }
      }

      sqlStmt = sqlStmt + sqlWhere;
      console.log(sqlStmt);
      sqlUpdate(sqlStmt);

    } else if (object['tableName'] == "Artist") {

      let sqlStmt = "UPDATE `ARTIST` SET ";
      let sqlWhere = "WHERE ";
      setClause = [];
      whereClause = [];
      for (key in object) {
        if (key != 'tableName' && key != 'updateArray' && object[key] != "") {
          if (!object['updateArray'][key]) {
            setClause.push("`" + key + "` = '" + object[key] + "'");
          } else {
            whereClause.push("`" + key + "`= '" + object[key] + "'");
          }
        }
      }

      for (let i = 0; i < setClause.length; i++) {
        if (i != setClause.length - 1) {
          sqlStmt = sqlStmt + setClause[i] + ', ';

        } else {
          sqlStmt = sqlStmt + setClause[i] + ' ';
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlWhere = sqlWhere + whereClause[i] + ' AND '

        } else {
          sqlWhere = sqlWhere + whereClause[i] + ';';
        }
      }

      sqlStmt = sqlStmt + sqlWhere;

      console.log(sqlStmt);



    } else if (object['tableName'] == "Album") {
      var sqlStmt = "UPDATE `ALBUM` SET ";
      var sqlWhere = " WHERE ";
      setClause = [];
      whereClause = [];
      for (key in object) {
        if (key != 'artist_id' && key != 'tableName' && key != 'updateArray' && object[key] != "") {
          if (!object['updateArray'][key]) {
            setClause.push("`" + key + "` = '" + object[key] + "'");
          } else {
            whereClause.push("`" + key + "`= '" + object[key] + "'");
          }
        }
      }

      if (object['album_id'] != undefined && object['album_id'] != '') {
        //featureSQL = featureSQL + "album_id = '" + object['album_id'] +"';";
        //del2=true;
      }


      for (let i = 0; i < setClause.length; i++) {
        if (i != setClause.length - 1) {
          sqlStmt = sqlStmt + setClause[i] + ', ';

        } else {
          sqlStmt = sqlStmt + setClause[i] + ' ';
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlWhere = sqlWhere + whereClause[i] + ' AND '

        } else {
          sqlWhere = sqlWhere + whereClause[i] + ';';
        }
      }

      sqlStmt = sqlStmt + sqlWhere;

      console.log(sqlStmt);

    } else if (object['tableName'] == "Admin") {
      let sqlStmt = "UPDATE `ADMIN` SET ";
      let sqlWhere = "WHERE ";
      setClause = [];
      whereClause = [];
      for (key in object) {
        if (key != 'tableName' && key != 'updateArray' && object[key] != "") {
          if (!object['updateArray'][key]) {
            setClause.push("`" + key + "` = '" + object[key] + "'");
          } else {
            whereClause.push("`" + key + "`= '" + object[key] + "'");
          }
        }
      }

      for (let i = 0; i < setClause.length; i++) {
        if (i != setClause.length - 1) {
          sqlStmt = sqlStmt + setClause[i] + ', ';

        } else {
          sqlStmt = sqlStmt + setClause[i] + ' ';
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlWhere = sqlWhere + whereClause[i] + ' AND '

        } else {
          sqlWhere = sqlWhere + whereClause[i] + ';';
        }
      }

      sqlStmt = sqlStmt + sqlWhere;
      console.log(sqlStmt);


    } else if (object['tableName'] == "Order") {
      var sqlStmt = "UPDATE `_ORDER` SET ";
      var sqlWhere = "WHERE ";
      setClause = [];
      whereClause = [];
      for (key in object) {
        if (key != 'album_id' && key != 'quantity_purchased' && key != 'updateArray' && key != 'tableName' && object[key] != "") {
          if (!object['updateArray'][key]) {
            setClause.push("`" + key + "` = '" + object[key] + "'");
          } else {
            whereClause.push("`" + key + "`= '" + object[key] + "'");
          }
        } else if (key == 'album_id' && object[key].length != 0) {
          //whereClause.push("`"+key+"`= "+object[key][0]+"'");
        }
      }

      for (let i = 0; i < setClause.length; i++) {
        if (i != setClause.length - 1) {
          sqlStmt = sqlStmt + setClause[i] + ', ';

        } else {
          sqlStmt = sqlStmt + setClause[i] + ' ';
        }
      }

      for (let i = 0; i < whereClause.length; i++) {
        if (i != whereClause.length - 1) {
          sqlWhere = sqlWhere + whereClause[i] + ' AND '

        } else {
          sqlWhere = sqlWhere + whereClause[i] + ';';
        }
      }

      sqlStmt = sqlStmt + sqlWhere;
      console.log(sqlStmt);

    }

    socket.emit('return', JSON.stringify({
      'message': 'Succesfully Updated'
    }));

  })
  socket.on('query', data => {
    let packet = JSON.parse(data);
    console.log(`User requested query ${packet['query']} with inputs: ${JSON.stringify(packet['inputs'])}`);
    if (packet['query'] == 0) {
      let results = {
        headers: ['album_id', 'album_name', 'inventory_count'],
        rows: []
      };

      let sqlStmt = "SELECT A.album_id,A.album_name,A.`inventory_count` FROM `ALBUM` as A WHERE A.inventory_count = (SELECT MAX(`inventory_count`) FROM `ALBUM` AS B)";


      let queryResults = sqlQuery(sqlStmt, res => {
        let tableRows = [];
        res.forEach(data => {
          tableRows.push({
            album_id: data['album_id'],
            album_name: data['album_name'],
            inventory_count: data['inventory_count']
          });
        })

        results['rows'] = tableRows;
        socket.emit('query', JSON.stringify(results));

      });

    } else if (packet['query'] == 1) { //REMAINING

      let sqlStmt = 'SELECT a as "artist_id",b as "artist_name", SUM(i) as "total_inventory_count" FROM (SELECT A.`artist_id` as a, B.`artist_name` as b, A.`album_id`, C.`inventory_count` as i FROM `ARTIST_ALBUM` as A, `ARTIST` as B, `ALBUM` as C WHERE A.`artist_id` = B.`artist_id` AND C.`album_id` = A.`album_id`) as T  GROUP BY a LIMIT 1';
      let results = {
        headers: ['artist_id','artist_name','total_inventory_count'],
        rows: [],
      }

      let queryResults = sqlQuery(sqlStmt, res => {
        let tableRows = [];
        res.forEach(data => {
          tableRows.push({
            artist_id: data['artist_id'],
            artist_name: data['artist_name'],
            'total_inventory_count': data['total_inventory_count']
          });
        })

        results['rows'] = tableRows;
        socket.emit('query', JSON.stringify(results));

      });




    } else if (packet['query'] == 2) {
      let results = {
        headers: ['album_id', 'album_name', 'Total Sales'],
        rows: []
      };

      sqlStmt = 'SELECT T.`album_id`,A.`album_name`,SUM(T.`quantity_purchased`) AS "Total Sales" FROM (SELECT O.`quantity_purchased`,O.`album_id` FROM `_ORDER` AS O) AS T, `ALBUM` AS A WHERE T.`album_id` = A.`album_id` GROUP BY T.`album_id` ORDER BY SUM(T.`quantity_purchased`) DESC LIMIT 1';
      let queryResults = sqlQuery(sqlStmt, res => {
        let tableRows = [];
        res.forEach(data => {
          tableRows.push({
            album_id: data['album_id'],
            album_name: data['album_name'],
            'Total Sales': data['Total Sales']
          });
        })

        results['rows'] = tableRows;
        socket.emit('query', JSON.stringify(results));

      });




    } else if (packet['query'] == 3) {
      let results = {
        headers: ['album_id', 'album_name', 'Quantity Purchased'],
        rows: []
      };

      let numOrders = 0;
      let myCust = -1;

      let tableRows = [];

      let sql1 = 'SELECT DISTINCT A.`cust_id`, COUNT(*) as "number_orders" FROM  (SELECT DISTINCT B.`order_id`,B.`cust_id` FROM `_ORDER` AS B) AS A GROUP BY A.`cust_id` LIMIT 1';
      sqlQuery(sql1, res => {

        res.forEach(data => {
          numOrders = numOrders + data['number_orders'];
          myCust = data['cust_id'];
        });
        let sql2 = 'SELECT A.`album_id`,B.`album_name`,SUM(A.`quantity_purchased`) AS "Quantity Purchased" FROM `_ORDER` as A, `ALBUM` AS B WHERE `cust_id` = ' + "'" + myCust + "'" + ' AND A.`album_id` = B.`album_id`  GROUP BY A.`album_id`';
        sqlQuery(sql2, res2 => {
          res2.forEach(rowData => {
            tableRows.push({
              album_id: rowData['album_id'],
              album_name: rowData['album_name'],
              'Quantity Purchased': rowData['Quantity Purchased'],
            })
          })


          results['myCust'] = myCust;
          results['numOrders'] = numOrders;
          results['rows'] = tableRows;
          socket.emit('query', JSON.stringify(results));


        })

      })

    } else if (packet['query'] == 4) {
      let results = {
        headers: ['cust_id', 'cust_name', 'Units Purchased'],
        rows: []
      };

      let sqlStmt1 = 'SELECT a.`album_id`,a.`album_name`,a.`price` FROM `ALBUM` a LEFT OUTER JOIN `ALBUM` b ON a.`album_id` = b.`album_id` AND a.`price` < b.`price` WHERE b.`album_id` IS NULL ORDER BY a.`price` DESC LIMIT 1';
      console.log(sqlStmt1);
      let queryResults = sqlQuery(sqlStmt1, res => {
        console.log('Returned from execution');
        let tableRows = [];
        let maxAlbumID = -1;
        let maxPrice = 0;
        let maxAlbumName = "";
        res.forEach(data => {
          maxAlbumID = data['album_id'];
          maxPrice = data['price'];
          maxAlbumName = data['album_name'];
        })


        let sqlStmt2 = 'SELECT C.`cust_id`, D.`cust_name`, SUM(C.`quantity_purchased`) as `Units Purchased` FROM `_ORDER` AS C, `CUSTOMER` AS D WHERE D.`cust_id` = C.`cust_id` AND C.`album_id` = ' + "'" + maxAlbumID + "'" + ' GROUP BY C.`cust_id`';
        console.log(sqlStmt2);
        let queryResults = sqlQuery(sqlStmt2, res2 => {
          console.log('Returned from execution');
          res2.forEach(rowData => {
            tableRows.push({
              cust_id: rowData['cust_id'],
              cust_name: rowData['cust_name'],
              "Units Purchased": rowData['Units Purchased'],
            });
          })

          results['rows'] = tableRows;
          results['maxAlbumID'] = maxAlbumID;
          results['maxAlbumName'] = maxAlbumName;
          results['maxPrice'] = maxPrice;
          results['numPeople'] = res2.length;

          socket.emit('query', JSON.stringify(results));

        });
      });



    } else if (packet['query'] == 5) {
      console.log(packet['inputs']);

      let results = {
        headers: ['date_of_release', 'Releases'],
        rows: []
      };

      let qDate = packet['inputs']['Date'];

      let sqlStmt = 'SELECT `date_of_release`,COUNT(*) AS "Releases" FROM `ALBUM` GROUP BY `date_of_release` HAVING `date_of_release` > ' + '\'' + qDate + '\'' + ' ORDER BY COUNT(*) DESC';
      let queryResults = sqlQuery(sqlStmt, res => {
        let tableRows = [];
        let numReleases = 0;
        res.forEach(data => {
          tableRows.push({
            date_of_release: data['date_of_release'],
            Releases: data['Releases'],
          });
          numReleases = numReleases + data['Releases'];
        })

        results['rows'] = tableRows;
        results['numReleases'] = numReleases;
        socket.emit('query', JSON.stringify(results));

      });

    } else if (packet['query'] == 6) { //REMAINING
      let sqlStmt = 'SELECT `order_id`,SUM(`price`*`quantity_purchased`) as "Total Price" FROM ((SELECT T.`album_id`,T.`price` FROM `ALBUM` as T) as A INNER JOIN (SELECT O.`order_id`,O.`album_id`,O.`quantity_purchased` FROM `_ORDER` as O WHERE O.`date_of_purchase` > '+packet['inputs']['Date']+') as U ON U.`album_id` = A.`album_id` ) GROUP BY `order_id` ORDER BY  SUM(`price`*`quantity_purchased`)  DESC LIMIT 1';

      let results = {
        headers: ['order_id', 'Total Price'],
        rows: []
      };

      let queryResults = sqlQuery(sqlStmt, res => {
        let tableRows = [];
        res.forEach(data => {
          tableRows.push({
            order_id: data['order_id'],
            'Total Price': data['Total Price'],
          });
        })

        results['rows'] = tableRows;
        socket.emit('query', JSON.stringify(results));

      });



    } else if (packet['query'] == 7) {
      let results = {
        headers: ['album_id', 'album_name', 'Units Sold', 'Revenue'],
        rows: []
      };

      let sqlStmt = 'SELECT A.`album_id`,B.`album_name`,SUM(A.`quantity_purchased`) AS "Units Sold", SUM(A.`quantity_purchased`)*B.`price` AS "Revenue" FROM `_ORDER` as A,`ALBUM` as B WHERE A.`album_id` = ' + "'" + packet['inputs']['Album_id'] + "'" + ' and A.`album_id` = B.`album_id` GROUP BY A.`album_id`'
      let queryResults = sqlQuery(sqlStmt, res => {
        let tableRows = [];
        res.forEach(data => {
          tableRows.push({
            album_id: data['album_id'],
            album_name: data['album_name'],
            "Units Sold": data['Units Sold'],
            "Revenue": data['Revenue'],
          });
        })

        results['rows'] = tableRows;
        socket.emit('query', JSON.stringify(results));

      });



    } else if (packet['query'] == 8) {
      let results = {
        headers: ['album_id', 'album_name', 'Units Purchased', 'Expenditure'],
        rows: []
      };

      let sqlStmt = 'SELECT A.`album_id`,B.`album_name`,SUM(A.`quantity_purchased`) as "Units Purchased", SUM(A.`quantity_purchased`)*B.price as "Expenditure" FROM `_ORDER` as A, `ALBUM` AS B WHERE A.`cust_id`=' + "'" + packet['inputs']['Customer_id'] + "'" + ' AND A.`album_id` = B.`album_id` GROUP BY A.`album_id`';
      let queryResults = sqlQuery(sqlStmt, res => {
        let tableRows = [];
        let totalExpenditure = 0;
        let totalUnits = 0;
        res.forEach(data => {
          tableRows.push({
            album_id: data['album_id'],
            album_name: data['album_name'],
            "Units Purchased": data['Units Purchased'],
            "Expenditure": data['Expenditure'],
          });
          totalExpenditure = totalExpenditure + data['Expenditure'];
          totalUnits = totalUnits + data['Units Purchased'];
        })

        /*tableRows.push({
          album_id:"-",
          album_name:"-",
          "Units Purchased": totalUnits,
          "Expenditure": totalExpenditure,
        })*/


        results['totalExpenditure'] = totalExpenditure;
        results['rows'] = tableRows;
        socket.emit('query', JSON.stringify(results));

      });


    } else if (packet['query'] == 9) {
      let results = {
        headers: ['album_id', 'album_name', 'inventory_count'],
        rows: []
      };


      let sqlStmt = "SELECT `album_id`,`album_name`,`inventory_count` FROM `ALBUM` WHERE `inventory_count` < " + "'" + packet['inputs']['stock_recount_value'] + "'";
      console.log(sqlStmt);
      let queryResults = sqlQuery(sqlStmt, res => {
        console.log('Returned from execution');
        let tableRows = [];
        res.forEach(data => {
          tableRows.push({
            album_id: data['album_id'],
            album_name: data['album_name'],
            inventory_count: data['inventory_count'],
          });
        })

        results['rows'] = tableRows;
        socket.emit('query', JSON.stringify(results));

      });

    }
  })

})

server.listen(8000, () => console.log('Listening...'))
