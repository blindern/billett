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

	<div class="container">
		<header class="header" ng-controller="HeaderController">
			<ul class="nav nav-pills pull-right">
				<li ng-class="{ active: isActive('/') }"><a href="/">Arrangementer</a></li>
				<li ng-class="{ active: isActive('/salgsbetingelser') }"><a href="salgsbetingelser">Salgsbetingelser</a></li>
				<li ng-class="{ active: isActive('/om') }"><a href="om">Om billettsystemet</a></li>
				<li ng-class="{ active: isActive('/kontakt') }"><a href="kontakt">Kontakt</a></li>
			</ul>
			<h3 class="text-muted"><a href="http://blindernuka.no">UKA på Blindern</a></h3>
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
