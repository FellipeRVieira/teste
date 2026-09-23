<?php
require_once __DIR__ . '/includes/auth.php';
forj3d_logout();
header('Location: login.php');
exit;
