const Test = require("../lib/Test.js")

class Solenoid_Stress_2h extends Test
{
  static name = "Solenoid Stress 2h";
  static description = "Stress test a solenoid (or actuator) for 2 hours"

  constructor(managers, title, id)
  {
      super(managers, title, id);
  }

  async run()
  {
    this.log.info("Started");

    let sec = 2*60*60

    for (let i=0;i<sec;i++)
    {
        this.progress = i/sec;
        await this.wait(1000)
        this.relays.set_relay(1, !this.relays.get_relay(1));
    }
  }
}

module.exports = Solenoid_Stress_2h;
