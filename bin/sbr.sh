#!/usr/bin/env bash

#Если ссылка автоматически не сформировалась, можно установить её вручную командами
#chmod ugo+x /usr/local/lib/node_modules/sbr/sbr.sh
#ln -s /usr/local/lib/node_modules/sbr/sbr.sh /usr/local/bin/sbr
#ln -s /private/var/www/packajes/sbr/index.js /usr/local/bin/sbr
declare -a PARAMS_ARRAY

count=1
while [ -n "$1" ]
do
PARAMS_ARRAY[$count]=$1
count=$((count+1))
shift
done

DIRNAME=`pwd`
#/usr/local/lib/node_modules/sbr/index.js $DIRNAME "${PARAMS_ARRAY[@]}"
/private/var/www/packajes/sbr/index.js $DIRNAME "${PARAMS_ARRAY[@]}"
