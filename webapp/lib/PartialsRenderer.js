const Mustache = require("mustache");
const $ = window.$;


class PartialsRenderer
{

  constructor(filepath) {

    if (!filepath.endsWith(".html")) filepath += ".html";

    this.filepath = filepath;

  }

  async load()
  {
    this.template = await new Promise((res, rej) => $.get("partials/"+this.filepath, res));
    return this;
  }

  render(data)
  {
    return $(Mustache.render(this.template, data))
  }

  render_into(selector, data)
  {
    let el = this.render(data);
    $(selector).append(el);
    return el;
  }
}



module.exports = PartialsRenderer;
