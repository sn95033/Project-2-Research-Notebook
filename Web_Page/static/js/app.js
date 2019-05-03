function init() {
  // Grab a reference to the dropdown select element
  var propSelector = d3.select("#selProp");

  // Use the list of sample names to populate the select options
  d3.json("/properties").then((prop) => {
    prop.forEach((group) => {
      propSelector
        .append("option")
        .text(group)
        .property("value", group);
    });   
  });
  

  var compSelector = d3.select("#selComp");

  // Use the list of sample names to populate the select options
  d3.json("/composition").then((comp) => {
    comp.forEach((elem) => {
      compSelector
        .append("option")
        .text(elem)
        .property("value", elem);
    });
  });
  // Use the first sample from the list to build the initial plots
  buildChord();
  buildAuthorBar("All","All");
  buildJournalBar("All","All");
  buildBubble("All","All");
}

function buildChord() {
  
  var url = `/chord-data`
  d3.json(url).then(function(data) {
    
    var chordData= JSON.parse("[" + data.data + "]");
    console.log(chordData)

    var svg = d3.select("#pie")
      .append("svg")
        .attr("width", 600)
        .attr("height", 600)
      .append("g")
        .attr("transform", "translate(300,250)");

    // create a matrix
    var matrix = chordData

    var colors = [ "#00cc00","#008000", "#009900", "#00b300", "#00e600","#dbff33", "#a8ff33", "#ff8c00", "ff8a33","#EE9572", "#FFA54F", "#FFDAB9", "00cccc","00e6e6","#b3ecff","#00ffff","#80dfff","4dd2ff","#00e6e6","#00ace6", "#0086b3","006080","#000000"]
    //var colors = [ "#ff5733", "#ffbd33", "#dbff33", "#75ff33","#33ff57", "#33ffbd", "#ff8a33", "#fff033","#a8ff33", "#5733ff", "#33DBff", "#ffeae5","#bf4126", "#ffd5cc", "#ffab99", "#ff9680","#ff8166", "#FF6A6A", "#CD3333", "#B22222","#8B1A1A", "#B0171F", "#000000"]
    //var colors = [ "#104E8B", "#1E90FF", "#4682B4", "#B0E2FF","", "#5CACEE", "#B22222", "#8B1A1A","#FF6A6A", "#FF4040", "#B0171F", "#CD3333","#FF0000", "#FFFF00", "#00F5FF", "#FFD700","#00868B", "#EEB422", "#FFC125", "#FFA500","#FF8C00", "#000000"]

    //     properties = ["Compression Strength","Tensile Strength","Elastic Modulus","Shear Strength","Plasticity","Thermal Conductivity","Thermal Resistivity","Permeability","Pressure Drop","Electrical Resistivity","Electrical Conductivity","Capacitance","Aluminum","Carbon","Copper","Graphite","Iron","Nickel","Silicon","Silver","Tantalum","Titanium","model"]
    var names = data.labels

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (matrix)

    // add the groups on the inner part of the circle
    svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data(function(d) { return d.groups; })
      .enter()
      .append("g")
      .append("path")
        .style("fill", function(d,i){ return colors[i] })
        .style("stroke", "black")
        .attr("d", d3.arc()
          .innerRadius(230)
          .outerRadius(240)
        )

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    var tooltip = d3.select("#pie")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var showTooltip = function(d) {
      tooltip
        .style("opacity", 1)
        .html("Source: " + names[d.source.index] + "<br>Target: " + names[d.target.index])
        .style("left", (d3.event.pageX - 400) + "px")
        .style("top", (d3.event.pageY - 250) + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var hideTooltip = function(d) {
      tooltip
        .transition()
        .duration(5000)
        .style("opacity", 0)
    }

    // Add the links between groups
    svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data(function(d) { return d; })
      .enter()
      .append("path")
        .attr("d", d3.ribbon()
          .radius(220)
        )
        .style("fill", function(d){ return(colors[d.source.index]) })
        .style("stroke", "black")
      .on("mouseover", showTooltip )
      .on("mouseleave", hideTooltip )
  })
}

function buildAuthorBar(prop,comp) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/author-bar-data/${prop}/${comp}`
  d3.json(url).then(function(data) {

    var values = data.values
    var parsedValues = JSON.parse(values);
    var label = data.labels

    console.log(parsedValues)
    console.log(label)

    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: label.split(','),
          datasets: [{
              data: parsedValues,
              backgroundColor: [
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)'
              ],
              borderColor: [
                'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)',
                  'rgba(12, 51, 131, 0.9)'
              ],
              borderWidth: 1
          }],
      },
      options: {
        legend: { display: false},
        title: {
         display: true,
         text: "Number of Articles Published per Author"
        },
        scales: {
          yAxes: [{
              ticks: {
                  beginAtZero: true
              }
          }]
        }
      }
    });
  })
}

function buildJournalBar(prop,comp) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/journal-bar-data/${prop}/${comp}`
  d3.json(url).then(function(data) {

    var values = data.values
    var parsedValues = JSON.parse(values);
    var label = data.labels

    console.log(parsedValues)
    console.log(label)

    var ctx = document.getElementById('myChartB').getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: label.split(','),
          datasets: [{
              data: parsedValues,
              backgroundColor: [
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)'
              ],
              borderColor: [
                'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)',
                  'rgba(242, 143, 56, 0.9)'
              ],
              borderWidth: 1
          }],
      },
      options: {
        legend: { display: false},
        title: {
         display: true,
         text: "Number of Articles Published per Journal"
        },
        scales: {
          yAxes: [{
              ticks: {
                  beginAtZero: true
              }
          }]
        }
      }
    });
  })
}

function buildBubble(prop,comp) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/bubble-data/${prop}/${comp}`
  d3.json(url).then(function(data) {
    
    var ids = data.year;
    var labels = data.title;
    var values = data.citations;

    // @TODO: Build a Bubble Chart using the sample data
    let bubbleData = [
      {
        x: ids,
        y: values,
        text: labels,
        mode: 'markers',
        marker: {
          size: '5px',
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

function PropOptionChanged(prop) {
  // Fetch new data each time a new sample is selected
  var comp = d3.select("#selComp").node().value

  Plotly.deleteTraces('bubble', 0)

  buildAuthorBar(prop,comp);
  buildJournalBar(prop,comp);
  buildBubble(prop,comp);
  
}

function CompOptionChanged(comp) {
  // Fetch new data each time a new sample is selected
  var prop = d3.select("#selProp").node().value

  Plotly.deleteTraces('bubble', 0)

  buildAuthorBar(prop,comp);
  buildJournalBar(prop,comp);
  buildBubble(prop,comp);
}

// Initialize the dashboard
init()

