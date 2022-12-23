const IO = require("socket.io-client");

class Page
{

  constructor(page_name, io_path) {
    this.page_name = page_name;

    this.io = IO(io_path);

    this.search_params = Object.fromEntries((new URLSearchParams(window.location.search)).entries());

  }

  get page_link_element()
  {
    return $(`a[href="?page=${this.page_name}"]`)
  }

  on_correct_page(allow_null=false)
  {
    this.page_link_element.addClass("active");
    if (allow_null && !this.search_params.page)
    {
      this.page_link_element.addClass("active");
      return true;
    }

    if (this.search_params.page.startsWith(this.page_name))
    {
      this.page_name = this.search_params.page;
      this.page_link_element.addClass("active");
      return true;
    }


    this.page_link_element.removeClass("active");
    return false;
  }

  on_page(page)
  {
    let path = window.location.pathname;
    var p = path.split("/").pop();
    return (page == path || p == page || p.split(".")[0] == page)
  }

  emit_io()
  {
    if (arguments.length < 1)
      throw new Error("Invalid arguments")

      return new Promise((resolve, reject)=>{

        this.io.emit(...arguments, ({ data, error })=>{
          if (error)
            reject(error);
          else
            resolve(data);
        })
      })
  }

}



module.exports = Page;
