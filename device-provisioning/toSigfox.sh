#!/bin/bash

while IFS='' read -r line || [[ -n "$line" ]]; do
    line="${line/,/;}"
    echo "$line"
done < "$1"
