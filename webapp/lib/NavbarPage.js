const moment = require("moment");

const Page = require("./Page")
const PartialsRenderer = require("./PartialsRenderer")

class NavbarPage extends Page
{

  constructor(page_name) {

    super(page_name, "/");

    this.saved_plot_link_partial = new PartialsRenderer("saved_plot_link");
    this.select_plot_modal_partial = new PartialsRenderer("select_plot_modal");


    $(document).ready(()=>this.load());

  }

  async load()
  {

    await this.saved_plot_link_partial.load();


    await this.update_plot_instances();

    this.io.on("plot_update", (t)=>{
      this.update_plot_instances();
    })

  }

  async update_plot_instances()
  {

      let instances = await this.emit_io("get_plot_instances");

      $("#saved-plots").empty();

      instances.reverse().forEach((i)=>{
        this.saved_plot_link_partial.render_into("#saved-plots", i);
      })

      feather.replace({ 'aria-hidden': 'true' })
  }
}



module.exports = NavbarPage;
