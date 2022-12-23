window.$ = require("jquery");
window.jQuery = window.$;

feather.replace({ 'aria-hidden': 'true' })

const IO = require("socket.io-client");
const PartialsRenderer = require("./lib/PartialsRenderer")


let io = IO("/");


//new (require("./lib/DashboardPage"))("dashboard");
new (require("./lib/NavbarPage"))("*");
new (require("./lib/PlotInstancePage"))("plot-");
