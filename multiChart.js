function chart(filename, root_element,x_var_name,y_var_name) {
    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    
    var x = d3.scale.linear()
        .range([0, width]);
    
    var y = d3.scale.linear()
        .range([height, 0]);
    
    var color = d3.scale.category10();
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) {return x(d.x)})
        .y(function(d) {return y(d.y)});
    
    var svg = d3.select("div.chart#"+root_element).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    d3.tsv(filename, function(error, data) {
      if (error) throw error;
    
      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "x"; }));
    
    
      var charts = color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
            return {x: +d.x, y: +d[name]};
          })
        };
      });
    
      x.domain(d3.extent(data, function(d) { return d.x; }));
    
      y.domain([
        d3.min(charts, function(c) { return d3.min(c.values, function(v) { return v.y; }); }),
        d3.max(charts, function(c) { return d3.max(c.values, function(v) { return v.y; }); })
      ]);
    
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(y_var_name);
    
      var chart = svg.selectAll(".chart")
          .data(charts)
        .enter().append("g")
          .attr("class", "chart");
      chart.append("path")
          .attr("class", "line")
          .attr("d", function(d) {return line(d.values); })
          .style("stroke", function(d) { return color(d.name); });

      chart.append("text")
          .datum(function(d) {console.log(d); return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.x) + "," + y(d.value.y) + ")"; })
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });
    });
}
