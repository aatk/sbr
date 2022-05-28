#!/usr/bin/env bash

#ln -s /usr/local/lib/node_modules/sbr/index.js /usr/local/bin/sbr
declare -a PARAMS_ARRAY

count=1
while [ -n "$1" ]
do
PARAMS_ARRAY[$count]=$1
count=$((count+1))
shift
done

echo "${PARAMS_ARRAY[@]}"

DIRNAME=`pwd`
echo "DIRNAME $DIRNAME"
/usr/local/lib/node_modules/sbr/index.js $DIRNAME "${PARAMS_ARRAY[@]}"
