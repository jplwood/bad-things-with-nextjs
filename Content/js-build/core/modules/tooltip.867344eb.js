define("core/modules/tooltip",["jquery"],function(o){return{init:function(){console.log("tooltip"),o(document).click(function(t){o(t.target).closest(".js-tooltip-toggle").length&&"none"==o(".js-tooltip").css("display")?o(".js-tooltip").css("display","flex"):o(".js-tooltip").css("display","none")})}}});
//# sourceMappingURL=tooltip.js.map