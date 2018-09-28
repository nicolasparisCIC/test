#!/bin/bash

while IFS='' read -r line || [[ -n "$line" ]]; do
    echo "{\"macAddress\":\"$line\"},"
done < "$1"
