import jQuery from "jquery"

declare global {
  interface Window {
    jQuery: typeof jQuery
  }
}

window.jQuery = jQuery
