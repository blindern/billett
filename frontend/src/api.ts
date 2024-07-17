// TODO(migrate): Support BACKEND_URL env override.
const BACKEND_URL = "/"

export let backendUrl = BACKEND_URL

if (backendUrl.includes("SAMEHOST")) {
  backendUrl = backendUrl.replace("SAMEHOST", window.location.hostname)
}

// if using default port used for local dev, assume backend is at port 8081
if (backendUrl === "/" && window.location.port === "3000") {
  backendUrl =
    window.location.protocol + "//" + window.location.hostname + ":8081/"
}

if (!backendUrl.includes("//")) {
  let seperator = backendUrl.substring(0, 1) === "/" ? "" : "/"
  backendUrl = window.location.origin + seperator + backendUrl
}

export function api(url: string) {
  return backendUrl + "api/" + url // see webpack config
}
