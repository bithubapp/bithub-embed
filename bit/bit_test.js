import {BitVM} from "./bit";
import fixtureData from "../fixtures/fixture_data.json";
import QUnit from "steal-qunit";
import F from "funcunit";
import Bit from "models/bit";
import $ from "jquery";

var testBit = $.extend({}, fixtureData.data[0], {id: Date.now()});

var template = can.stache("<bh-bit bit='{bit}' state='{state}'></bh-bit>");

var renderTemplate = function(data){
	$('#qunit-fixture').html(template(data));
};

QUnit.module("Bit Test");

QUnit.test("Card is correctly rendered", 3, function(){
	renderTemplate({
		bit: Bit.model(testBit),
		state: new can.Map({hubId: 1})
	});

	F('bh-bit bh-image-gallery').exists('Image gallery is rendered');
	F('bh-bit bh-body-wrap').exists('Body wrap is rendered');
	F('bh-bit bit-social').exists('Share panel is rendered');
});

QUnit.test("Card goes through the lifecycle", 4, function(){
	renderTemplate({
		bit: Bit.model(testBit),
		state: new can.Map({hubId: 1})
	});
	F('bh-bit .loading').exists('Card is in the loading state');
	F('bh-bit .animate-height').exists('Card is awaiting animation');
	F('bh-bit .loading').missing('Card is loaded');
	F('bh-bit .animate-height').missing('Card has resolved height');
});

QUnit.test("Sharing panel is expanded on click", 3, function(){
	var bit =  Bit.model(testBit);
	renderTemplate({
		bit: bit,
		state: new can.Map({hubId: 1})
	});
	F('bh-bit .share-panel-toggle').exists('Share button is visible');
	F('bh-bit .share-panel-toggle').click();
	F('bh-bit bit-social.expanded').exists('Share panel is expanded');
	F.wait(1, function(){
		ok($('bh-bit').scope().attr('sharePanelOpen'), 'VM is updated with share panel attr');
	});
});
