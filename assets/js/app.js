// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 660;

var chartMargin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom

var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`)
  .attr("class", "plot");

var chosenXAxis = "age";

function xScale(censusData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
    d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;
}

function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis
}

function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) - 14)

  return textGroup
}

function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "age") {
    var label = "Age";
  }
  else {
    var label = "Income";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
  })
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("/assets/data/data.csv")
  .then(function (censusData) {


    // Parse data; there's probably a less
    // verbose way to do this, find it.
    // ====================================
    censusData.forEach(function (data) {
      data.id = +data.id;
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareHigh = +data.healthcareHigh;
      data.healthcareLow = +data.healthcareLow;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesHigh = +data.smokesHigh;
      data.smokesLow = +data.smokesLow;
      //     Object.entries(data).forEach(([key,value])=>{
      //         value = +value;
      //     })
      // ====================================
    })
    // console.log(censusData);

    // Create scale functions
    // ======================
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.smokes)])
      .range([chartHeight, 0]);
    // ======================

    // Create axis functions
    // =====================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to chart
    // ====================
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);


    chartGroup.append("g")
      .call(leftAxis);

    // Create circles for scatter plot
    // ===============================

    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.smokes))
      .attr("r", 20)
      .attr("fill", "pink")
      .attr("fill-opacity", "0.5")
      

    var textGroup = chartGroup.selectAll(".text")
      .data(censusData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]) - 14)
      .attr("y", d => yLinearScale(d.smokes) + 7)
      .text(d => d.abbr)
    

    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "age")
      .classed("active", true)
      .text("Age");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Income");

    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartMargin.left)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Smoker Rate");

    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    

    labelsGroup.selectAll("text")
      .on("click", function () {
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
          chosenXAxis = value;
          xLinearScale = xScale(censusData, chosenXAxis);
          xAxis = renderAxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis);
          chartGroup = updateToolTip(chosenXAxis, chartGroup);
          

          if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          } else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    // // ===============================


  });