import { numberOfRepositories } from 'api';
import * as d3 from 'd3';
import { schemeCategory10 } from 'd3-scale';

const languages = ['ruby', 'javascript', 'java', 'go', 'elixir',
                   'haskell', 'c', 'cpp', 'lua', 'python'];

const maxDiameter = 500;
const forceStrength = 0.0063;
const color = d3.scaleOrdinal(schemeCategory10);

const renderChart = (data) => {
  const radiusScale = d3.scalePow()
    .exponent(0.5)
    .range([2, maxDiameter * 0.3])
    .domain([0, 50 * d3.max(data, (d) => d.amount)]);

  const svg = d3.select('body')
    .append('svg')
    .attr('width', maxDiameter)
    .attr('height', maxDiameter)
    .attr('class', 'bubbles');

  const charge = (d) => {
    Math.pow(d.radius, 2.0) * forceStrength;
  }

  const ticked = () => {
    svg.selectAll('.bubble')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);
  }

  const simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(maxDiameter / 2))
    .force('y', d3.forceY().strength(forceStrength).y(maxDiameter / 2))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  let nodes = data.map((d) => {
    return {
      radius: radiusScale(d.amount),
      x: Math.random() * maxDiameter,
      y: Math.random() * maxDiameter,
      amount: d.amount,
      name: d.name
    };
  });

  let bubbles = svg.selectAll('.bubble')
    .data(nodes, (d) => d.id);

  let bubblesE = bubbles
    .enter()
    .append('circle')
    .classed('bubble', true)
    .attr('r', 0)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .style('fill', (d) => color(d.amount));

  bubbles = bubbles.merge(bubblesE);

  bubbles.transition()
    .duration(2000)
    .attr('r', (d) => d.radius);

  simulation.nodes(nodes);
}

const fetchData = () => {
  let data = [];

  return new Promise((resolve, _) =>{
    languages.forEach((lang) =>{
      numberOfRepositories(lang).then((number) => {
        console.log(`${lang} has ${number} repos on github.`)
        data.push({ name: lang, amount: number });
      })
    });
    resolve(data);
  });
}

export function App(){
  return {
    render: (container)=>{
      fetchData().then((data) => {
        renderChart(data);
      });
    }
  };
}
