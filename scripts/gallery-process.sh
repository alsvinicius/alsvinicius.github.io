#!/usr/bin/env bash
set -euo pipefail
action=$1 pid_file=$2 log_file=$3 port=$4
shift 4
mkdir -p "$(dirname "$pid_file")" "$(dirname "$log_file")"
listening() { ss -ltn "sport = :$port" 2>/dev/null | tail -n +2 | grep -q .; }

case "$action" in
  start)
    if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null && listening; then
      echo "Portfolio já está disponível em http://127.0.0.1:$port"
      exit 0
    fi
    if listening; then echo "Porta $port ocupada por um processo externo." >&2; exit 1; fi
    rm -f "$pid_file"
    nohup setsid "$@" >"$log_file" 2>&1 </dev/null &
    pid=$!
    echo "$pid" >"$pid_file"
    for _ in $(seq 1 30); do
      if listening; then echo "Portfolio disponível em http://127.0.0.1:$port"; exit 0; fi
      if ! kill -0 "$pid" 2>/dev/null; then break; fi
      sleep 0.1
    done
    cat "$log_file" >&2
    kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    rm -f "$pid_file"
    echo "O servidor não abriu a porta $port." >&2
    exit 1
    ;;
  stop)
    if [[ ! -f "$pid_file" ]]; then echo "Portfolio não está rodando"; exit 0; fi
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
      for _ in $(seq 1 50); do kill -0 "$pid" 2>/dev/null || break; sleep 0.1; done
      if kill -0 "$pid" 2>/dev/null; then kill -KILL -- "-$pid" 2>/dev/null || true; fi
      echo "Portfolio parado (PID $pid)"
    else
      echo "Servidor já estava parado"
    fi
    rm -f "$pid_file"
    ;;
  *) echo "Uso: gallery-process.sh start|stop PID_FILE LOG_FILE PORT COMMAND [ARGS...]" >&2; exit 2 ;;
esac
