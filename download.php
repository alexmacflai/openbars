<?php
// Check if the 'folder' GET parameter is set
if (!isset($_GET['folder'])) {
    exit('No folder specified.');
}

// Sanitize the folder input to prevent directory traversal vulnerabilities
$folder = basename($_GET['folder']);

// Assuming the folder name format is "YYYYMMDD"
$year = substr($folder, 0, 4);

// Construct the full path to the folder
$fullPath = __DIR__ . '/projects/' . $year . '/' . $folder;

// Check if the folder exists and is a directory
if (!file_exists($fullPath) || !is_dir($fullPath)) {
    exit("The folder does not exist or is not a directory: " . htmlspecialchars($fullPath));
}

// Create a ZIP file from the folder
$zip = new ZipArchive();
$zipFileName = tempnam(sys_get_temp_dir(), 'zip') . '.zip';  // Create a temp file for the zip

if ($zip->open($zipFileName, ZipArchive::CREATE) !== TRUE) {
    exit("Cannot create a zip file: " . htmlspecialchars($zipFileName));
}

// Add the folder to the zip
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($fullPath, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($files as $file) {
    // Skip directories as they would be added automatically by the zip process
    if (!$file->isDir()) {
        // Get the relative path from the full path
        $relativePath = substr($file->getRealPath(), strlen($fullPath) + 1);
        $zip->addFile($file->getRealPath(), $relativePath);
    }
}

// Zip archive will be created only after closing object
$zip->close();

// Set headers to trigger the download
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . basename($folder) . '.zip"');
header('Content-Length: ' . filesize($zipFileName));

// Clean (erase) the output buffer and turn off output buffering
ob_end_clean();
// Flush system output buffer
flush();

// Read the file and send it to the user
readfile($zipFileName);

// Delete the zip file from the server
unlink($zipFileName);


?>
