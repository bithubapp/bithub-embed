import can from "can/";
import template from "./bit.stache!";
import _map from "lodash-amd/modern/collection/map";
import moment from "moment";

import "./image-gallery/image-gallery";
import "./body-wrap/body-wrap";
import "bit-social";

import "./bit.less!";
import "can/construct/super/super";

// Image loading statuses
var IMAGE_STATUSES = {
	LOADING : 'LOADING',
	LOADED  : 'LOADED',
	ERROR   : 'ERROR'
};

// check image's status. It's either still loading, loaded or errored
var imageStatus = function(img){
	if(!img.complete){
		return IMAGE_STATUSES.LOADING;
	}
	if(img.naturalWidth === 0){
		return IMAGE_STATUSES.ERROR;
	}
	return IMAGE_STATUSES.LOADED;
};

export var BitVM = can.Map.extend({
	sharePanelOpen: false,

	sharePanelToggle : function(){
		this.attr('sharePanelOpen', !this.attr('sharePanelOpen'));
	},
	shouldRender : function(){
		var bit = this.attr('bit');
		return bit && !bit.attr('__pendingRender');
	}
});

can.Component.extend({
	tag: 'bh-bit',
	template : template,
	scope : BitVM,
	helpers : {
		formattedTitle : function(title){
			title = can.isFunction(title) ? title() : title;
			if(title && title !== 'undefined'){
				return title;
			}
			return "";
		},
		formattedQuotedTweetDate : function(date){
			date = can.isFunction(date) ? date() : date;
			return moment(date, 'dd MMM DD HH:mm:ss ZZ YYYY').format('LL');
		}
	},
	events : {
		inserted : function(){
			var bit = this.scope.attr('bit');
			
			this.element.data('bitId', bit.attr('id'));

			if(!bit.attr('__pendingRender')){
				this.__initTimeout = setTimeout(this.proxy('initImages'));
			}

			// We need to wait until the bit was loaded to calculate it's height
			// When the bit is loaded the `animate-height` class is removed from the bit
			// which will cause the height transition. After the transition is done
			// we remove the explicit height so bit can be resized based on user's actions.
			// If bit was already on the page we don't have to wait for all images to load
			// before removing the height.
			if(!bit.attr('__resolvedHeight')){
				this.element.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', this.proxy('removeExplicitHeight'));
				
			} else {
				this.removeExplicitHeight();
			}
		},

		// Clean up the timeouts
		destroy : function(){
			clearTimeout(this.__imgSweeperTimeout);
			clearTimeout(this.__initTimeout);
			clearTimeout(this.__removeExplicitHeightTimeout);
			return this._super.apply(this, arguments);
		},

		'{bit} __pendingRender' : function(bit, ev, newVal){
			if(newVal === false){
				setTimeout(() => {
					if(this.element){
						this.__initTimeout = setTimeout(this.proxy('initImages'));
						this.bitLoadedAndRendered();
					}
				}, 1);
			}
		},

		'a click' : function(el, ev){
			ev.preventDefault();
			window.open(el.attr('href'));
			this.element.trigger('interaction:link', [this.scope.attr('state.hubId'), this.scope.attr('bit.id')]);
		},

		initImages : function(){
			this.imgs = this.element.find('img').toArray();
			this.imagesToLoadCount = this.imgs.length;

			if(this.imgs.length){
				this.__imgSweeperTimeout = setTimeout(this.proxy('imgSweeper'), 500);
			} else {
				this.doneLoading();
			}
		},

		// Go through all images and make sure all are loaded or errored
		// Before calling the `doneLoading` function which will remove the loading class
		imgSweeper : function(){
			var statuses = _map(this.imgs, imageStatus);
			var errored;

			// If any of the images is still loading, check again in 500ms
			if(can.inArray(IMAGE_STATUSES.LOADING, statuses) > -1){
				this.__imgSweeperTimeout = setTimeout(this.proxy('imgSweeper'), 500);
			} else {
				this.doneLoading();
			}

			for(var i = 0; i < statuses.length; i++){
				if(statuses[i] === IMAGE_STATUSES.ERROR){
					errored = this.imgs.splice(i, 1)[0];
					if(errored){
						$(errored).remove();
					}
				}
			}
		},

		// All images in bit are loaded and we can calculate it's height. We set the explicit height
		// to make sure that that the transition animation runs.
		doneLoading : function(){
			var bit = this.scope.attr('bit');
			if(!bit.attr('__resolvedHeight')){
				this.element.find('.bit-wrap').height(this.element.find('.bit').height());
			}
			bit.attr('__isLoaded', true);
			this.bitLoadedAndRendered();
		},

		// When we're done with the height transition remove the explicit height
		// and mark the bit's height as resolved
		removeExplicitHeight : function(){
			var self = this;
			this.__removeExplicitHeightTimeout = setTimeout(function(){
				self.scope.attr('bit').attr('__resolvedHeight', true);
				if(self.element){
					self.element.find('.bit-wrap').css('height', 'auto');
					self.bitLoadedAndRendered();
				}
			}, 1);
		},

		bitLoadedAndRendered : function(){
			var bit = this.scope.attr('bit');
			var check = bit.attr('__resolvedHeight') && bit.attr('__isLoaded') && !bit.attr('__pendingRender');

			if(check){
				this.element.trigger('bit:loaded');
			}
		}
	}
});
