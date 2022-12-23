const Test = require("../lib/Test.js")

class Blink_1s_R0 extends Test
{
  static name = "Blink Test";
  static description = "Blinks Relay 0 for 1 second."

  constructor(managers, title, id)
  {
      super(managers, title, id);
  }

  async run()
  {
    this.log.info("Started");

    for (let i=0;i<4;i++)
    {
        await this.wait(250)
        let v = this.relays.get_relay(0);
        this.log.info("Relay 0 Set to " + (!v ? "ON" : "OFF"));
        this.relays.set_relay(0, !v);
    }
  }
}

module.exports = Blink_1s_R0;
