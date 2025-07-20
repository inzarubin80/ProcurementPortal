#!/bin/sh

if [ -f "/init" ]; then
    /init &
fi

if [ "$#" -eq 0 ]; then
    exec /code-executor-server
else
    exec "$@"
fi