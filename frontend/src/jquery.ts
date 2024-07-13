import jQuery from "jquery/dist/jquery.js"

declare global {
  interface Window {
    jQuery: any
  }
}

window.jQuery = jQuery
