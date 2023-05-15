<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="datastyle.css">
<script src="script.js"></script>
<style>
</style>
</head>
<body>

<div id=topbar>
</div>
<input type="text" id="searchInput" onkeyup="filterTable()" placeholder="Search for items..">
<?php

// Connect to MySQL database
$servername = "localhost:3306";
$username = "redacted";
$password = "redacted";
$dbname = "Stationery";

$currentdb = 'items';


$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Run MySQL query
$sql = "SELECT * FROM $currentdb";
$result = $conn->query($sql);

// Display results in a table
if ($result->num_rows > 0) {
  echo "<table id='stationarystock'>";
  echo "<tr><th>Item ID</th><th>Product</th><th>Price (£)</th></tr>"; // Replace with your actual column names
  while ($row = $result->fetch_assoc()) {
    echo "<tr class='stationarydatarow' onclick='getRowData(event)'>";
    echo "<td>" . $row["ID"] . "</td>";
    echo "<td>" . $row["Item"] . "</td>";
    echo "<td>" . $row["Price"] . "</td>";
    echo "</tr>";
  }
  echo "</table>";
} else {
  echo "0 results";
}

// Close MySQL connection
$conn->close();
?>

<script>
  function filterTable() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("stationarystock");
    const trs = table.getElementsByClassName("stationarydatarow");

    for (let i = 0; i < trs.length; i++) {
      const tds = trs[i].getElementsByTagName("td");
      let foundMatch = false;

      for (let j = 0; j < tds.length; j++) {
        if (tds[j]) {
          const txtValue = tds[j].textContent || tds[j].innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            foundMatch = true;
            break;
          }
        }
      }

      if (foundMatch) {
        trs[i].style.display = "";
      } else {
        trs[i].style.display = "none";
      }
    }
  }
</script>

</body>
</html>
