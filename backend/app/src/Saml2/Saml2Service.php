<?php

namespace Blindern\UKA\Saml2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use OneLogin\Saml2\Auth as OneLoginAuth;
use OneLogin\Saml2\Utils as OneLoginUtils;

class Saml2Service
{
    /**
     * @var OneLoginAuth
     */
    public $saml;

    public function __construct()
    {
        OneLoginUtils::setProxyVars(true);

        $isDev = getenv('DEV_SSO') !== false;
        $prefix = $isDev ? 'http://localhost:8888' : 'https://foreningenbs.no';

        $this->saml = new OneLoginAuth([
            'strict' => true,
            'sp' => [
                'entityId' => URL::route('saml2.metadata'),
                'NameIDFormat' => 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
                'assertionConsumerService' => [
                    'url' => URL::route('saml2.acs'),
                ],
                'singleLogoutService' => [
                    'url' => URL::route('saml2.sls'),
                ],
                'x509cert' => '',
                'privateKey' => '',
            ],
            'idp' => [
                'entityId' => $prefix.'/simplesaml/saml2/idp/metadata.php',
                'singleSignOnService' => [
                    'url' => $prefix.'/simplesaml/saml2/idp/SSOService.php',
                ],
                'singleLogoutService' => [
                    'url' => $prefix.'/simplesaml/saml2/idp/SingleLogoutService.php',
                ],
                'x509cert' => $isDev
                    ? 'MIIFUTCCA7mgAwIBAgIUPPptWNtxxxVqRQkksn2EG88c/IYwDQYJKoZIhvcNAQELBQAwgbcxCzAJBgNVBAYTAk5PMQ0wCwYDVQQIDARPc2xvMQ0wCwYDVQQHDARPc2xvMSowKAYDVQQKDCFGb3JlbmluZ2VuIEJsaW5kZXJuIFN0dWRlbnRlcmhqZW0xEjAQBgNVBAsMCUlULWdydXBwYTEgMB4GA1UEAwwXaWRwLWRldi5mb3JlbmluZ2VuYnMubm8xKDAmBgkqhkiG9w0BCQEWGWl0LWdydXBwYUBmb3JlbmluZ2VuYnMubm8wHhcNMjIwNzEzMjEzODEzWhcNNDIwNzEyMjEzODEzWjCBtzELMAkGA1UEBhMCTk8xDTALBgNVBAgMBE9zbG8xDTALBgNVBAcMBE9zbG8xKjAoBgNVBAoMIUZvcmVuaW5nZW4gQmxpbmRlcm4gU3R1ZGVudGVyaGplbTESMBAGA1UECwwJSVQtZ3J1cHBhMSAwHgYDVQQDDBdpZHAtZGV2LmZvcmVuaW5nZW5icy5ubzEoMCYGCSqGSIb3DQEJARYZaXQtZ3J1cHBhQGZvcmVuaW5nZW5icy5ubzCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAK2m9bHC+SZOLXLwPB4qIPxkpNTfKK86GhnAaI2R+5IEJZX9tbcpAnYLwUBUEQAtetuoNfYKwYDGOaUkyTHbqRnVObPQdInxy+b/lKOSUw9U5/Uyt4ifLVblqfzy+NCgNMuhQxfP9wid6zk19EXlHe9C1MCoPJHzbw+J6xCz4lJa94dw0ypsZcfBHFSfD6TCRYSW2p7YJ5VNILGegPncc4tx9l0oyG/63H68YOFn2qXINKay+2T03Ax8E4XZv97AJLHOZU4CZkSpDlS1h8tp+n0r8GLLDd+0R8APoKYhdAPhfF/ANwGfEjMbyeAvlvEez0aLcp3gVxS5MJNDpQT8KbEUVrbFJufrbgZhK0wHtXqsX9TyvXFz2bNDhmK5OItS0hFsVPqbJQ0yFr0fYXsV5T6/JA0tM2GJabnYSJtukKtbT6OzKFEWlbN0RZkzQNuo18h3BADTBKqjOexFTJKVyJgQT9lYXnzuU7NhKun/Zsvx89w0d+51cjXpBPNiyvm+oQIDAQABo1MwUTAdBgNVHQ4EFgQUraA+B/8rcnRRx7YE6MC8w7NiggMwHwYDVR0jBBgwFoAUraA+B/8rcnRRx7YE6MC8w7NiggMwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAYEAI93z7NOKBKlmWRV2XJEvrT3JVVECvXNDmtjjvH9NlRenDdtrCAed/lfJRrL2PZlQP/ft8nX3kLmb/sFckWf3zq1EfY/g1WFC53naMYp8CzHfhqP++EOG2u55kc5sYTootoZIc20oDeyIYIGIaICV+88d7d9GhyQ1nl2BaNclRmjeMaIOtSVNQtJ4HG7ZKetRsHkFLA/p/DHJFHnqHrPMumJssb+QeftjTKMLCbbCyqXYtC3hPXsavQlgI6aL4jNmzkkJpSvwAK05OA2ipmd6G0PKYybsNyvQ9FE1t64CrOgywiNaqa8VBdmMX2yEwtWrO1q/AHup7anG1dvGbsKiGsMvTeRDCyicnO1qM/Da4xLGN0obIGWsKGZforkvYv1nVuFf1yb25lif9LCEJpz8UMGsB2ieLL3wJrTUmGRam8YVu/xHip1rFFniSNFOOMtR0KT3fG+an97iclYStYNhnyWe9XEtziceAwRmutj14/Xslc1RIrQ6ZFevcAhXFbPg'
                    : 'MIIEOzCCAyOgAwIBAgIJAJB1ClZFzgNIMA0GCSqGSIb3DQEBCwUAMIGzMQswCQYDVQQGEwJOTzENMAsGA1UECAwET3NsbzENMAsGA1UEBwwET3NsbzEqMCgGA1UECgwhRm9yZW5pbmdlbiBCbGluZGVybiBTdHVkZW50ZXJoamVtMRIwEAYDVQQLDAlJVC1ncnVwcGExHDAaBgNVBAMME2lkcC5mb3JlbmluZ2VuYnMubm8xKDAmBgkqhkiG9w0BCQEWGWl0LWdydXBwYUBmb3JlbmluZ2VuYnMubm8wHhcNMTQxMTEyMDAyODE2WhcNMjQxMTExMDAyODE2WjCBszELMAkGA1UEBhMCTk8xDTALBgNVBAgMBE9zbG8xDTALBgNVBAcMBE9zbG8xKjAoBgNVBAoMIUZvcmVuaW5nZW4gQmxpbmRlcm4gU3R1ZGVudGVyaGplbTESMBAGA1UECwwJSVQtZ3J1cHBhMRwwGgYDVQQDDBNpZHAuZm9yZW5pbmdlbmJzLm5vMSgwJgYJKoZIhvcNAQkBFhlpdC1ncnVwcGFAZm9yZW5pbmdlbmJzLm5vMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr1ufEAkElJH9EpVX/xGZsUV7R17PpGWCHvnF6+nHTAKQxSM57h9UmjxdMx1jShbU0AWm6IVt4KPRyBXGEFfqVuXYvuU5pjGDpK1I9fAn/Fpkw0fe+RQQYq2QT0iKPDUkmjcq99WirJKMzUwfO7KuUV4lvctBnMx7s/1K6olq8HzY6km70kji46vmU45YiMgyo1TL3keVb+zVKgbjEX6P7Hm0Q7eXXY+3NHIqaKQ8N6d5xOT7mVuRqhvKAlwqUO296KhYBSgntElmH3/f/QayEaFoDbpMuWBbSmnLCNcQch+qYM/wFKFxt6i5AZRVmzTZAB8WkiKepvGiFCWujXRhNQIDAQABo1AwTjAdBgNVHQ4EFgQULdQSA/j4QuWMrB0SGhkyDW6Dai4wHwYDVR0jBBgwFoAULdQSA/j4QuWMrB0SGhkyDW6Dai4wDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAfBjmva4UE7/0u4+g4JiTTSsX5ZaveccHxTV7JqneFBbj7OmPQsaOpgFpaiwjyM1XIbOGKK3/A0sTAmKGwQC8o+VwQTAHiZhtv3CqWLY0MVZ03OYuuhX/q5AQij3FXUTriUfMaoqqsKX8hh8BTK4wcntCi4qYHihtvXsfrCnrJwl+Y811LziUKDFJymv3ZXYsTsiFqB7KI6+3YCe8mKy9KwYSHz5qDktwGERAShEvRDHVZ1kSARChrdSgf0LcuIO9nFd3O3x2VzMHC2vZj91KsX8tWHErodHxtZcHMpzOJSIvBY5cZx/qtCifl3yVYGxhUg4kl67afV5M2DRuvA7XXQ==',
            ],
            'security' => [
                'requestedAuthnContext' => false,
            ],
            'contactPerson' => [
                'technical' => [
                    'givenName' => 'IT-gruppa',
                    'emailAddress' => 'it-gruppa@foreningenbs.no',
                ],
                'support' => [
                    'givenName' => 'IT-gruppa',
                    'emailAddress' => 'it-gruppa@foreningenbs.no',
                ],
            ],
            'organization' => [
                'en-US' => [
                    'name' => 'Foreningen Blindern Studenterhjem',
                    'displayname' => 'FBS',
                    'url' => 'https://foreningenbs.no',
                ],
            ],
        ]);
    }

    public function acs()
    {
        $this->saml->processResponse();

        $errors = $this->saml->getErrors();

        if (! empty($errors)) {
            return $errors;
        }

        if (! $this->saml->isAuthenticated()) {
            return ['error' => 'Could not authenticate'];
        }

        return null;
    }

    public function relayState(Request $request)
    {
        $relayState = app('request')->input('RelayState');

        if ($relayState && URL::full() != $relayState) {
            return $relayState;
        }

        return null;
    }
}
