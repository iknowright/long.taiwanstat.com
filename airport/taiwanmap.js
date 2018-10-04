//Taiwan Map
var width = 800,
    height = 600;

var svg = d3.select("#taiwanmap")
    .attr("width", width)
    .attr("height", height)
    .attr("class","svgback");

var projection = d3.geo.mercator()
    .center([121,24])
    .scale(6000);

var path = d3.geo.path()
    .projection(projection);

d3.json("src/country.topojson", function(error, topology) {
    var g = svg.append("g");
    
    // City Borders 
    d3.select("#taiwanmap").append("path").datum(
        topojson.mesh(topology,
                topology.objects["COUNTY_MOI_1070516"], function(a,
                        b) {
                    return a !== b;
                })).attr("d", path).attr("class","subunit-boundary"); 

    //Map showing here
    var features = topojson.feature(topology, topology.objects.COUNTY_MOI_1070516).features;
    d3.select("g").selectAll("path")
        .data(topojson.feature(topology, topology.objects.COUNTY_MOI_1070516).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr({
            d : path,
            id : function(d) {
                return d.properties["COUNTYNAME"];
            },
            //default color
            //fill : '#55AA00'
    });

    //drawing taiwan density
    //tooltip div
    var imageTooltip = svg.append('svg:image')
        .attr({
        //'xlink:href': 'tpe.png', 
        class : "tooltipmap",
        x: 25,
        y: height - 250,
        width: 200,
        height: 150
        });

    svg.append("text")
        .attr("x","25")
        .attr("y",height - 100)
        .attr("font-family","sans-serif")
        .attr("font-size","45")
        .attr("id","name");
    svg.append("text")
        .attr("x","25")
        .attr("y",height - 50)
        .attr("font-family","sans-serif")
        .attr("font-size","40")
        .attr("id","density");

    svg.append("text")
        .attr("x","25")
        .attr("y",height-50)
        .attr("font-family","sans-serif")
        .attr("font-size","40")
        .attr("id","airporttext");

    svg.append("text")
        .attr("x",width/2 - 110)
        .attr("y",50)
        .attr("font-family","sans-serif")
        .attr("font-size","15")
        .attr("id","airporttext")
        .text("國際機場位置與各縣市人口密度關係圖");
    
    var density = {
        "臺北市":	9838.36
        ,"嘉義市":	4480.97
        ,"新竹市":	4258.95
        ,"基隆市":	2791.62
        ,"新北市":	1943.37
        ,"桃園市":	1808.45
        ,"臺中市":	1262.40
        ,"彰化縣":	1190.39
        ,"高雄市":	939.58
        ,"金門縣":  909.64
        ,"臺南市":	859.90
        ,"澎湖縣":	820.10
        ,"雲林縣":	533.42
        ,"連江縣":	454.03
        ,"新竹縣":	388.83
        ,"苗栗縣":	302.60
        ,"屏東縣":	298.34
        ,"嘉義縣":	267.24
        ,"宜蘭縣":	212.69
        ,"南投縣":	121.48
        ,"花蓮縣":	71.02
        ,"臺東縣":	62.47
    };
    for(var i = features.length - 1; i >= 0; i-- ) {
        features[i].properties.density = density[features[i].properties.COUNTYNAME];
    }
    var color = d3.scale.log().domain([1,10000]).range(["#f1c550","#be3030"]);
    d3.select("#taiwanmap").selectAll("path").data(features).attr({
        d: path,
        fill: function(d) {
            return color(d.properties.density)
            }
        })
        .on("mouseenter", function(d) {
            $("#name").text(d.properties.COUNTYNAME);
            $("#density").text(d.properties.density+" 人/平方公里");
            $("#" + d.properties.COUNTYNAME).attr({opacity:0.75});
        })
        .on("mouseout", function(d) {
            $("#name").text("");
            $("#density").text("");
            $("#" + d.properties.COUNTYNAME).attr({opacity:1});
        });

        var legendmap = svg.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr('x1', '0%') // bottom
        .attr('y1', '100%')
        .attr('x2', '0%') // to top
        .attr('y2', '0%')
        .attr("spreadMethod", "pad");

        var pct =d3.scale.log().domain([0.1,10]).range([0,100]);
        for(var i = 0; i <= 10;i++){
            legendmap.append("stop")
            .attr("offset",pct(i+0.1) +"%")
            .attr("stop-color", color(10000 * i/10+1))
            .attr("stop-opacity", 1);
        }


        svg.append("rect")
        .attr("width", 20)
        .attr("height", 300)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(750,225)");

        var ykey = d3.scale.log()
        .range([0,300])
        .domain([10000,1]);

        var yAxisMap = d3.svg.axis()
        .scale(ykey)
        .orient("left")
        .tickValues([10,100,500,1000,2000,5000,10000])
        .tickFormat(d3.format("s"));

        svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(750,225)")
        // .attr("transform", "rotate(-90)")
        .call(yAxisMap)
        .append("text")
        .attr("x", width-50)
        .attr("y", height/2-75)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("axis title");

    // Display International Airport Location
    d3.csv("src/airport.csv", function(error, data) {
        svg.append("text")
        .attr("x","50")
        .attr("y","75")
        .attr("font-family","sans-serif")
        .attr("font-size","50")
        .attr("id","airportname");

        svg.append("text")
        .attr("x","50")
        .attr("y","135")
        .attr("font-family","sans-serif")
        .attr("font-size","50")
        .attr("id","airportcapacity");

        g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return projection([d.lon, d.lat])[0]-1.5;
        })
        .attr("y", function(d) {
            return projection([d.lon, d.lat])[1] - 17;
        })
        .attr("height", 17)
        .attr("width", 3)
        .style("fill","black");
        
        g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                    return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function(d) {
                    return projection([d.lon, d.lat])[1] - 20;
            })
            .attr("r", 8)
            .style("fill","#5f1854")
            .on("mouseenter", function(d) {
                $("#airporttext").text(d.city);
                var imgfile;
                if(d.code == "TPE")imgfile = "images/tpe.png"; 
                if(d.code == "TSA")imgfile = "images/tsa.jpg"; 
                if(d.code == "TXG")imgfile = "images/txg.jpg"; 
                if(d.code == "KHH")imgfile = "images/khh.jpg"; 
                imageTooltip.attr('xlink:href', imgfile);
            })
            .on("mouseout", function(d) {
                $("#airporttext").text("");
                imageTooltip.attr('xlink:href', null);
            });
    });
});

svg.append("g")
    .attr("class", "titlemap")
    .append("text")
    .attr("font-size","12")
    .attr("x", width / 2 - 180)
    .attr("y", 50);
   // .text("臺灣各縣市人口密度與國際機場所在地圖");