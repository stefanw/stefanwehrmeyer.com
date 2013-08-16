$(function(){

  var drawWorld = function(el, land, countries, borders, d3, topojson, $) {
    "use strict";

    var width = el.width();
    var height = el.height();

    var canvas = d3.select(el[0])
      .append("canvas")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geo.orthographic()
        .scale(100)
        .translate([width / 2, height / 2])
        .clipAngle(90);

    var c = canvas.node().getContext("2d");

    var path = d3.geo.path()
        .projection(projection)
        .context(c);

    var globe = {type: "Sphere"};

    var travelCountry = countries.filter(function(d){
      return d.id === el.data('iso3-0');
    })[0];

    var travelCoordinates = [], i = 0;
    while (true) {
      if (!el.data('iso3-' + i)) {
        break;
      }
      travelCoordinates.push([parseFloat(el.data('lng-' + i)), parseFloat(el.data('lat-' + i))]);
      i += 1;
    }

    var redraw = function(){
      c.clearRect(0, 0, width, height);

      c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
      c.fillStyle = "#f00", c.beginPath(), path(travelCountry), c.fill();
      c.strokeStyle = "#fff", c.lineWidth = 0.5, c.beginPath(), path(borders), c.stroke();
      c.strokeStyle = "#000", c.lineWidth = 1, c.beginPath(), path(globe), c.stroke();
      c.fillStyle = "#000";
      for (var i = 0; i < travelCoordinates.length; i += 1) {
        var p = projection(travelCoordinates[i]);
        c.beginPath(), c.arc(p[0], p[1], 2, 0, 2 * Math.PI, false), c.fill();
      }
    };
    redraw();

    canvas.transition()
        .duration(1250)
        .tween("rotate", function() {
          var p = travelCoordinates[0],
              r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]),
              r2 = d3.interpolate(projection.scale(), 180);
          return function(t) {
            projection.rotate(r(t));
            projection.scale(r2(t));
            redraw();
            if (t === 1) {
              animationReady();
            }
          };
    });
    var animationReady = function(){
      canvas.on('mouseover', function(){
        canvas.transition()
          .duration(500)
          .tween("rotate", function() {
            var r = d3.interpolate(projection.scale(), 600);
            return function(t) {
              projection.scale(r(t));
              redraw();
            };
        });
      });

      canvas.on('mouseout', function(){
        canvas.transition()
          .duration(500)
          .tween("rotate", function() {
            var r = d3.interpolate(projection.scale(), 180);
            return function(t) {
              projection.scale(r(t));
              redraw();
            };
        });
      });
    };
  };

  if ($('.globe').length > 0) {
    d3.json("/js/lib/countries.json", function(error, world) {

      var land = topojson.feature(world, world.objects.world);
      var countries = topojson.feature(world, world.objects.world).features;
      var borders = topojson.mesh(world, world.objects.world, function(a, b) { return a !== b; });

      $('.globe').each(function(i, el){
        el = $(el);
        el.height(el.parent().height());
        drawWorld(el, land, countries, borders, d3, topojson, $);
      });
    });
  }
});