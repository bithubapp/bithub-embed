import fixtures from "../fixtures/fixture_data.json";
import can from "can";
import $ from "jquery";

import Bit from "../models/bit";

import "../bits_table_view/";
import "../bit/";

import "../style/embed.less!";

var bitData = new Bit.List(fixtures.data);

var template = can.stache('<bh-bits-table-view bits={bits}></bh-bits-table-view>');

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
