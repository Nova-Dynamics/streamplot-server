const Chart = require("chart.js")
const { v4: uuidv4 } = require('uuid');

class Metric
{

  constructor(name, partial) {
    this.id = uuidv4();
    this.name = name;
    this.partial = partial;
    this.data = []
    this.result = null
  }

  load(data)
  {
    this.data = data;
    return this;
  }

  process(cb)
  {
    this.result = cb(this.data);
    return this;
  }

  display(container)
  {
    let html = this.partial.render_into(container, this);
    return this;
  }
}



module.exports = Metric;
