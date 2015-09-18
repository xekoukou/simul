$(function() {

    var converter = new Markdown.Converter();

    $(".markdown").each(function() {
            var md = $(this).text();
            var html = converter.makeHtml(md);
            $(this).empty();
            $(this).append(html);

        })
        //Create the Math formulas
        //            MathJax.Hub.Typeset();



})