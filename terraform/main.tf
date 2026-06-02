terraform {
  required_providers {
    lxd = {
      source = "terraform-lxd/lxd"
    }
  }
}

resource "lxd_container" "kpi_db" {
  name      = "kpi-db"
  image     = "ubuntu:24.04"
  ephemeral = false

  config = {
    "boot.autostart" = "true"
  }
}

resource "lxd_container" "kpi_worker" {
  name      = "kpi-worker"
  image     = "ubuntu:24.04"
  ephemeral = false

  config = {
    "boot.autostart" = "true"
  }
}
