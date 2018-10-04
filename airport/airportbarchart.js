var svgbar = d3.select("#airportvolbar").attr("class", "svgback");

var marginbar = {top: 30, right: 40, bottom: 50, left: 50},
    widthbar = 800 - marginbar.left - marginbar.right,
    heightbar = 600 - marginbar.top - marginbar.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, widthbar], .1);

var x1 = d3.scale.ordinal();

var ybar = d3.scale.log()
    .range([heightbar, 0]);

var color = d3.scale.ordinal()
    .range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    //, "#7b6888"

var xAxisbar = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxisbar = d3.svg.axis()
    .scale(ybar)
    .orient("left")
    .tickFormat(d3.format(".2s"));

svgbar = d3.select("#airportvolbar")
    .attr("width", widthbar + marginbar.left + marginbar.right)
    .attr("height", heightbar + marginbar.top + marginbar.bottom)
    .append("g")
    .attr("transform", "translate(" + marginbar.left + "," + marginbar.top + ")");

d3.csv("src/airportvolumeyear.csv", function(error, data){
    var airportnames = d3.keys(data[0]).filter(function(key) { return key !== "year"; });
    data.forEach(function(d) {
        d.airportsets = airportnames.map(function(name) { return {name: name, value: +d[name]}; });
    });
    x0.domain(data.map(function(d) { return d.year; }));
    x1.domain(airportnames).rangeRoundBands([0, x0.rangeBand()]);
    ybar.domain([
        d3.min(data, function(d) { return d3.min(d.airportsets, function(d) { return d.value; }); })
        ,5e7+ d3.max(data, function(d) { return d3.max(d.airportsets, function(d) { return d.value; }); })]);

    svgbar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightbar + ")")
        .call(xAxisbar)
        .append("text")
        .attr("x", 725)
        .attr("y", 10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("年份");

    svgbar.append("g")
        .attr("class", "y axis")
        .call(yAxisbar)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("旅客/人次");

    svgbar.append("g")
        .attr("class", "titlebar")
        .append("text")
        .attr("font-size","15")
        .attr("x", widthbar/2-100)
        .attr("y", heightbar + 40)
        .text("臺灣各國際機場流量比例柱狀圖");

        
    var yearSvg = svgbar.selectAll(".year")
        .data(data)
        .enter().append("g")
        .attr("class",function(d){ 
            return "g bar_"+d.year;
        })
        .attr("transform", function(d) { return "translate(" + x0(d.year) + ",0)"; })
        .on("mouseover",function(d){ 
            var widths = d3.selectAll(".bar_"+d.year+">rect").attr("width");
            d3.selectAll(".bar_"+d.year+">rect").attr("width", widths * 1.5)
                .style("stroke","black");;
        })
        .on("mouseout",function(d){ 
            var widths = d3.selectAll(".bar_"+d.year+">rect").attr("width");
            d3.selectAll(".bar_"+d.year+">rect").attr("width", widths / 1.5)
                .style("stroke","none");
        });

    yearSvg.selectAll("rect")
        .data(function(d) { return d.airportsets; })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { 
            return x1(d.name); })
        .attr("y", function(d) { 
            return ybar(d.value); })
        .attr("height", function(d) { return heightbar - ybar(d.value); })
        .style("fill", function(d) { return color(d.name); });
    
    var legend = svgbar.selectAll(".legend")
        .data(airportnames.slice())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", 25)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 145)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
});