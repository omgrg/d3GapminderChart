import * as d3 from "d3";

let margin = {top: 50, right: 20, bottom: 100, left: 80};
let width = 800 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

let svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

let g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//Y Axis Text
let yLabel = g.append('text')
    .attr('x', -170)
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px')
    .attr('transform', 'rotate(-90)')
    .text('Life Expectancy (years)');

//X Axis Text
let xLabel = g.append('text')
    .attr('x', width / 2)
    .attr('y', height + 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text('GDP Per Capita ($)');

//Timeline Text
let timeLabel = g.append('text')
    .attr('x', width - 40)
    .attr('y', height - 10)
    .attr('font-size', "40px")
    .attr('opacity', '0.4')
    .attr('text-anchor', 'middle')
    .text('1800');


//Scales
let y = d3.scaleLinear().domain([0, 90]).range([height, 0]);
let x = d3.scaleLog().base(10).domain([142, 150000]).range([0, width]);
let area = d3.scaleLinear().domain([2000, 1400000000]).range([25*Math.PI, 1500*Math.PI]);
let continentColor = d3.scaleOrdinal(d3.schemePastel1);


//X Axis
let xAxisCall = d3.axisBottom(x).tickValues([400, 4000, 40000]).tickFormat(d3.format("$"));
g.append('g').attr("transform", "translate(0," + height + ")").call(xAxisCall);

//Y Axis
let yAxisCall = d3.axisLeft(y).tickFormat(function(d){return +d;});
g.append('g').call(yAxisCall);


let time = 0;

d3.json('data/data.json').then(function (data) {


    const formattedData = data.map(function (year) {
        return year['countries'].filter(function (country) {
            let dataExists = (country.income && country.life_exp);
            return dataExists;
        }).map(function (country) {
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;
        });

    });


    d3.interval(function () {
        time = (time < 214) ? time + 1 : 0;
        update(formattedData[time]);

    }, 100);

    update(formattedData[0]);


});

function update(data) {
    let t = d3.transition().duration(100);

    let circles = g.selectAll('circle').data(data, function (d) {
        return d.country;
    });

    circles.exit().remove();

    circles.enter()
        .append('circle')
        .attr("fill", function (d) {
            return continentColor(d.continent);
        })
        .merge(circles)
        .transition(t)
        .attr('cx', function (d) {
            return x(d.income);
        })
        .attr('cy', function (d) {
            return y(d.life_exp);
        })
        .attr('r', function (d) {
            return Math.sqrt(area(d.population)/Math.PI);
        });


    timeLabel.text(time + 1800);

}

