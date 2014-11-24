<?php

use Blindern\UKA\Billett\Eventgroup;

class EventgroupController extends Controller {
	public function index() {
		return Eventgroup::orderBy('sort_value')->get();
	}

	public function show($id) {
		// TODO: not all fields should be returned to the client
		$group = Eventgroup::with('events')->find($id);
		if (!$group) {
			return Response::json('not found', 404);
		}

		return $group;
	}
}