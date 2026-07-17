/*
 * Copyright (C) 2009-2025 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [],
  function () {
    "use strict";
    var r = {};
    r.render = function (r, t) {
      var e = r;
      e.write("<audio");
      e.writeControlData(t);
      e.writeAttributeEscaped("src", t.getSrc());
      e.write(">");
      e.write("</audio>");
    };
    return r;
  },
  true,
);
//# sourceMappingURL=AudioRenderer.js.map
