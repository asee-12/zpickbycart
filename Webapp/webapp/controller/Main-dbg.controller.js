/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"scm/ewm/pickcarts1/model/Global",
	"scm/ewm/pickcarts1/control/Audio"
], function (Controller, Global, Audio) {
	"use strict";
	var audioId = "audio-player";
	return Controller.extend("scm.ewm.pickcarts1.controller.Main", {
		onInit: function () {
			this.getView().setModel(Global.init(), "global");
		},
		bindAudioList: function (aFilter) {
			this.byId(audioId).bindItems({
				path: "/AudioURISet",
				template: new Audio({
					src: "{AudioUri}",
					type: "{Msgty}"
				}),
				filters: aFilter
			});
		}
	});
});