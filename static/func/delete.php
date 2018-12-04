<?php
     $toDelete= $_POST['filetodelete'];
     unlink("{$_SERVER['DOCUMENT_ROOT']}/var/www/userSites/{$toDelete}"); //Type userSiteID before delete
     die;
?>
