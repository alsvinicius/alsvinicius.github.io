PAGE_PORT ?= 4178
RUNTIME_DIR := .runtime
PID_FILE := $(RUNTIME_DIR)/server.pid

.PHONY: start stop

start:
	@mkdir -p $(RUNTIME_DIR)
	@if [ -f "$(PID_FILE)" ] && kill -0 "$$(cat $(PID_FILE))" 2>/dev/null; then \
		echo "Portfolio já está rodando (PID $$(cat $(PID_FILE)))"; \
	else \
		nohup python3 -m http.server "$(PAGE_PORT)" --bind 127.0.0.1 --directory . > $(RUNTIME_DIR)/server.log 2>&1 & \
		echo $$! > "$(PID_FILE)"; \
		echo "Portfolio disponível em http://127.0.0.1:$(PAGE_PORT)"; \
	fi

stop:
	@if [ -f "$(PID_FILE)" ]; then \
		pid="$$(cat $(PID_FILE))"; \
		if kill -0 "$$pid" 2>/dev/null; then kill "$$pid" && echo "Portfolio parado (PID $$pid)"; else echo "Servidor já estava parado"; fi; \
		rm -f "$(PID_FILE)"; \
	else echo "Portfolio não está rodando"; fi
