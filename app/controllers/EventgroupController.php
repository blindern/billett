<?php

use Blindern\UKA\Billett\Eventgroup;

class EventgroupController extends Controller {
	public function index() {
		return Eventgroup::orderBy('sort_value')->get();
	}

	public function show($id) {
		// TODO: not all fields should be returned to the client
		return Eventgroup::with(array('events' => function($q) {
			$q->orderBy('time_start');

			// TODO: auth requirement
			if (!\Input::has('admin')) $q->where('is_published', true);
		}))->findOrFail($id);
	}
}