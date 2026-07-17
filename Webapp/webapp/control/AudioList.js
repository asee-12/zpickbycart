/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control"], function (e) {
  "use strict";
  var t = e.extend("zscm.ewm.pickcarts1.control.AudioList", {
    metadata: {
      properties: {
        visible: { type: "boolean", group: "Appearance", defaultValue: false },
      },
      defaultAggregation: "items",
      aggregations: {
        items: {
          type: "sap.ui.core.Control",
          multiple: true,
          singularName: "item",
          bindable: "bindable",
        },
      },
      designTime: true,
    },
  });
  t.prototype.play = function (e) {
    var t = this.getItems();
    for (var a = 0; a < t.length; a++) {
      if (t[a].getType() === e) {
        return t[a].play();
      }
    }
  };
  return t;
});
//# sourceMappingURL=AudioList.js.map
