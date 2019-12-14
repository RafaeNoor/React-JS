let e = React.createElement;
var socket = io();


let errorFail = -1;
let testFail = "";

//Validation functions
isNotNull = inp => {
  return inp != '' && inp != ' '
}
isNumeric = inp => {
  return !isNaN(inp);
}
isTextual = inp => {
  return /^[a-zA-Z' ']+$/.test(inp);
}
isLength15 = inp => {
  return inp.length <= 15
};
isLength25 = inp => {
  return inp.length <= 25
};
isLength40 = inp => {
  return inp.length <= 40
};
isDate = inp => {
  return (!isNaN(Date.parse(inp)));
}
isSingleChar = inp => {
  return inp.length <= 1
};
is10Char = inp => {
  return inp.length == 10
};

validationFunctions = [isNotNull, isNumeric, isTextual,
  isLength15, isLength25, isLength40,
  isDate, isSingleChar, is10Char
];
errorMessage = ["Entry can not be Null.", "Entry has to be Numeric", "Entry has to be textual",
  "Entry must have length <= 15.", "Entry must have length <= 25.", "Entry must have length <= 40",
  "Entry must be a date of format: YYYY-MM-DD .", "Entry must be a single character.", "Entry must have 10 characters/numbers ."
];

custValidation = {
  cust_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  cust_name: [1, 0, 1, 0, 0, 1, 0, 0, 0],
  date_of_birth: [0, 0, 0, 0, 0, 0, 1, 0, 0],
  gender: [1, 0, 1, 0, 0, 0, 0, 1, 0],
  phone_no: [1, 1, 0, 0, 0, 0, 0, 0, 1]
};
artistValidation = {
  artist_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  artist_name: [1, 0, 1, 0, 0, 1, 0, 0, 0],
  preferred_genre: [0, 0, 1, 0, 1, 0, 0, 0, 0],
  num_records: [1, 1, 0, 0, 0, 0, 0, 0, 0]
};
albumValidation = {
  album_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  album_name: [1, 0, 1, 0, 0, 1, 0, 0, 0],
  genre: [1, 0, 1, 1, 0, 0, 0, 0, 0],
  price: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  inventory_count: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  duration: [0, 1, 0, 0, 0, 0, 0, 0, 0],
  date_of_release: [0, 0, 0, 0, 0, 0, 1, 0, 0],
  artist_id: [1, 1, 0, 0, 0, 0, 0, 0, 0]
};
adminValidation = {
  admin_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  admin_name: [1, 0, 1, 0, 0, 1, 0, 0, 0],
  start_date: [1, 0, 0, 0, 0, 0, 1, 0, 0],
  access_level: [1, 0, 1, 0, 0, 0, 0, 1, 0]
};
orderValidation = {
  order_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  cust_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  album_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  admin_id: [1, 1, 0, 0, 0, 0, 0, 0, 0],
  date_of_purchase: [1, 0, 0, 0, 0, 0, 1, 0, 0],
  quantity_purchased: [1, 1, 0, 0, 0, 0, 0, 0, 0]
}

totalValidation = [custValidation, artistValidation, albumValidation, adminValidation, orderValidation];

forms = ['Customer', 'Artist', 'Album', 'Admin', 'Order', 'Queries'];
customerFields = ['cust_id', 'cust_name', 'date_of_birth', 'gender', 'phone_no'];
artistFields = ['artist_id', 'artist_name', 'preferred_genre', 'num_records'];
albumFields = ['album_id', 'album_name', 'genre', 'price', 'inventory_count', 'duration', 'date_of_release', 'artist_id'];
adminFields = ['admin_id', 'admin_name', 'start_date', 'access_level'];
orderFields = ['order_id', 'cust_id', 'album_id', 'quantity_purchased', 'admin_id', 'date_of_purchase'];
manyFields = {
  Customer: ['phone_no'],
  Album: ['artist_id'],
  Order: ['album_id', 'quantity_purchased']
};
//queryFields = ['q1', 'q2', 'q3'];
queryDescriptions = ['Which album has the highest number of albums in stock?', 'Which artist has the most albums stocked at the store?',
  'Which album has the highest number of sales?', 'Which customer has the highest number of orders and which albums have they bought the most?',
  'Which album has the highest price and how many people have bought that album?', 'Given a date, how many albums, in stock, were released after that date?',
  'How many orders were processed post a given date and which of those orders had the highest price?', 'Given an album, what is the total revenue generated for that album?',
  'For a given customer, how much have they spent in the store?', 'Given a stock recount value, which albums need to be restocked?'
];
queryInputs = [{}, {}, {}, {}, {}, {
  Date: 'date'
}, {
  Date: 'date'
}, {
  Album_id: 'numeric'
}, {
  Customer_id: 'numeric'
}, {
  stock_recount_value: 'numeric'
}];
infoList = [customerFields, artistFields, albumFields, adminFields, orderFields, []];

let custDict = artistDict = albumDict = adminDict = orderDict = {};

custDict = {
  cust_id: "",
  cust_name: "",
  date_of_birth: "",
  gender: "",
  phone_no: []
};
artistDict = {
  artist_id: "",
  artist_name: "",
  preferred_genre: "",
  num_records: ""
};
albumDict = {
  album_id: "",
  album_name: "",
  genre: "",
  price: "",
  inventory_count: "",
  duration: "",
  date_of_release: "",
  artist_id: []
};
adminDict = {
  admin_id: "",
  admin_name: "",
  start_date: "",
  access_level: ""
};
orderDict = {
  order_id: "",
  cust_id: "",
  album_id: [],
  quantity_purchased: [],
  admin_id: "",
  date_of_purchase: ""
};

dictArr = [custDict, artistDict, albumDict, adminDict, orderDict];


updateArray = [];



socket.emit('msg', 'null');

//socket.emit('insert', JSON.stringify({tableName: "ARTIST",artist_id: "10", artist_name: "US",
//preferred_genre: 'rap', num_records: "20" }));
createMenuBtn = (name, fn) => {
  return (
    e('button', {
      onClick: fn
    }, name)
  );
}
createFormRow = (field, dictIndex, orderIndex) => {
  return e("form", {
      style: {
        margin: '0 auto',
        width: '150px'
      }
    },
    e("label", null, field,
      e("input", {
        type: "text",
        name: "name",
        onChange: function(evt) {
          //console.log('Updating value for '+field+": "+evt.target.value);
          dictArr[dictIndex][field] = evt.target.value;
        }
      }), e("input", {
        type: "checkbox",
        name: "name1",
        onClick: function(evt) {
          console.log(`${field}:${evt.target.checked}`);
          updateArray[infoList[dictIndex].indexOf(field)] = evt.target.checked;

        }
      })
    ),
  );
}


createFormRowMany = (field, dictIndex, arrIndex) => {
  if (arrIndex != 0) {
    return e("form", {
        style: {
          margin: '0 auto',
          width: '150px'
        }
      },
      e("label", null, field,
        e("input", {
          type: "text",
          name: "name",
          onChange: function(evt) {
            if (dictArr[dictIndex][field].length < arrIndex + 1) {
              let copy = dictArr[dictIndex][field];
              copy.push(evt.target.value);
              dictArr[dictIndex][field] = copy;
            } else {
              dictArr[dictIndex][field][arrIndex] = evt.target.value;
            }
          }
        })
      ),
    );
  } else {
    return e("form", {
        style: {
          margin: '0 auto',
          width: '150px'
        }
      },
      e("label", null, field,
        e("input", {
          type: "text",
          name: "name",
          onChange: function(evt) {
            if (dictArr[dictIndex][field].length < arrIndex + 1) {
              let copy = dictArr[dictIndex][field];
              copy.push(evt.target.value);
              dictArr[dictIndex][field] = copy;
            } else {
              dictArr[dictIndex][field][arrIndex] = evt.target.value;
            }
          }
        }), e("input", {
          type: "checkbox",
          name: "name1",
          onClick: function(evt) {
            console.log(`${field}:${evt.target.checked}`);
            updateArray[infoList[dictIndex].indexOf(field)] = evt.target.checked;
          }
        })
      ),
    );

  }
}

let q5Dict = {};
let q6Dict = {};
let q7Dict = {};
let q8Dict = {};
let q9Dict = {};

let queryDict = {
  5: q5Dict,
  6: q6Dict,
  7: q7Dict,
  8: q8Dict,
  9: q9Dict
};



createQuery = (queryIndex) => {
  let inputs = queryInputs[queryIndex];

  let inputLs = [];
  inputLs.push(e('text', null, queryDescriptions[queryIndex]));

  let inputText = [];

  for (let key in inputs) {
    inputText.push(key);
    inputLs.push(e("form", {
      style: {
        margin: '0 auto',
        width: '150px'
      }
    }, e("label", null, key, e("input", {
      type: "text",
      name: key,
      onChange: function(evt) {
        console.log(`Editing state for Q${queryIndex} on ${key}`);
        queryDict[queryIndex.toString()][key] = evt.target.value;

      }
    }))))

  }

  inputLs.push(e("button", {
    onClick: function(evt) {
      console.log(`Pressed execute for Q${queryIndex}`);
      socket.emit('query', JSON.stringify({
        query: queryIndex,
        inputs: queryDict[queryIndex.toString()]
      }));

    }
  }, "Execute"));
  return e('div', null, inputLs);
}

class Screen extends React.Component {

  constructor(props) {
    super(props);
    console.log('Screen constructor invoked for ' + forms[props.i])
    let screenState = [];
    this.i = props.i;

    updateArray = Array(infoList[props.i].length).fill(false);
    //console.log(updateArray);

    this.dict = {};

    this.repeat = {};

    if (manyFields[forms[props.i]] != undefined) {
      manyFields[forms[props.i]].forEach(possible => {
        console.log('* ' + possible + ' can repeat for ' + forms[props.i]);
        this.repeat[possible] = 0;
      });
    }

    screenState.push(
      e('h1', {}, forms[props.i])
    );

    var self = this;

    if (props.i < 5) {

      infoList[props.i].forEach(field => {
        //screenState.push(createFormRow(field,props.i)) // modify create formrow to reflect changes in dictionary
        if (field in this.repeat) {
          screenState.push(createFormRowMany(field, props.i, this.repeat[field]));
          //this.repeat[field] = this.repeat[field] + 1;

          screenState.push(e('button', {
            onClick: function(evt) {
              this.repeat[field] = this.repeat[field] + 1;
              screenState.splice(screenState.length - 4, 0, createFormRowMany(field, props.i, this.repeat[field]));

              self.setState({
                display: screenState
              });
            }.bind(this)
          }, '+'));
        } else {
          screenState.push(createFormRow(field, props.i));
        }
      })


      screenState.push(e('button', {
        onClick: function(ev) {
          console.log('Invoked save');
          //Add save code
          console.log(dictArr[props.i]);
          let packet = Object.assign({}, dictArr[props.i]);

          if (this.validateInput(packet)) {
            console.log('Input is valid');
            packet['tableName'] = forms[props.i];
            socket.emit('insert', JSON.stringify(packet));
          } else {
            this.handleError();
          }

        }.bind(this)
      }, 'Save'))


      screenState.push(e('button', {
        onClick: function(ev) {
          console.log('Invoked Delete');
          //Add delete code
          let packet = {};
          packet = Object.assign({}, dictArr[props.i]);
          packet['tableName'] = forms[props.i];
          if (true) {
            socket.emit('delete', JSON.stringify(packet));
          }
        }
      }, 'Delete'))

      screenState.push(e('button', {
        onClick: function(ev) {
          console.log('Invoked update');
          console.log('updateArray', updateArray);

          let truthObj = {};

          infoList[props.i].forEach((val, index) => {
            truthObj[val] = updateArray[index];
          })

          let packet = Object.assign(dictArr[props.i]);
          packet['tableName'] = forms[props.i];
          if (true) {
            packet['updateArray'] = truthObj;
            socket.emit('update', JSON.stringify(packet));
          }
          //Add update code
        }.bind(this)
      }, 'Update'))
    } else {

      queryDescriptions.forEach((desc, index) => {
        screenState.push(createQuery(index));
      });
    }

    screenState.push(e('button', {
      onClick: function(ev) {
        console.log('Invoked Home');
        updateArray = [];
        //dictArr[props.i] = defaultState[props.i];

        switch (props.i) {
          case 0:
            dictArr[props.i] = {
              cust_id: "",
              cust_name: "",
              date_of_birth: "",
              gender: "",
              phone_no: []
            };
            break;
          case 1:
            dictArr[props.i] = {
              artist_id: "",
              artist_name: "",
              preferred_genre: "",
              num_records: ""
            };
            break;
          case 2:
            dictArr[props.i] = {
              album_id: "",
              album_name: "",
              genre: "",
              price: "",
              inventory_count: "",
              duration: "",
              date_of_release: "",
              artist_id: []
            };
            break;
          case 3:
            dictArr[props.i] = {
              admin_id: "",
              admin_name: "",
              start_date: "",
              access_level: ""
            };
            break;
          case 4:
            dictArr[props.i] = {
              order_id: "",
              cust_id: "",
              album_id: [],
              quantity_purchased: [],
              admin_id: "",
              date_of_purchase: ""
            };
            break;
          default:
            break;
        }
        props.homeFn();

        for (let i = 5; i < 10; i++) {
          queryDict[i.toString()] = {};
        }
      }
    }, 'Home'))




    this.validateInput = this.validateInput.bind(this);
    this.handleError = this.handleError.bind(this);
    this.state = {
      display: screenState
    };
  }

  render() {
    return e(
      'div', {
        style: {
          textAlign: 'center'
        }
      },
      this.state.display
    );
  }

  validateInput(object) {
    console.log('Validate input invoked');
    let validCheck = totalValidation[this.i]; // gets JSON of validation functions
    let validInput = true;
    let fname = forms[this.i];
    let isMany = false;
    let myMany = [];
    console.log(validCheck);

    if (manyFields[fname] != undefined) {
      isMany = true;
      myMany = manyFields[fname];
    }
    for (let key in object) {
      console.log(`Checking ${key}`)
      for (let index = 0; index < 9; index++) {
        let isCheck = validCheck[key][index];

        if (isCheck == 1 && !isMany && myMany.indexOf(key) == -1) {
          validInput = validInput && validationFunctions[index](object[key])
        } else if (isCheck == 1 && isMany) {
          if (myMany.indexOf(key) == -1) {
            validInput = validInput && validationFunctions[index](object[key]);

          } else {
            if (index == 1 && object[key].length < 1) {
              console.log(`validateInput failed for ${key} at index ${index}`);
              console.log(`${key} failed: ` + errorMessage[index]);
              validInput = false;
              errorFail = index;
              testFail = key;
              break;
            }

            object[key].forEach(entry => {
              validInput = validInput && validationFunctions[index](entry);
            });
          }

        }
        if (!validInput) {
          console.log(`validateInput failed for ${key} at index ${index}`);
          console.log(`${key} failed: ` + errorMessage[index]);
          errorFail = index;
          testFail = key;
          break;
        }
      }
      if (!validInput) {
        break;
      }

    }
    console.log(`validate input returning with ${validInput}`)
    return validInput;

  }
  handleError() {
    let curState = this.state.display;
    curState.push(e(
      'div', null, e('text', null, `${[testFail]}: ${errorMessage[errorFail]}`)
    ));
    this.setState({
      display: curState,
    });
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    let mainMenu = [];
    mainMenu.push(
      e('h1', null, 'Music Inventory System')
    )
    forms.forEach((form, index) => {
      mainMenu.push(createMenuBtn(form, function() {
        this.handleClick(index)
      }.bind(this)))
    })


    this.state = {
      screen: mainMenu
    };
    this.handleClick = this.handleClick.bind(this);
    this.displayResults = this.displayResults.bind(this);
    this.displayReturn = this.displayReturn.bind(this);

    renderResults = this.displayResults;
    renderResults = renderResults.bind(this);

    renderReturn = this.displayReturn;
    renderReturn = renderReturn.bind(this);

  }
  render() {
    return e('div', {
      style: {
        textAlign: 'center'
      }
    }, this.state.screen);
  }

  handleClick(i) {
    let prevForm = this.state.screen;
    let backFn = () => this.setState({
      screen: prevForm
    });

    console.log('Pressed ' + forms[i]);
    this.setState({
      screen: e(Screen, {
        i: i,
        homeFn: backFn,
      }, null) //tempForm
    })
  }
  displayResults(packet) {
    console.log('Invoked displayResults');
    let currentScreen = this.state.screen;
    let obj = packet;

    let backFn = () => this.setState({
      screen: currentScreen
    });

    let myTable = e('div', null, e(TableComponent, {
      data: obj
    }), e('button', {
      onClick: function(evt) {
        backFn();
      }
    }, 'Home'));

    let newScreen = myTable; //e('div', {}, currentScreen, myTable);



    if (obj['numReleases'] != undefined) {
      let modified = e('text', null, `Total number of albums released after date: ${obj['numReleases']}`);
      this.setState({
        screen: e('div', null, newScreen, modified)
      });

    } else if (obj['myCust'] != undefined) {
      let modified = e('text', null, `cust_id: ${obj['myCust']} has purchased the highest number of orders with #: ${obj['numOrders']}`);
      this.setState({
        screen: e('div', null, newScreen, modified)
      });
    } else if (obj['totalExpenditure'] != undefined) {
      let modified = e('text', null, `customer has  made a total expenditure of $${obj['totalExpenditure']}`);
      this.setState({
        screen: e('div', null, newScreen, modified)
      });
    } else if (obj['maxAlbumID'] != undefined) {
      let modified = e('text', null, `album_id: ${obj['maxAlbumID']}, ${obj['maxAlbumName']} has the highest price of $${obj['maxPrice']} with ${obj['numPeople']} having purchased atleast 1 copy`);
      this.setState({
        screen: e('div', null, newScreen, modified)
      });

    } else {
      this.setState({
        screen: newScreen
      });
    }



  }
  displayReturn(packet) {
    let oldScreen = this.state.screen;
    this.setState({
      screen: e('div', null, oldScreen,
        e('text', null, packet['message'])),
    })

  }
}

let myApp = e(App, {}, null);

//global function which gets updated to app classes render.
let renderResults = (inp) => {

} // empty function

let renderReturn = inp => {

}

socket.on('query', data => {
  console.log("Query result returned")
  renderResults(JSON.parse(data));
})

socket.on('return', data => {
  let obj = JSON.parse(data);
  renderReturn(obj);
})


var TableComponent = React.createClass({
  displayName: "TableComponent",
  render: function render() {
    // Data
    var dataColumns = this.props.data.headers;
    var dataRows = this.props.data.rows;

    var tableHeaders = e("thead", null,
      e("tr", null,
        dataColumns.map(function(column) {
          return e("th", null, column);
        })));



    var tableBody = dataRows.map(function(row) {
      return (
        e("tr", null,
          dataColumns.map(function(column) {
            return e("td", null, row[column]);
          })));
    });

    // Decorate with Bootstrap CSS
    return e("table", {
        //className: "table table-bordered table-hover",
        style: {
          width: "100%",
          border: '2px solid black',
        }
      },
      tableHeaders,
      tableBody);
  }
});

ReactDOM.render(
  myApp,
  document.getElementById('root')
);
