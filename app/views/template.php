<?php

$user = Auth::check() ? Auth::user() : null;

?>
<!doctype html>
<html lang="nb" ng-app="billett">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">
	<base href="/">

	<title ng-bind="title">UKA på Blindern</title>

	<link href="assets/stylesheets/frontend.css" rel="stylesheet">
	<script src="assets/javascript/frontend.js"></script>

	<script type="text/javascript">
	var logged_in = <?php echo json_encode((bool) $user); ?>;
	</script>

	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
</head>
<body>
	<h1 ng-bind="title">UKA på Blindern</h1>
	<div ng-view></div>
</body>
</html>
