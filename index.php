<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Open bars</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header>
  <h1>Open bars</h1>
  <p>This is a project to share music, freely. Explain license here or the footer.</p>
</header>
<div id="file-list">
  <?php
    include 'list_files.php';
    listFolderFiles("projects"); // Adjust this to the correct relative path
  ?>
</div>
</body>
</html>
