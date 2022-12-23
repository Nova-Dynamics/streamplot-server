var Gpio = require('onoff').Gpio;

class RelayManager
{

  constructor(config) {
    this.relay_pins = config.pins;
    this.relays = this.relay_pins.map((p)=>new Gpio(p, 'out'))
  }

  get_all_relays()
  {
    return this.relays.map((p, i)=>this.get_relay(i));
  }

  get_relay(id)
  {
    return (this.relays[id].readSync() != 0)
  }

  set_relay(id, value)
  {
    this.relays[id].writeSync(value || value > 0 ? 1 : 0);
    return !!(value || value > 0)
  }


}



module.exports = RelayManager;
