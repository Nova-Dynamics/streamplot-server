const moment = require("moment");

const Page = require("./Page")
const PartialsRenderer = require("./PartialsRenderer")


class DashboardPage extends Page
{

  constructor(page_name) {

    super(page_name, "/");

    if (!this.on_correct_page(true))
      return

    this.dashboard_partial = new PartialsRenderer("dashboard");
    this.labeled_container_partial = new PartialsRenderer("labeled_container");
    this.relay_partial = new PartialsRenderer("relay_toggle");

    $(document).ready(()=>this.load());

  }

  async load()
  {

    await this.dashboard_partial.load();
    await this.labeled_container_partial.load();
    await this.relay_partial.load();

    let dashboard_html = this.dashboard_partial.render_into("#main-content", {});

    let relays = await this.emit_io("get_all_relays");

    let relay_container = this.labeled_container_partial.render_into("#main-content", {name: "Relays"});

    relays.forEach((r, i)=>{
      let r_html = this.relay_partial.render_into(relay_container.children("div"), {index: i, value: r})
      let self=this;
      r_html.find("button").click(async ()=>{
        relays[i] = await self.emit_io("set_relay", i, !relays[i]);
        r_html.find("button")
        .html(relays[i] ? "ON" : "OFF")
        .removeClass("color-on")
        .removeClass("color-off")
        .addClass(relays[i] ? "color-on" : "color-off")

      });
    });

    let webcam_container = this.labeled_container_partial.render_into("#main-content", {name: "Webcam"});
    let webcam_html = $('<div id="webcam" style="padding: 10px;display: flex;justify-content: center"><img></div>');
    $(webcam_container).append(webcam_html);

    this.io.on("webcam", (webcam)=>{ webcam_html.find("img").attr("src", webcam) })



  }

}



module.exports = DashboardPage;
