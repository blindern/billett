<?php

$user = Auth::check() ? Auth::user() : null;
if (!isset($response_data)) $response_data = null;

$is_dev = (bool)\Config::get('app.dev');

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
	var user = <?php echo json_encode($user); ?>;
	var response_data = <?php echo json_encode($response_data); ?>;
	var is_dev = <?php echo json_encode($is_dev); ?>;
	</script>

	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
</head>
<body ng-class="{'dev-page': isDevPage}">
	<ng-toast></ng-toast>

	<?php if ($is_dev): ?>
	<div class="dev-page-bar">NB! Du er nå på utviklersia! <span>Endringene her blir ikke oppdatert på blindernuka.no.</span></div>
	<?php endif; ?>

	<div class="container" ng-class="{noadmin:!isAdminPage()}">
		<header class="header navbar" ng-controller="HeaderController">
			<h3 class="navbar-left"><a href="http://blindernuka.no" class="text-muted">UKA på Blindern</a></h3>
			<ul class="nav nav-pills navbar-right">
				<li ng-class="{ active: isActive('/', '/eventgroup/', '/event/') }"><a href=".">Arrangementer</a></li>
				<li ng-class="{ active: isActive('/salgsbetingelser') }"><a href="salgsbetingelser">Salgsbetingelser</a></li>
				<li ng-class="{ active: isActive('/hjelp') }"><a href="hjelp">Hjelp</a></li>
			</ul>
		</header>

		<div ng-show="!loading" ng-view class="main-view"></div>
		<div ng-show="loading" class="page-loading">
			Laster innhold...
		</div>

		<footer>
			<ul>
				<li>2014</li>
				<li><a href="http://blindernka.no">UKA på Blindern</a></li>
				<li><a href="http://foreningenbs.no">Foreningen Blindern Studenterhjem</a></li>
				<li>
					<a href="a">Administrasjon</a>
					<?php if (Auth::check()): ?>
						<br>
						<?=htmlspecialchars(Auth::user()->username);?>
						<br>
						<a href="logout">[logg ut]</a>
					<?php endif; ?>
				</li>
			</ul>
		</footer>

	</div>


</body>
</html>
