const moment = require("moment");

const Page = require("./Page")
const PartialsRenderer = require("./PartialsRenderer")
const sp = require("@novadynamics/streamplot")

class PlotInstancePage extends Page
{

  constructor(page_name) {

    super(page_name, "/");

    if (!this.on_correct_page(true))
      return

    //HACK -- The nav-bar loads after this class, so we need a timeout to set the nav-item to active
    setTimeout(()=>this.page_link_element.addClass("active"), 500);

    this.plot_id = this.search_params.page.split("-").slice(1).join("-");

    this.plot_instance_partial = new PartialsRenderer("plot_instance");
    this.labeled_container_partial = new PartialsRenderer("labeled_container");


    this.io.on("datastate_update", (datastates)=>{

      if (!this.sp_window) return;

      this.sp_window.fields.forEach((f)=>{
        Object.keys(datastates).forEach((dsid)=>{
          let local_ds = f.select_datastate_by_id(dsid)
          if (local_ds) Object.assign(local_ds, datastates[dsid])
        })
        
        
      })

    })

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
    this.sp_window = new sp.Window(plot_instance_html, {redraw_time_ms: instance.duty_cycle})

    instance.fields.forEach((f)=>{

      let ax = new sp[f.class_name](this.sp_window, f.bbox, f.config);

      f.elements.forEach((e)=>{
        let ds = new sp.DataState[e.datastate.class_name]({})
        Object.assign(ds, e.datastate)

        let el = new sp.Element[e.class_name](ds, {})

        Object.assign(el, {...e, datastate: ds});

        ax.add_element(el)
      })
    })

    this.sp_window.init()
    this.sp_window.start()

  }

}



module.exports = PlotInstancePage;
