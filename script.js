const clientId = "efb2cb7a-c639-4dc2-93db-f85ff21273bf"
const tokenUrl = "https://login.microsoftonline.com/9431e0b9-00a8-40f7-a077-5f0920325f6c/oauth2/v2.0/token";
const authority = "https://login.microsoftonline.com/9431e0b9-00a8-40f7-a077-5f0920325f6c/";
var authtokenfound = "";
var loggedinuser = "";

const sendusers = ["n/a", "djohnson", "djohnson", "elangton", 
                  "smumford", "smumford", "shigh", "aharrison", 
                  "jmeenaghan", "thart", "thart", "ctemprell", 
                  "kduller", "kduller", "kduller", "djohnson", 
                  "jmeenaghan", "jmeenaghan", "tscarborough", 
                  "jrandle", "tpringle", "tpringle", "ctemprell",
                  "shigh", "shigh", "ibrooks", "jbrunt", "ibrooks",
                  "hgunby", "ibrooks", "tpringle", "hgunby", "jbrunt",
                  "hgunby", "jbrunt", "tpringle", "tpringle", "tpringle",
                  "hgunby", "hgunby", "speacock", "speacock", "speacock",
                  "ibrooks", "lsteptoe", "elangton", "lsteptoe", "lsteptoe",
                  "lsteptoe", "lsteptoe", "jbrunt", "jbrunt", "hgunby", "staylor"];

var currentcart = [];
var carttotal = 0;
var processed;
let myHTMLList;

const msalConfig = {
    auth: {
      clientId: clientId,
      authority: authority,
    }
  };

const msalInstance = new msal.PublicClientApplication(msalConfig);


//============== BACKEND FUNCTIONS ==============

async function sendMail(x, y){
  console.log(x);

  try{
      const requestBody = JSON.stringify({
          message: {
            subject: "Stationery Order",
            body: {
              contentType: "Text",
              content: x
            },
            toRecipients: [
              {
                emailAddress: {
                  address: "tteven@grantham.ac.uk"
                }
              }
            ],
            ccRecipients: [
              {
                emailAddress: {
                  address: sendusers[y] + "@grantham.ac.uk"
                }
              }
            ]
          },
          saveToSentItems: "true"
        });
      
      // Create the XHR object
      const xhr = new XMLHttpRequest();
  
      // Open the request to the /sendMail endpoint
      xhr.open("POST", "https://graph.microsoft.com/v1.0/me/sendMail", true);
  
      // Set the request headers
      xhr.setRequestHeader("Authorization", "Bearer " + authtokenfound);
      xhr.setRequestHeader("Content-Type", "application/json");
  
      // Send the request
      xhr.send(requestBody);
  
      // Handle the response
      xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 201) {
              console.log("Email sent successfully");
          }
          else {
              console.error("Error sending email:", xhr.responseText);
          }
          }
      };
  
      } 
      catch(error) {
          console.log(error);
      }
}


async function login(){

    const loginRequest = { scopes: ["https://graph.microsoft.com/.default"] };

    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        const accessToken = loginResponse.accessToken;
        var test = "";

        authtokenfound = accessToken;
        document.getElementById('loginbox').remove();
        document.getElementById('mainsite').style.display = "flex";
        document.getElementById('sitebody').style.backgroundImage = "url(res/Collegeblurred.bmp)"

        //await for the promise to be completed before displaying
        /*
        fetchusername(accessToken).then(displayName => {
          document.getElementById('loginnoti').textContent = `Hi, ${displayName}!`;
        });
        */
        
        } catch (error) {
            console.error(error);
            document.getElementById('loginnoti').textContent = "failed :(";
            alert("Log-in failed. Error code: " + error);
        }
}

async function fetchusername(token) {
  // Make the API request and wait
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // wait again for the response and extract the name
  const data = await response.json();
  const displayName = data.displayName;

  // Return the display name as a string
  return displayName;
}

function getRowData(event) {

  var rowData = [];
  var cells = event.target.parentElement.cells;
  
  for (var i = 0; i < cells.length; i++) {
    rowData.push(cells[i].textContent);
  }

  console.log(rowData);
  currentcart.push(rowData);

  processArray(currentcart);
  
}

function processArray(array) {
  let total = 0;
  let processed = "Hello, I would like to order some stationery:\n";

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const str = `${item[0]} ${item[1]} £${item[2]}`;
    processed += `\n${str}\n`;
    total += parseFloat(item[2]);
  }

  processed += "\n\nTotal cost: £" + total.toFixed(2);

  updateHTMLTable(array, total);
  console.log(processed);

}

document.getElementById("sendBtn").addEventListener("click", function(){

  //console.log(sendusers[window.parent.document.getElementById('depmenu').selectedIndex]);

  var x = window.parent.document.getElementById('totaloutput').textContent;
  console.log(x)
  if (window.parent.document.getElementById('depmenu').selectedIndex != 0 && x > 0){
    sendMail("Department: " + window.parent.document.getElementById('depmenu').value + "\n\n" +  window.parent.document.getElementById('dataoutput').textContent, window.parent.document.getElementById('depmenu').selectedIndex);
  }
  else{
    alert("Error sending email. Did you send an empty cart, or not select a department?");
  }

});

// Function to create or update the HTML list
function updateHTMLTable(arr, total) {
  // If the HTML list element hasn't been created yet, create it
  if (!myHTMLList) {
    myHTMLList = createHTMLTable(arr, total);
    window.parent.document.getElementById('cartdiv').appendChild(myHTMLList);
    console.log("success")
  } else {
    // If the HTML list element already exists, update it with the new array
    let newHTMLList = createHTMLTable(arr, total);
    myHTMLList.parentNode.replaceChild(newHTMLList, myHTMLList);
    myHTMLList = newHTMLList;
  }
}

function createHTMLTable(arr, total) {
  
  let table = document.createElement('table');
  table.setAttribute('id', 'cart');

  // Create the table header
  let thead = document.createElement('thead');
  let headerRow = document.createElement('tr');
  let headers = ['Item Code', 'Description', 'Price', 'Quantity', 'Total (£)', 'Add/Remove'];
  for (let i = 0; i < headers.length; i++) {
    let header = document.createElement('th');
    header.textContent = headers[i];
    headerRow.appendChild(header);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create the table body
  let tbody = document.createElement('tbody');
  let items = {};
  let grandTotal = 0;
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    let itemCode = item[0];
    let description = item[1];
    let price = item[2];
    let quantity = 1;
    let total = price;

    if (items[itemCode]) {
      quantity = items[itemCode][3] + 1;
      total = price * quantity;
      items[itemCode][3] = quantity;
      items[itemCode][4] = total;
    } else {
      items[itemCode] = [itemCode, description, price, quantity, total];
    }
    grandTotal += total;
  }

  for (let itemCode in items) {
    let item = items[itemCode];
    let row = document.createElement('tr');
    let itemCodeCell = document.createElement('td');
    itemCodeCell.textContent = item[0];
    row.appendChild(itemCodeCell);
    let descriptionCell = document.createElement('td');
    descriptionCell.textContent = item[1];
    row.appendChild(descriptionCell);
    let priceCell = document.createElement('td');
    priceCell.textContent = item[2];
    row.appendChild(priceCell);
    let quantityCell = document.createElement('td');
    quantityCell.textContent = item[3];
    row.appendChild(quantityCell);
    let totalCell = document.createElement('td');
    totalCell.textContent = Number(item[4]).toFixed(2);
    row.appendChild(totalCell);

    let buttonCell = document.createElement('td');
    let addButton = document.createElement('button');
    addButton.textContent = '+';

    addButton.addEventListener('click', function() {
      let quantity = parseInt(quantityCell.textContent);
      let price = parseFloat(priceCell.textContent);
      quantity += 1;
      totalCell.textContent = (price * quantity).toFixed(2);
      console.log(totalCell.textContent);
      quantityCell.textContent = quantity;
      currentcart.push([itemCode, descriptionCell.textContent, price.toString()]);
      processArray(arr);
    });

    let removeButton = document.createElement('button');
    removeButton.textContent = '-';
    removeButton.addEventListener('click', function() {
      let quantity = parseInt(quantityCell.textContent);
      let price = parseFloat(priceCell.textContent);
      if (1==1) {
        quantity -= 1;
        totalCell.textContent = (price * quantity).toFixed(2);
        quantityCell.textContent = quantity;
        removeMatchingArray(currentcart, [itemCode, descriptionCell.textContent, price.toString()]);
        processArray(arr);
      }
    });
    buttonCell.appendChild(addButton);
    buttonCell.appendChild(removeButton);
    row.appendChild(buttonCell);

    tbody.appendChild(row);
  }

  // Create the grand total row
  let grandTotalRow = document.createElement('tr');
  grandTotalRow.classList.add('grand-total');
  let grandTotalCell = document.createElement('td');
  grandTotalCell.setAttribute('colspan', '5');
  grandTotalCell.textContent = 'Grand Total:';
  grandTotalRow.appendChild(grandTotalCell);
  let grandTotalValueCell = document.createElement('td');
  grandTotalValueCell.textContent = total.toFixed(2);
  grandTotalRow.appendChild(grandTotalValueCell);

  tbody.appendChild(grandTotalRow);
  table.appendChild(tbody);

  window.parent.document.getElementById('dataoutput').textContent = tableToString(table);
  window.parent.document.getElementById('totaloutput').textContent = total;

  return table;
}

function tableToString(table) {
  const rows = table.rows;
  let total = 0;
  let str = '';
  for (let i = 1; i < rows.length - 1; i++) {
    let cells = rows[i].cells;
    let quantity = cells[3].textContent.trim();
    let description = cells[1].textContent.trim();
    let itemCode = cells[0].textContent.trim();
    let price = parseFloat(cells[2].textContent.trim());
    let subtotal = parseFloat(cells[4].textContent.trim());
    total += subtotal;
    let rowStr = quantity + ' x ' + description + ' (' + itemCode + '): £' + subtotal.toFixed(2);
    str += rowStr + '\n';
  }
  str += '\n\nGrand total: £' + total.toFixed(2);
  return str;
}

function removeMatchingArray(arr, match) {
  for (let i = 0; i < arr.length; i++) {
    let currentArray = arr[i];
    let matchFound = true;
    for (let j = 0; j < currentArray.length; j++) {
      if (currentArray[j] !== match[j]) {
        matchFound = false;
        break;
      }
    }
    if (matchFound) {
      arr.splice(i, 1);
      break;
    }
  }
}

//============== FRONTEND FUNCTIONS ==============



















