const server=require("http").createServer();
const express=require('express');
const app = express();
const morgan=require('morgan');
const log = require("bunyan").createLogger({name:"streamplot-server"});
const nconf = require('nconf');
const stream=require('stream');
const body_parser = require("body-parser");
const https = require('https');
const IO = require('socket.io')
const crypto=require("crypto");
const fs = require("fs");
const path = require("path");

// Read the config, exit on error
nconf.argv().file({ file: 'config.json' });

if (!nconf.get('log-level')) {
    console.log("Invalid config (log-level) - please make sure config.json exists and is correct. Exiting...");
    process.exit(1);
}
log.level(nconf.get('log-level'));


// A stream to pipe morgan (http logging) to bunyan
let info_log_stream = new stream.Writable();
info_log_stream._write=(chunk, encoding, done) => {

    log.info(chunk.toString().replace(/^[\r\n]+|[\r\n]+$/g,""));
    done();
};


let plot_instances = [
    {title: "Fake Instance", id:10}
];


(async ()=>{

    // Set up webservice
    server.on("request", app);

    app
        .use(body_parser.urlencoded({extended: false})) // Middleware for POST body parsing (use x-www-form-urlencoded). We would like to use this on a per-router basis, but it inhibits our ability to check body auth (below)
    // .use(Auth.meddle)   // Check auth

        .use(morgan(':remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', { "stream" : info_log_stream }))   // Morgan HTTP logging
        .use(express.static("webapp/public/")); // serve index.html on `GET /`


    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
        next();
    });



    let port = 80;
    server.listen({port: port}, () => {
      log.info(`Example app listening on port ${port}`)
    })

    // Set up socket.io server
    let io_server = IO(server);



    io_server.on('connection', (sock) => {


      sock.on('get_plot_instances', (cb) => {
        return cb({data: plot_instances.map((t)=>({...t.constructor, ...t})), error:null} )
      });

      sock.on('get_plot_instance', (id, cb) => {
        if (id)
        {
          let plot = plot_instances.find((t)=>t.id==id);

          if (plot)
            return cb({data: ({...plot.constructor, ...plot}), error:null} )
          else
            return cb({data: null, error: "plot with that ID not found"} )

        }
        else
        {
          return cb({data: null, error: "Invalid ID"} )
        }

      });

      sock.on('create_plot_instance', (template_index, name, cb) => {
        let plot = new plot_templates[template_index](managers, name, plot_instances.length);
        plot._run();
        plot_instances.push(plot);
        return cb({data: plot_instances.map((t)=>({...t.constructor, ...t})), error:null} )
      });
    });




})().catch((e)=>{

    log.error(e);

});

function get_template_info(t)
{
  return {name: t.name, description: t.description, template_index: t.template_index}
}
