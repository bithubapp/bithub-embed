import fixtures from "../../fixtures/fixture_data.json";
import can from "can";
import $ from "jquery";

import Bit from "../../models/bit";

import "../../bits_vertical_infinite/";
import "./custom_bit";

var bitData = new Bit.List(fixtures.data);

var template = can.stache('<bh-bits-vertical-infinite bits={bits} bit-tag="bh-custom-bit"></bh-bits-vertical-infinite>');

var State = can.Map.extend({
	isAdmin(){
		return false;
	},
	assetRoot: "../",
	hubId: 1
});

$('#app').html(template({
	bits: bitData,
	state: new State()
}));
