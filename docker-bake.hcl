group "default" {
  targets = ["Blackboxf1", "Blackboxf1-api", "Blackboxf1-realtime"]
}

group "arm64" {
  targets = ["Blackboxf1", "Blackboxf1-api", "Blackboxf1-realtime"]
  platforms = ["linux/arm64"]
}

group "amd64" {
  targets = ["Blackboxf1", "Blackboxf1-api", "Blackboxf1-realtime"]
  platforms = ["linux/amd64"]
}

group "all" {
  targets = ["Blackboxf1", "Blackboxf1-api", "Blackboxf1-realtime"]
  platforms = ["linux/arm64", "linux/amd64"]
}

target "docker-metadata-action" {}

// actual servives and images below

target "Blackboxf1" {
  inherits = ["docker-metadata-action"]

  context = "./dashboard"
  dockerfile = "dockerfile"

  # tags = ["ghcr.io/FocusFV/Blackboxf1:latest"]
}

target "Blackboxf1-api" {
  inherits = ["docker-metadata-action"]

  context = "."
  dockerfile = "dockerfile"
  target = "api"

  # tags = ["ghcr.io/FocusFV/Blackboxf1-api:latest"]
}

target "Blackboxf1-realtime" {
  inherits = ["docker-metadata-action"]

  context = "."
  dockerfile = "dockerfile"
  target = "realtime"

  # tags = ["ghcr.io/FocusFV/Blackboxf1-realtime:latest"]
}
