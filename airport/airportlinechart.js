var svgline = d3.select("#airportincreaseline").attr("class", "svgback");

var marginline = {top: 20, right: 80, bottom: 60, left: 50},
    widthline = 800 - marginline.left - marginline.right,
    heightline = 600 - marginline.top - marginline.bottom;

var x = d3.time.scale()
    .range([0, widthline]);

var yline = d3.scale.linear()
    .range([heightline, 0]);

var color = d3.scale.ordinal()
    .range(["#b83b5e", "#fbe8d3", "#928a97", "#283c63"]);

var xAxisline = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.format(""));

var yAxisline = d3.svg.axis()
    .scale(yline)
    .orient("left")
    .tickFormat(d3.format("%"));

var line = d3.svg.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return yline(d.rate); });

svgline = d3.select("#airportincreaseline")
    .attr("width", widthline + marginline.left + marginline.right)
    .attr("height", heightline + marginline.top + marginline.bottom)
    .append("g")
    .attr("transform", "translate(" + marginline.left + "," + marginline.top + ")");

d3.csv("src/airportvolumeyear.csv", function(error, data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

    var data2 = data.filter(function(d,i){
        if(d.year == "2009"){
            return false;
        }
        return true;
    });

    var airports = color.domain().map(function(name) {
        return {
            name: name,
            values: data2.map(function(d,i,arr) {
                if(i == 0)
                    return {year: d.year, rate: +d[name] / data[0][name]};
                else 
                    return {year: d.year, rate: +(d[name] / arr[i-1][name])};
            })
        };
    });

    //console.log(airports);
    x.domain(d3.extent(data, function(d) { return d.year; }));

    yline.domain([
        d3.min(airports, function(c) { return d3.min(c.values, function(v) { return v.rate - 0.2;}); }),
        d3.max(airports, function(c) { return d3.max(c.values, function(v) { return v.rate + 0.2;}); })
    ]);

    svgline.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightline + ")")
        .call(xAxisline)
        .append("text")
        .attr("x", 690)
        .attr("y", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("年份");


    svgline.append("g")
        .attr("class", "y axis")
        .call(yAxisline)
        .append("text")
        .attr("x", 90)
        .attr("y", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Rate/Percentage(%)");

    svgline.append("g")
        .attr("class", "titleline")
        .append("text")
        .attr("font-size","15")
        .attr("x", widthbar/2-130)
        .attr("y", heightbar + 45)
        .text("各國際機場旅客出入進總流量之成長率");

    svgline.append("svg:rect")
        .attr('width', widthline) // can't catch mouse events on a g element
        .attr('height', heightline)
        .attr('fill', 'none')
        .attr('class', 'hover_area')
        .attr("pointer-events","all")
        .on("mousemove", function() {
            console.log("trying"); })
        ;

    var lines = svgline.selectAll(".lines")
        .data(airports)
        .enter().append("g")
        .attr("class", "lines");

    lines.append("path")
        .attr("class", function(d){
            return "line line_"+d.name;
        })
        .attr("d", function(d) {return line(d.values); })
        .style("stroke", function(d) { return color(d.name); })
        .style("stroke-width", 3)
        .style("opacity",0.7)
        .on("mouseover",function(d){
            d3.selectAll(".line_"+d.name).style("stroke-width", 3).style("opacity",1);
            d3.selectAll(".point_"+d.name).attr("r", 5).style("opacity",1);
            d3.selectAll(".text_"+d.name).attr("display","1");
            d3.selectAll(".rect_"+d.name).attr("display","1");
        })
        .on("mouseout",function(d){
            d3.selectAll(".line").style("stroke-width", 3).style("opacity",0.7);
            d3.selectAll(".point").attr("r", 4).style("opacity",0.7);
            d3.selectAll(".text_"+d.name).attr("display","none");
            d3.selectAll(".rect_"+d.name).attr("display","none");
        });
  
    lines.selectAll("circle")
        .data(function(d){return d.values})
        .enter()
        .append("circle")
        .attr("class",function(d,i,j){
            return "point point_"+airports[j].name;})
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return yline(d.rate); })
        .style("fill", function(d,i,j) {return color(airports[j].name); })
        .style("opacity",0.7)
        .on("mouseover",function(d,i,j){
            d3.selectAll(".point_"+airports[j].name).attr("r", 5).style("opacity",1);
            d3.selectAll(".line_"+airports[j].name).style("stroke-width", 3).style("opacity",1);
            d3.selectAll(".text_"+airports[j].name).attr("display","1");
            d3.selectAll(".rect_"+airports[j].name).attr("display","1");
        })
        .on("mouseout",function(d){
            d3.selectAll(".point").attr("r", 4).style("opacity",0.7);
            d3.selectAll(".line").style("stroke-width", 3).style("opacity",0.7);
            d3.selectAll(".text").attr("display","none");
            d3.selectAll(".rect").attr("display","none");
        });

    var line_rect =svgline.selectAll(".line_rects")
        .data(airports)
        .enter().append("g")
        .attr("class", "line_rects");

    line_rect.selectAll("rect")
        .data(function(d){return d.values})
        .enter()
        .append("rect")
        .attr("class", function(d,i,j){
            return "rect rect_"+airports[j].name;
        })
        .attr("x", function(d) { return x(d.year) + 7.5; })
        .attr("y", function(d) { return yline(d.rate) + -20; })
        .attr("height", 18)
        .attr("width", 47)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("display","none")
        .style("fill","white");

    var line_text =svgline.selectAll(".line_texts")
        .data(airports)
        .enter().append("g")
        .attr("class", "line_texts");

    line_text.selectAll("text")
        .data(function(d){return d.values})
        .enter()
        .append("text")
        .attr("class", function(d,i,j){
            return "text text_"+airports[j].name;
        })
        .attr("x", function(d) { return x(d.year)+ 10;})
        .attr("y", function(d) { return yline(d.rate) - 5; })
        .attr("display","none")
        .text(function(d) { 
            var format = d3.format(".0%");
            return format(d.rate);
        });

    //////////////////////////
    var focus = svgline.append("g")
        .attr("class", "mouse-over-effects");

    
    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", heightline);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", widthline)
        .attr("x2", widthline);
        
        
    var mousePerLine = focus.selectAll('.mouse-per-line')
        .data(airports)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");
        
    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
            return color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "1");
        
    
    
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
        focus.select("text").text(function() { return d.value; });
        focus.select(".x-hover-line").attr("y2", heightline - yline(d.value));
        focus.select(".y-hover-line").attr("x2", widthline + widthline);
    }

    
    /////////////////////////////////
    var line_legend = svgline.selectAll(".line-legend")
        .data(airports)
        .enter().append("g")
        .attr("class", "line-legend")
        .attr("transform", function(d, i) {return "translate(0," + i * 20 + ")"; });
    
    line_legend.append("circle")
        //.attr("x", 425+25)
        .attr("r", 7)
        .attr("cx", function(d) { return 425+25; })
        .attr("cy", function(d) { return 11; })
        .style("fill", function(d){return color(d.name);});

    line_legend.append("path")
        .attr("d", d=" M 410 11 L 485 11")
        .style("stroke", function(d) { return color(d.name); })
        .style("stroke-width", 3)

    line_legend.append("text")
        .attr("x", 450+145)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d.name; });
    });
    
    drawPie(2016);
