sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/HTML"], function (UIComponent, HTML) {
  "use strict";
  return UIComponent.extend("CustomerAgreement.Component", {
    metadata: { manifest: "json" },
    createContent: function () {
      var sUrl = sap.ui.require.toUrl("CustomerAgreement/index.html");
      return new HTML({
        preferDOM: true,
        content: '<iframe title="Customer Agreement" src="' + sUrl + '" style="border:0;width:100%;height:calc(100vh - 3rem);display:block"></iframe>'
      });
    }
  });
});
