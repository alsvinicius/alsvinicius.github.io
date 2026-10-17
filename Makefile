-include .project-gallery.mk

# Accept generic assignments from older Project Gallery catalogues.
PAGE_PORT ?= $(if $(PORT),$(PORT),4178)
RUNTIME_DIR := .runtime
PID_FILE := $(RUNTIME_DIR)/server.pid
LOG_FILE := $(RUNTIME_DIR)/server.log
PROCESS := scripts/gallery-process.sh

.PHONY: start stop

start:
	@bash $(PROCESS) start $(PID_FILE) $(LOG_FILE) $(PAGE_PORT) python3 -m http.server $(PAGE_PORT) --bind 127.0.0.1 --directory .

stop:
	@bash $(PROCESS) stop $(PID_FILE) $(LOG_FILE) $(PAGE_PORT)
