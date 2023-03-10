<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="datastyle.css">
<script src="script.js"></script>
</head>
<body>

<div id=topbar>
</div>
<?php

// Connect to MySQL database
$servername = "localhost:3306";
$username = "root";
$password = "pass";
$dbname = "stationery";

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
    echo "<tr id='stationarydatarow' onclick='getRowData(event)'>";
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
<body>
</html>
