#!/bin/bash

MSG=$(node index.js)

if [ ${#MSG} -ge 5 ]; then
  echo $MSG | mail -s "Wohnungen" $MAILTO
fi
