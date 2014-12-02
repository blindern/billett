<?php

$user = Auth::check() ? Auth::user() : null;
if (!isset($response_data)) $response_data = null;

?>
<!doctype html>
<html lang="nb" ng-app="billett" ng-controller="PageController">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">
	<base href="<?=app('request')->getBaseUrl();?>/">

	<link rel="icon" type="image/x-icon" href="favicon.ico">

	<title ng-bind="title">UKA på Blindern</title>

	<link href="assets/stylesheets/frontend.css" rel="stylesheet">
	<script src="assets/javascript/frontend.js"></script>

	<script type="text/javascript">
	var logged_in = <?php echo json_encode((bool) $user); ?>;
	var response_data = <?php echo json_encode($response_data); ?>;
	</script>

	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
</head>
<body>

	<div class="container" ng-class="{noadmin:!isAdminPage()}">
		<header class="header navbar" ng-controller="HeaderController">
			<h3 class="navbar-left"><a href="http://blindernuka.no" class="text-muted">UKA på Blindern</a></h3>
			<ul class="nav nav-pills navbar-right">
				<li ng-class="{ active: isActive('/', '/eventgroup/', '/event/') }"><a href="/">Arrangementer</a></li>
				<li ng-class="{ active: isActive('/salgsbetingelser') }"><a href="salgsbetingelser">Salgsbetingelser</a></li>
				<li ng-class="{ active: isActive('/om') }"><a href="om">Om billettsystemet</a></li>
				<li ng-class="{ active: isActive('/kontakt') }"><a href="kontakt">Kontakt</a></li>
			</ul>
		</header>

		<div ng-view class="main-view"></div>

		<footer class="footer">
			<p>
				<span>2014</span>
				<span><a href="http://blindernka.no">UKA på Blindern</a></span>
				<span><a href="http://foreningenbs.no">Foreningen Blindern Studenterhjem</a></span>
			</p>
		</footer>

	</div>


</body>
</html>
