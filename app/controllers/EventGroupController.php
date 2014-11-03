<?php

use Blindern\UKA\Billett\EventGroup;

class EventGroupController extends Controller {
	public function index() {
		return EventGroup::orderBy('sort_value')->get();
	}

	public function show($id) {
		// TODO: not all fields should be returned to the client
		$group = EventGroup::with('events')->find($id);
		if (!$group) {
			return Response::json('not found', 404);
		}

		return $group;
	}
}