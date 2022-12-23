const moment = require("moment")

function formatted_time()
{
  return moment().format("HH:mm:ss.SS");
}

class Log
{
  constructor(name)
  {
    this.visualization_type = "logger";
    this.entries = [];
    this.name = name;
  }

  write(level, message)
  {
    this.entries.push({milis: Date.now(), time: formatted_time(), level, message})
  }

  info(message)
  {
    this.write("info", message)
  }

  warn(message)
  {
    this.write("warn", message)
  }

  error(message)
  {
    this.write("error", message)
  }
}

class Test
{

  static name = "Default Name";
  static description = "Default Description";

  #managers;

  constructor(managers, title, id)
  {
    this.title = title
    this.id = id
    this.output = []
    this.state="created";
    this.progress = 0;
    this.log = this.create_log("Default Logger")
    this.#managers = managers;
  }

  get relays()
  {
    return this.#managers.relay_manager;
  }

  get webcam()
  {
    return this.#managers.webcam;
  }

  async run()
  {

  }

  async _run()
  {
      this.state="running";
      await this.run()

      this.state="completed";
      this.progress = 1;
  }

  create_log(name)
  {
    let log = new Log(name)
    this.output.push(log)
    return log;
  }

  async wait(duration)
  {
    return new Promise((resolve, reject)=>{
      setTimeout(resolve, duration)
    })
  }
}

module.exports = Test
