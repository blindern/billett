<?php

$user = Auth::check() ? Auth::user() : null;
if (!isset($response_data)) $response_data = null;

$is_dev = (bool)\Config::get('app.dev');

?>
<!doctype html>
<html lang="nb" prefix="og: http://ogp.me/ns#" ng-app="billett" ng-controller="PageController">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{meta.description}}">
    <meta name="author" content="UKA på Blindern">
    <base href="<?=app('request')->getBaseUrl();?>/">
    <meta name="fragment" content="!">
    <meta name="csrf-token" content="<?=csrf_token();?>">

    <meta property="og:title" content="{{meta.title||'UKA på Blindern'}}">
    <meta property="og:type" content="{{meta.ogType||'website'}}">
    <meta property="og:image" content="{{meta.ogImage||meta.image||'assets/graphics/uka_gul_pikto.gif'}}">
    <meta property="og:url" content="{{meta.url}}" ng-if="meta.url">
    <meta property="og:description" content="{{meta.ogDescription||meta.description}}" ng-if="meta.ogDescription||meta.description">
    <meta property="og:site_name" content="UKA på Blindern">
    <meta property="og:locale" content="nb_NO">
    <meta property="fb:admins" content="707840346">
    <meta property="fb:app_id" content="109019109266369" />

    <link rel="icon" type="image/x-icon" href="favicon.ico">

    <title ng-bind="meta.title">UKA på Blindern</title>

    <link href="assets/stylesheets/frontend.css" rel="stylesheet">
    <script src="assets/javascript/frontend.js"></script>
    <script src="assets/templates.js"></script>
    <?php if ($user): ?>
    <script src="assets/templates-admin.js"></script>
    <?php endif; ?>

    <script type="text/javascript">
    var logged_in = <?php echo json_encode((bool) $user); ?>;
    var user_roles = <?php echo json_encode(\Auth::getRoles()); ?>;
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
            <h3 class="navbar-left">
                <a href="http://blindernuka.no" class="text-muted">
                    <img src="assets/graphics/uka_gul_pikto.gif" alt="">UKA på Blindern
                </a>
            </h3>
            <ul class="nav nav-pills navbar-right">
                <li ng-class="{ active: isActive('/', '/eventgroup/', '/event/') }"><a href="."><span class="glyphicon glyphicon-list"></span> Arrangementer</a></li>
                <li ng-class="{ active: isActive('/salgsbetingelser') }"><a href="salgsbetingelser"><span class="glyphicon glyphicon-flash"></span> Salgsbetingelser</a></li>
                <li ng-class="{ active: isActive('/hjelp') }"><a href="hjelp"><span class="glyphicon glyphicon-question-sign"></span> Hjelp</a></li>
            </ul>
        </header>

        <?php if (\Auth::check() && !\Auth::hasRole('billett.admin')): ?>
        <p class="text-center"><b>NB!</b> Du er innlogget som <u><?=htmlspecialchars($user->realname);?></u> men har ikke tilgang til dette systemet. <a href="logout" target="_self">Logg ut</a></p>
        <hr>
        <?php endif; ?>

        <div ng-show="!loading" ng-if="!page404" ng-view class="main-view"></div>
        <div ng-if="loading" class="page-loading">
            Laster innhold...
        </div>
        <div ng-if="page404">
            <page-not-found></page-not-found>
        </div>

        <footer>
            <ul>
                <li>2014</li>
                <li><a href="http://blindernuka.no">UKA på Blindern</a></li>
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
