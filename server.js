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


let plot_instances = [];


(async ()=>{

    // Set up webservice
    server.on("request", app);

    app
        .use(body_parser.json({ limit: '100mb' })) 

        //.use(morgan(':remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', { "stream" : info_log_stream }))   // Morgan HTTP logging
        .use(express.static("webapp/public/")); // serve index.html on `GET /`


    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
        next();
    });

    app.post('/add_plot_instance', (req, res) => {
        const plot_inst = req.body.plot_instance;

        if (!plot_inst || !plot_inst.id) {
          return res.status(400).send({ error: 'Missing required fields' });
        }
      
        let existing_plot_index = plot_instances.findIndex((plot) => plot.id === plot_inst.id);
        if (existing_plot_index >= 0) {
          plot_instances[existing_plot_index] = plot_inst;
        } else {
          plot_instances.push(plot_inst);
        }
      
        return res.send({ message: 'Plot instance added or updated successfully', url:  "http://" + server.address().address + ":" + server.address().port + "/?page=plot-"+plot_inst.id});
      });

    app.post('/plot/:plot_id/datastate_update', (req, res) => {
        const plot_id = req.params.plot_id;
        const datastates = req.body.datastates;

        
        let pl = plot_instances.find((plot) => plot.id == plot_id);
      
        if (pl)
        {
            pl.fields.forEach((f)=>{
                f.elements.forEach((e)=>{
                    if (datastates[e.datastate.id]) Object.assign(e.datastate, datastates[e.datastate.id])
                })
            })
        }
        

        io_server.emit("datastate_update", datastates)
    
        return res.send({success: true});
    });
      



    let port = 1234;
    server.listen(port, "127.0.0.1", () => {
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


    });




})().catch((e)=>{

    log.error(e);

});

function get_template_info(t)
{
  return {name: t.name, description: t.description, template_index: t.template_index}
}
