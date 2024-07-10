<?php

namespace Blindern\UKA\Saml2;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class Saml2Controller extends Controller
{
    /**
     * @var Saml2Service
     */
    private $service;

    public function __construct(Saml2Service $service)
    {
        $this->service = $service;
    }

    public function metadata()
    {
        $settings = $this->service->saml->getSettings();
        $metadata = $settings->getSPMetadata();
        $errors = $settings->validateMetadata($metadata);

        if (! count($errors)) {
            return response($metadata, 200, ['Content-Type' => 'text/xml']);
        }

        throw new \Exception('Invalid SP metadata: '.implode(', ', $errors));
    }

    public function login(Request $request)
    {
        $this->service->saml->login($request->query('returnTo') ?? '/');
    }

    public function acs(Request $request)
    {
        $errors = $this->service->acs();

        if (! empty($errors)) {
            logger(null)->error('saml2.error_detail', ['error' => $this->service->saml->getLastErrorReason()]);
            logger(null)->error('saml2.error', $errors);

            throw new \Exception('acs failed');
        }

        $user = User::query()->updateOrCreate([
            'username' => $this->service->saml->getAttribute('username')[0],
        ], [
            'id' => (int) $this->service->saml->getAttribute('id')[0],
            'email' => $this->service->saml->getAttribute('email')[0],
            'realname' => $this->service->saml->getAttribute('realname')[0],
            'groups' => implode(',', $this->service->saml->getAttribute('groups')),
        ]);

        Auth::login($user);

        return redirect($this->service->relayState($request) ?? '/');
    }

    public function sls(Request $request)
    {
        if (! $request->query('SAMLResponse') && ! $request->query('SAMLRequest')) {
            return redirect('/');
        }

        $this->service->saml->processSLO(false, null, false, function () {
            Auth::logout();
        });

        $errors = $this->service->saml->getErrors();

        if (! empty($errors)) {
            logger(null)->error('saml2.error_detail', ['error' => $this->service->saml->getLastErrorReason()]);
            logger(null)->error('saml2.error', $errors);

            throw new \Exception('sls failed');
        }

        return redirect($this->service->relayState($request) ?? '/');
    }

    public function logout(Request $request)
    {
        $this->service->saml->logout($request->query('returnTo') ?? '/');
    }
}
