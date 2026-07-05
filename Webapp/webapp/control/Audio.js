/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control"],function(e){"use strict";var t=e.extend("zscm.ewm.pickcarts1.control.Audio",{metadata:{properties:{src:{type:"String",defaultValue:"",bindable:"bindable"},type:{type:"String",defaultValue:"",bindable:"bindable"}},designTime:true}});t.prototype.play=function(){var e=this.$();if(e.length){e[0].play()}};return t});
//# sourceMappingURL=Audio.js.map