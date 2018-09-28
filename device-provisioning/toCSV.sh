#!/bin/bash

starting=true
while IFS='' read -r line || [[ -n "$line" ]]; do
    if [[ "$starting" != "true" ]]; then
      echo -n ","
    fi
    starting=false
    id=${line%,*}
    echo -n "$id"
done < "$1"
