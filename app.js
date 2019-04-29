function buildChord(a,b,c,d) {
  
  var url = `/chord-data/${a}/${b}/${c}/${d}`
  d3.json(url).then(function(data) {
    
    var chordData= JSON.parse("[" + data + "]");
    console.log(chordData)

    var svg = d3.select("#pie")
      .append("svg")
        .attr("width", 440)
        .attr("height", 440)
      .append("g")
        .attr("transform", "translate(220,220)");

    // create a matrix
    var matrix = chordData

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      (matrix)

    // Add the links between groups
    svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data(function(d) { return d; })
      .enter()
      .append("path")
        .attr("d", d3.ribbon()
          .radius(190)
        )
        .style("fill", "#69b3a2")
        .style("stroke", "black");

    // this group object use each group of the data.groups object
    var group = svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data(function(d) { return d.groups; })
      .enter()

    // add the group arcs on the outer part of the circle
    group.append("g")
      .append("path")
      .style("fill", "grey")
      .style("stroke", "black")
      .attr("d", d3.arc()
        .innerRadius(190)
        .outerRadius(200)
      )

    // Add the ticks
    group
    .selectAll(".group-tick")
    .data(function(d) { return groupTicks(d, 25); })    // Controls the number of ticks: one tick each 25 here.
    .enter()
    .append("g")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + 200 + ",0)"; })
    .append("line")               // By default, x1 = y1 = y2 = 0, so no need to specify it.
      .attr("x2", 6)
      .attr("stroke", "black")

    // Add the labels of a few ticks:
    group
    .selectAll(".group-tick-label")
    .data(function(d) { return groupTicks(d, 25); })
    .enter()
    .filter(function(d) { return d.value % 25 === 0; })
    .append("g")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + 200 + ",0)"; })
    .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.value })
      .style("font-size", 9)


    // Returns an array of tick angles and values for a given group and step.
    function groupTicks(d, step) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(function(value) {
      return {value: value, angle: value * k + d.startAngle};
      });
    }
  });
}



function buildCharts() {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/bubble-data`
  d3.json(url).then(function(data) {
    
    var ids = data.year;
    var labels = data.title;
    var values = data.citation;

    // @TODO: Build a Bubble Chart using the sample data
    let bubbleData = [
      {
        x: ids,
        y: values,
        text: labels,
        mode: 'markers',
        marker: {
          size: values,
          color: values,
          colorscale: 'Portland'
        }
      }
    ]

    let bubbleLayout = {
      xaxis: {title: "Citations by Year"}
    }
      
    Plotly.plot("bubble", bubbleData, bubbleLayout);
  })
}

function init() {
  // Grab a reference to the dropdown select element
  var Mech_selector = d3.select("#selMech");

  // Use the list of sample names to populate the select options
  d3.json("/mechanical").then((mech_prop) => {
    mech_prop.forEach((mech) => {
      Mech_selector
        .append("option")
        .text(mech)
        .property("value", mech);
    });
  });
  
  var Therm_selector = d3.select("#selTherm");

  // Use the list of sample names to populate the select options
  d3.json("/thermal").then((therm_prop) => {
    therm_prop.forEach((therm) => {
      Therm_selector
        .append("option")
        .text(therm)
        .property("value", therm);
    });
  });

  var Fluid_selector = d3.select("#selFluid");

  // Use the list of sample names to populate the select options
  d3.json("/fluid").then((fluid_prop) => {
    fluid_prop.forEach((fluid) => {
      Fluid_selector
        .append("option")
        .text(fluid)
        .property("value", fluid);
    });
  });

  var Elec_selector = d3.select("#selElec");

  // Use the list of sample names to populate the select options
  d3.json("/electrical").then((elec_prop) => {
    elec_prop.forEach((elec) => {
      Elec_selector
        .append("option")
        .text(elec)
        .property("value", elec);
    });
  });

  // Use the first sample from the list to build the initial plots
  const firstLoad = "All";
  buildCharts();
  buildChord(firstLoad,firstLoad,firstLoad,firstLoad);
  
}

function MechOptionChanged(mech) {
  // Fetch new data each time a new sample is selected
  var therm = ds.select("#selTherm").node.value;
  var fluid = ds.select("#selFluid").node.value;
  var elec = ds.select("#selElec").node.value;
  buildChord(mech,therm,fluid,elec);
  buildCharts(newSample);
}

// Initialize the dashboard
init()


var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
