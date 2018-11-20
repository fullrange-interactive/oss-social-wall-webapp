(function ( $ ){    
    'use strict';
    $.fn.sizeChooser = function(callback){
        return this.each(function (){
            var buttonGroup = $("<div>");
            buttonGroup.addClass("btn-group");
            buttonGroup.addClass("dropdown");
            
            var button = $("<button>");
            button.attr("type","button");
            button.attr("data-toggle","dropdown");
            button.addClass("btn btn-default dropdown-toggle");
            buttonGroup.append(button);
            
            var preview = $("<div>");
            preview.addClass("size-chooser-preview")
            button.append(preview)
            
            var carret = $("<span>")
            carret.addClass("caret");
            button.append(carret);
            
            $(this).css("display","none");
            $(this).parent().append(buttonGroup);
            
            var menu = $("<ul>")
            menu.addClass("dropdown-menu");
            buttonGroup.append(menu);
            
            var select = $(this).find("select");
            $(select).find("option").each(function (){
                var item = $("<li>");
                item.attr("role","presentation")
                
                var dot = $("<a>")
                dot.addClass("size-chooser-dot")
                dot.css("width",$(this).attr("value") + "px")
                dot.css("height",$(this).attr("value") + "px")
                item.append(dot);
                menu.append(item);
                var that = this;
                $(item).click(function (){
                    console.log($(that).attr("value"))
                    $(select).val($(that).attr("value"));
                    preview.css("width",$(that).attr("value"));
                    preview.css("height",$(that).attr("value"));
                    callback();
                })
            })
        });
    };
}( jQuery ));