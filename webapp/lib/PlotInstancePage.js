const moment = require("moment");

const Page = require("./Page")
const PartialsRenderer = require("./PartialsRenderer")


class plotInstancePage extends Page
{

  constructor(page_name) {

    super(page_name, "/");

    if (!this.on_correct_page(true))
      return

    //HACK -- The nav-bar loads after this class, so we need a timeout to set the nav-item to active
    setTimeout(()=>this.page_link_element.addClass("active"), 500);

    this.plot_id = this.search_params.page.split("-")[1];
    this.plot_instance_partial = new PartialsRenderer("plot_instance");
    this.labeled_container_partial = new PartialsRenderer("labeled_container");


    // this.io.on("plot_update", (t)=>{
    //   if (t.id == this.plot_id)
    //     this.render_plot(t)

    // })

    this.logger_partial = new PartialsRenderer("logger");

    $(document).ready(()=>this.load());

  }

  async load()
  {

    await this.plot_instance_partial.load();
    await this.labeled_container_partial.load();
    await this.logger_partial.load();

    let instance = await this.emit_io("get_plot_instance", this.plot_id);
    await this.render_plot(instance);


  }

  async render_plot(instance)
  {

    $("#main-content").empty();
    let plot_instance_html = this.plot_instance_partial.render_into("#main-content", instance);

    instance.output.forEach((output)=>{

      switch (output.visualization_type) {
        case 'logger':
          this.logger_partial.render_into(plot_instance_html, output);

          let logger_window = plot_instance_html.find(".logger-window");
          logger_window.scrollTop(logger_window[0].scrollHeight);

          break;
        default:
          return
      }

    })
  }

}



module.exports = plotInstancePage;
