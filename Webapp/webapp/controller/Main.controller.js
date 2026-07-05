/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","scm/ewm/pickcarts1/model/Global","scm/ewm/pickcarts1/control/Audio"],function(t,i,e){"use strict";var o="audio-player";return t.extend("scm.ewm.pickcarts1.controller.Main",{onInit:function(){this.getView().setModel(i.init(),"global")},bindAudioList:function(t){this.byId(o).bindItems({path:"/AudioURISet",template:new e({src:"{AudioUri}",type:"{Msgty}"}),filters:t})}})});
//# sourceMappingURL=Main.controller.js.map